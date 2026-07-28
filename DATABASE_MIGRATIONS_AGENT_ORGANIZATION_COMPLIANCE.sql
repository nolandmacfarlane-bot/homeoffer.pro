-- HomeOffer.pro agent organization, production and compliance system
-- Date: July 27, 2026
--
-- Core rules implemented:
-- 1. Agent production, rewards and sponsorship history are permanent records.
-- 2. A missed subscription renewal immediately removes new-listing access.
-- 3. Sixty continuous days of unpaid membership forfeits the agent's downline.
--    Their direct agents roll up to the nearest sponsor and are not restored later.
-- 4. Confirmed refusal to pay an earned platform fee permanently bans the account.
-- 5. Other rule violations can be documented, suspended or permanently banned by an admin.
-- 6. Every status and organization change is written to an audit table.

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referred_by_agent_id uuid NULL,
  ADD COLUMN IF NOT EXISTS original_sponsor_agent_id uuid NULL,
  ADD COLUMN IF NOT EXISTS referral_code text NULL,
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS organization_eligible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS organization_forfeited_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS organization_restarted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS ban_reason text NULL,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS suspension_reason text NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_referred_by_agent_id_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_referred_by_agent_id_fkey
      FOREIGN KEY (referred_by_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_original_sponsor_agent_id_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_original_sponsor_agent_id_fkey
      FOREIGN KEY (original_sponsor_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique_idx
  ON public.users (upper(referral_code))
  WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_referred_by_agent_idx
  ON public.users (referred_by_agent_id);
CREATE INDEX IF NOT EXISTS users_agent_account_status_idx
  ON public.users (account_status, organization_eligible)
  WHERE user_type = 'agent';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_account_status_check'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_account_status_check
      CHECK (account_status IN ('active', 'suspended', 'permanently_banned'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.agent_memberships (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive',
  stripe_customer_id text NULL,
  stripe_subscription_id text NULL,
  current_period_end timestamptz NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  delinquent_since timestamptz NULL,
  organization_forfeiture_processed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_memberships
  ADD COLUMN IF NOT EXISTS delinquent_since timestamptz NULL,
  ADD COLUMN IF NOT EXISTS organization_forfeiture_processed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS agent_memberships_enforcement_idx
  ON public.agent_memberships (delinquent_since)
  WHERE status IN ('past_due', 'unpaid', 'delinquent')
    AND organization_forfeiture_processed_at IS NULL;

CREATE TABLE IF NOT EXISTS public.agent_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  property_id uuid NULL REFERENCES public.properties(id) ON DELETE SET NULL,
  transaction_role text NOT NULL DEFAULT 'listing_agent',
  status text NOT NULL DEFAULT 'pending',
  sale_price numeric(14, 2) NULL,
  closed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_transactions
  ADD COLUMN IF NOT EXISTS property_id uuid NULL,
  ADD COLUMN IF NOT EXISTS transaction_role text NOT NULL DEFAULT 'listing_agent',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sale_price numeric(14, 2) NULL,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS agent_transactions_agent_closed_idx
  ON public.agent_transactions (agent_id, closed_at DESC)
  WHERE status IN ('closed', 'paid');

CREATE TABLE IF NOT EXISTS public.agent_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  producing_agent_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  transaction_id uuid NULL REFERENCES public.agent_transactions(id) ON DELETE SET NULL,
  tier smallint NOT NULL,
  amount numeric(12, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz NULL
);

ALTER TABLE public.agent_rewards
  ADD COLUMN IF NOT EXISTS producing_agent_id uuid NULL,
  ADD COLUMN IF NOT EXISTS transaction_id uuid NULL,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS agent_rewards_beneficiary_idx
  ON public.agent_rewards (beneficiary_agent_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.platform_fee_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  property_id uuid NULL REFERENCES public.properties(id) ON DELETE SET NULL,
  transaction_id uuid NULL REFERENCES public.agent_transactions(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz NULL,
  disputed_at timestamptz NULL,
  dispute_notes text NULL,
  nonpayment_confirmed_at timestamptz NULL,
  nonpayment_confirmed_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  permanent_ban_processed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_fee_obligations_enforcement_idx
  ON public.platform_fee_obligations (nonpayment_confirmed_at)
  WHERE nonpayment_confirmed_at IS NOT NULL
    AND permanent_ban_processed_at IS NULL;
CREATE INDEX IF NOT EXISTS platform_fee_obligations_agent_idx
  ON public.platform_fee_obligations (agent_id, due_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_sponsorship_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  sponsor_agent_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  end_reason text NULL,
  changed_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS agent_sponsorship_history_agent_idx
  ON public.agent_sponsorship_history (agent_id, started_at DESC);
CREATE INDEX IF NOT EXISTS agent_sponsorship_history_sponsor_idx
  ON public.agent_sponsorship_history (sponsor_agent_id, started_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS agent_sponsorship_one_active_idx
  ON public.agent_sponsorship_history (agent_id)
  WHERE ended_at IS NULL;

CREATE TABLE IF NOT EXISTS public.agent_status_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  event_type text NOT NULL,
  previous_status text NULL,
  new_status text NULL,
  reason text NOT NULL,
  actor_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_status_audit_agent_idx
  ON public.agent_status_audit (agent_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_compliance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  rule_code text NOT NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'review',
  decision text NOT NULL DEFAULT 'pending',
  reason text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_by uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_compliance_events_agent_idx
  ON public.agent_compliance_events (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_compliance_events_pending_idx
  ON public.agent_compliance_events (decision, created_at)
  WHERE decision = 'pending';

CREATE OR REPLACE FUNCTION public.is_homeoffer_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = p_user_id
      AND user_type = 'admin'
      AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_agent_sponsor(sponsor_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid := auth.uid();
  v_sponsor_id uuid;
BEGIN
  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id INTO v_sponsor_id
  FROM public.users
  WHERE upper(referral_code) = upper(trim(sponsor_code))
    AND user_type = 'agent'
    AND account_status = 'active'
    AND organization_eligible = true;

  IF v_sponsor_id IS NULL THEN
    RAISE EXCEPTION 'Sponsor code is invalid or the sponsor is not eligible';
  END IF;

  IF v_sponsor_id = v_agent_id THEN
    RAISE EXCEPTION 'An agent cannot sponsor themselves';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_agent_id
      AND referred_by_agent_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'This agent already has a sponsor';
  END IF;

  UPDATE public.users
  SET referred_by_agent_id = v_sponsor_id,
      original_sponsor_agent_id = coalesce(original_sponsor_agent_id, v_sponsor_id),
      updated_at = now()
  WHERE id = v_agent_id
    AND user_type = 'agent';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only agent accounts can join an organization';
  END IF;

  INSERT INTO public.agent_sponsorship_history (
    agent_id, sponsor_agent_id, changed_by, metadata
  )
  VALUES (
    v_agent_id, v_sponsor_id, v_agent_id, jsonb_build_object('source', 'referral_code')
  )
  ON CONFLICT (agent_id) WHERE ended_at IS NULL DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.roll_up_agent_downline(
  p_agent_id uuid,
  p_reason text,
  p_actor_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
  v_child record;
  v_moved integer := 0;
BEGIN
  SELECT referred_by_agent_id INTO v_parent_id
  FROM public.users
  WHERE id = p_agent_id
  FOR UPDATE;

  FOR v_child IN
    SELECT id
    FROM public.users
    WHERE referred_by_agent_id = p_agent_id
      AND user_type = 'agent'
    FOR UPDATE
  LOOP
    UPDATE public.agent_sponsorship_history
    SET ended_at = now(),
        end_reason = p_reason,
        changed_by = p_actor_id,
        metadata = metadata || jsonb_build_object('rolled_up_from', p_agent_id)
    WHERE agent_id = v_child.id
      AND ended_at IS NULL;

    UPDATE public.users
    SET referred_by_agent_id = v_parent_id,
        updated_at = now()
    WHERE id = v_child.id;

    INSERT INTO public.agent_sponsorship_history (
      agent_id, sponsor_agent_id, changed_by, metadata
    )
    VALUES (
      v_child.id,
      v_parent_id,
      p_actor_id,
      jsonb_build_object(
        'reason', p_reason,
        'rolled_up_from', p_agent_id
      )
    );

    v_moved := v_moved + 1;
  END LOOP;

  RETURN v_moved;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_subscription_forfeiture(
  p_agent_id uuid,
  p_actor_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_status text;
  v_moved integer;
BEGIN
  SELECT account_status INTO v_previous_status
  FROM public.users
  WHERE id = p_agent_id
    AND user_type = 'agent'
  FOR UPDATE;

  IF v_previous_status IS NULL THEN
    RAISE EXCEPTION 'Agent not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.agent_memberships
    WHERE user_id = p_agent_id
      AND organization_forfeiture_processed_at IS NOT NULL
  ) THEN
    RETURN 0;
  END IF;

  v_moved := public.roll_up_agent_downline(
    p_agent_id,
    'subscription_unpaid_60_days',
    p_actor_id
  );

  UPDATE public.users
  SET organization_eligible = false,
      organization_forfeited_at = now(),
      updated_at = now()
  WHERE id = p_agent_id;

  UPDATE public.agent_memberships
  SET organization_forfeiture_processed_at = now(),
      updated_at = now()
  WHERE user_id = p_agent_id;

  INSERT INTO public.agent_status_audit (
    agent_id, event_type, previous_status, new_status, reason, actor_id, metadata
  )
  VALUES (
    p_agent_id,
    'organization_forfeited',
    v_previous_status,
    v_previous_status,
    'Membership remained unpaid for 60 continuous days',
    p_actor_id,
    jsonb_build_object('agents_rolled_up', v_moved)
  );

  RETURN v_moved;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_agent_organization_eligibility(
  p_agent_id uuid,
  p_actor_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET organization_eligible = true,
      organization_restarted_at = now(),
      updated_at = now()
  WHERE id = p_agent_id
    AND account_status = 'active';

  INSERT INTO public.agent_status_audit (
    agent_id, event_type, previous_status, new_status, reason, actor_id
  )
  VALUES (
    p_agent_id,
    'organization_restarted',
    'ineligible',
    'eligible',
    'Paid membership restored; prior downline remains rolled up',
    p_actor_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_platform_fee_nonpayment(
  p_obligation_id uuid,
  p_reason text,
  p_actor_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_agent_id uuid;
  v_previous_status text;
  v_moved integer;
BEGIN
  IF NOT public.is_homeoffer_admin(p_actor_id) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  SELECT agent_id INTO v_agent_id
  FROM public.platform_fee_obligations
  WHERE id = p_obligation_id
    AND paid_at IS NULL
    AND status NOT IN ('paid', 'waived')
  FOR UPDATE;

  IF v_agent_id IS NULL THEN
    RAISE EXCEPTION 'Unpaid platform-fee obligation not found';
  END IF;

  UPDATE public.platform_fee_obligations
  SET status = 'nonpayment_confirmed',
      nonpayment_confirmed_at = now(),
      nonpayment_confirmed_by = p_actor_id,
      updated_at = now()
  WHERE id = p_obligation_id;

  SELECT account_status INTO v_previous_status
  FROM public.users
  WHERE id = v_agent_id
  FOR UPDATE;

  v_moved := public.roll_up_agent_downline(
    v_agent_id,
    'permanent_ban_platform_fee_nonpayment',
    p_actor_id
  );

  UPDATE public.users
  SET account_status = 'permanently_banned',
      organization_eligible = false,
      banned_at = now(),
      ban_reason = p_reason,
      updated_at = now()
  WHERE id = v_agent_id;

  UPDATE auth.users
  SET banned_until = 'infinity'::timestamptz
  WHERE id = v_agent_id;

  UPDATE public.platform_fee_obligations
  SET permanent_ban_processed_at = now(),
      updated_at = now()
  WHERE id = p_obligation_id;

  INSERT INTO public.agent_status_audit (
    agent_id, event_type, previous_status, new_status, reason, actor_id, metadata
  )
  VALUES (
    v_agent_id,
    'permanent_ban',
    v_previous_status,
    'permanently_banned',
    p_reason,
    p_actor_id,
    jsonb_build_object(
      'platform_fee_obligation_id', p_obligation_id,
      'agents_rolled_up', v_moved
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_agent_rule_violation(
  p_agent_id uuid,
  p_action text,
  p_rule_code text,
  p_reason text,
  p_evidence jsonb DEFAULT '{}'::jsonb,
  p_actor_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_event_id uuid;
  v_previous_status text;
  v_moved integer := 0;
BEGIN
  IF NOT public.is_homeoffer_admin(p_actor_id) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  IF p_action NOT IN ('warning', 'suspend', 'reinstate', 'permanent_ban') THEN
    RAISE EXCEPTION 'Unsupported compliance action';
  END IF;

  SELECT account_status INTO v_previous_status
  FROM public.users
  WHERE id = p_agent_id
    AND user_type = 'agent'
  FOR UPDATE;

  IF v_previous_status IS NULL THEN
    RAISE EXCEPTION 'Agent not found';
  END IF;

  INSERT INTO public.agent_compliance_events (
    agent_id, rule_code, event_type, severity, decision, reason,
    evidence, created_by, resolved_by, resolved_at
  )
  VALUES (
    p_agent_id,
    p_rule_code,
    'rule_violation',
    CASE
      WHEN p_action = 'permanent_ban' THEN 'critical'
      WHEN p_action = 'suspend' THEN 'serious'
      ELSE 'review'
    END,
    p_action,
    p_reason,
    p_evidence,
    p_actor_id,
    p_actor_id,
    now()
  )
  RETURNING id INTO v_event_id;

  IF p_action = 'suspend' THEN
    UPDATE public.users
    SET account_status = 'suspended',
        suspended_at = now(),
        suspension_reason = p_reason,
        updated_at = now()
    WHERE id = p_agent_id;

    UPDATE auth.users
    SET banned_until = 'infinity'::timestamptz
    WHERE id = p_agent_id;
  ELSIF p_action = 'reinstate' THEN
    IF v_previous_status = 'permanently_banned' THEN
      RAISE EXCEPTION 'A permanent ban cannot be reinstated through this function';
    END IF;

    UPDATE public.users
    SET account_status = 'active',
        suspended_at = NULL,
        suspension_reason = NULL,
        updated_at = now()
    WHERE id = p_agent_id;

    UPDATE auth.users
    SET banned_until = NULL
    WHERE id = p_agent_id;
  ELSIF p_action = 'permanent_ban' THEN
    v_moved := public.roll_up_agent_downline(
      p_agent_id,
      'permanent_ban_rule_violation',
      p_actor_id
    );

    UPDATE public.users
    SET account_status = 'permanently_banned',
        organization_eligible = false,
        banned_at = now(),
        ban_reason = p_reason,
        updated_at = now()
    WHERE id = p_agent_id;

    UPDATE auth.users
    SET banned_until = 'infinity'::timestamptz
    WHERE id = p_agent_id;
  END IF;

  INSERT INTO public.agent_status_audit (
    agent_id, event_type, previous_status, new_status, reason, actor_id, metadata
  )
  VALUES (
    p_agent_id,
    'rule_' || p_action,
    v_previous_status,
    CASE
      WHEN p_action = 'suspend' THEN 'suspended'
      WHEN p_action = 'reinstate' THEN 'active'
      WHEN p_action = 'permanent_ban' THEN 'permanently_banned'
      ELSE v_previous_status
    END,
    p_reason,
    p_actor_id,
    jsonb_build_object(
      'compliance_event_id', v_event_id,
      'agents_rolled_up', v_moved
    )
  );

  RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_agent_membership_enforcement_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();

  IF NEW.status IN ('past_due', 'unpaid', 'delinquent') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.delinquent_since := coalesce(NEW.delinquent_since, now());
    ELSE
      NEW.delinquent_since := coalesce(NEW.delinquent_since, OLD.delinquent_since, now());
    END IF;
  ELSIF NEW.status IN ('active', 'trialing') THEN
    NEW.delinquent_since := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agent_membership_enforcement_fields
  ON public.agent_memberships;
CREATE TRIGGER agent_membership_enforcement_fields
BEFORE INSERT OR UPDATE ON public.agent_memberships
FOR EACH ROW
EXECUTE FUNCTION public.sync_agent_membership_enforcement_fields();

CREATE OR REPLACE FUNCTION public.restore_paid_agent_after_membership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('active', 'trialing')
     AND coalesce(OLD.status, '') NOT IN ('active', 'trialing')
     AND NEW.organization_forfeiture_processed_at IS NOT NULL THEN
    PERFORM public.restore_agent_organization_eligibility(NEW.user_id, NULL);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restore_paid_agent_membership
  ON public.agent_memberships;
CREATE TRIGGER restore_paid_agent_membership
AFTER UPDATE ON public.agent_memberships
FOR EACH ROW
EXECUTE FUNCTION public.restore_paid_agent_after_membership_change();

CREATE OR REPLACE FUNCTION public.get_agent_listing_eligibility(
  p_agent_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester uuid := auth.uid();
  v_user_type text;
  v_account_status text;
  v_membership_status text;
  v_delinquent_since timestamptz;
  v_allowed boolean;
  v_reason text;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_agent_id <> v_requester AND NOT public.is_homeoffer_admin(v_requester) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT
    u.user_type,
    u.account_status,
    coalesce(m.status, 'inactive'),
    m.delinquent_since
  INTO
    v_user_type,
    v_account_status,
    v_membership_status,
    v_delinquent_since
  FROM public.users u
  LEFT JOIN public.agent_memberships m ON m.user_id = u.id
  WHERE u.id = p_agent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agent not found';
  END IF;

  v_allowed :=
    v_account_status = 'active'
    AND (
      v_user_type <> 'agent'
      OR v_membership_status IN ('active', 'trialing')
    );

  v_reason := CASE
    WHEN v_account_status = 'permanently_banned'
      THEN 'This account is permanently banned from HomeOffer.pro.'
    WHEN v_account_status = 'suspended'
      THEN 'This account is suspended from HomeOffer.pro.'
    WHEN v_user_type <> 'agent'
      THEN NULL
    WHEN v_membership_status IN ('past_due', 'unpaid', 'delinquent')
      THEN 'Your subscription payment is past due. Renew to list another property. Your organization remains protected for 60 continuous days from the missed payment.'
    WHEN v_membership_status NOT IN ('active', 'trialing')
      THEN 'An active HomeOffer.pro agent subscription is required to list a property.'
    ELSE NULL
  END;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'reason', v_reason,
    'account_status', v_account_status,
    'membership_status', v_membership_status,
    'delinquent_since', v_delinquent_since,
    'organization_grace_days_remaining',
      CASE
        WHEN v_delinquent_since IS NULL THEN 60
        ELSE greatest(
          0,
          60 - floor(extract(epoch FROM (now() - v_delinquent_since)) / 86400)::integer
        )
      END
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_agent_listing_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eligibility jsonb;
BEGIN
  -- Existing listings remain manageable. Eligibility is checked when a listing
  -- is first created, assigned to another agent, or newly published as active.
  IF TG_OP = 'INSERT'
     OR NEW.listing_agent_id IS DISTINCT FROM OLD.listing_agent_id
     OR (
       NEW.status = 'active'
       AND OLD.status IS DISTINCT FROM 'active'
     ) THEN
    v_eligibility := public.get_agent_listing_eligibility(NEW.listing_agent_id);

    IF NOT coalesce((v_eligibility ->> 'allowed')::boolean, false) THEN
      RAISE EXCEPTION '%', coalesce(
        v_eligibility ->> 'reason',
        'An active HomeOffer.pro subscription is required to list a property.'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_agent_listing_eligibility
  ON public.properties;
CREATE TRIGGER enforce_agent_listing_eligibility
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.enforce_agent_listing_eligibility();

CREATE OR REPLACE FUNCTION public.run_due_agent_enforcement_internal()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membership record;
  v_subscription_resets integer := 0;
BEGIN
  FOR v_membership IN
    SELECT user_id
    FROM public.agent_memberships
    WHERE status IN ('past_due', 'unpaid', 'delinquent')
      AND delinquent_since <= now() - interval '60 days'
      AND organization_forfeiture_processed_at IS NULL
    FOR UPDATE SKIP LOCKED
  LOOP
    PERFORM public.process_subscription_forfeiture(v_membership.user_id, NULL);
    v_subscription_resets := v_subscription_resets + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'subscription_organizations_forfeited', v_subscription_resets,
    'completed_at', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.run_due_agent_enforcement()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_homeoffer_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Administrator access required';
  END IF;

  RETURN public.run_due_agent_enforcement_internal();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_agent_organization_dashboard(
  p_agent_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester uuid := auth.uid();
  v_result jsonb;
BEGIN
  IF v_requester IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_agent_id <> v_requester AND NOT public.is_homeoffer_admin(v_requester) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'agent_id', u.id,
    'account_status', u.account_status,
    'organization_eligible', u.organization_eligible,
    'organization_forfeited_at', u.organization_forfeited_at,
    'organization_restarted_at', u.organization_restarted_at,
    'membership', jsonb_build_object(
      'status', coalesce(m.status, 'inactive'),
      'listing_allowed',
        u.account_status = 'active'
        AND coalesce(m.status, 'inactive') IN ('active', 'trialing'),
      'current_period_end', m.current_period_end,
      'delinquent_since', m.delinquent_since,
      'days_delinquent',
        CASE
          WHEN m.delinquent_since IS NULL THEN 0
          ELSE greatest(0, floor(extract(epoch FROM (now() - m.delinquent_since)) / 86400))::integer
        END,
      'forfeiture_processed_at', m.organization_forfeiture_processed_at
    ),
    'units_sold', (
      SELECT count(*)
      FROM public.agent_transactions t
      WHERE t.agent_id = u.id
        AND t.status IN ('closed', 'paid')
    ),
    'transactions', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'property_id', t.property_id,
          'address', coalesce(p.address, 'Property record'),
          'city', p.city,
          'state', p.state,
          'transaction_role', t.transaction_role,
          'sale_price', t.sale_price,
          'closed_at', t.closed_at,
          'status', t.status
        )
        ORDER BY t.closed_at DESC NULLS LAST, t.created_at DESC
      )
      FROM public.agent_transactions t
      LEFT JOIN public.properties p ON p.id = t.property_id
      WHERE t.agent_id = u.id
        AND t.status IN ('closed', 'paid')
    ), '[]'::jsonb),
    'tier_one', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'first_name', a.first_name,
          'last_name', a.last_name,
          'email', a.email,
          'account_status', a.account_status,
          'organization_eligible', a.organization_eligible,
          'joined_at', a.created_at,
          'units_sold', (
            SELECT count(*)
            FROM public.agent_transactions t1
            WHERE t1.agent_id = a.id
              AND t1.status IN ('closed', 'paid')
          )
        )
        ORDER BY a.created_at
      )
      FROM public.users a
      WHERE a.referred_by_agent_id = u.id
        AND a.user_type = 'agent'
    ), '[]'::jsonb),
    'tier_two', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', a2.id,
          'first_name', a2.first_name,
          'last_name', a2.last_name,
          'email', a2.email,
          'sponsor_agent_id', a2.referred_by_agent_id,
          'account_status', a2.account_status,
          'organization_eligible', a2.organization_eligible,
          'joined_at', a2.created_at,
          'units_sold', (
            SELECT count(*)
            FROM public.agent_transactions t2
            WHERE t2.agent_id = a2.id
              AND t2.status IN ('closed', 'paid')
          )
        )
        ORDER BY a2.created_at
      )
      FROM public.users a2
      JOIN public.users a1 ON a1.id = a2.referred_by_agent_id
      WHERE a1.referred_by_agent_id = u.id
        AND a1.user_type = 'agent'
        AND a2.user_type = 'agent'
    ), '[]'::jsonb),
    'reward_totals', jsonb_build_object(
      'paid', coalesce((
        SELECT sum(r.amount)
        FROM public.agent_rewards r
        WHERE r.beneficiary_agent_id = u.id
          AND r.status = 'paid'
      ), 0),
      'pending', coalesce((
        SELECT sum(r.amount)
        FROM public.agent_rewards r
        WHERE r.beneficiary_agent_id = u.id
          AND r.status IN ('pending', 'approved')
      ), 0)
    ),
    'platform_fees', jsonb_build_object(
      'open_count', (
        SELECT count(*)
        FROM public.platform_fee_obligations f
        WHERE f.agent_id = u.id
          AND f.status NOT IN ('paid', 'waived')
      ),
      'open_amount', coalesce((
        SELECT sum(f.amount)
        FROM public.platform_fee_obligations f
        WHERE f.agent_id = u.id
          AND f.status NOT IN ('paid', 'waived')
      ), 0)
    )
  )
  INTO v_result
  FROM public.users u
  LEFT JOIN public.agent_memberships m ON m.user_id = u.id
  WHERE u.id = p_agent_id
    AND u.user_type = 'agent';

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Agent account not found';
  END IF;

  RETURN v_result;
END;
$$;

ALTER TABLE public.agent_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_fee_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sponsorship_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_status_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_compliance_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_memberships_read_own ON public.agent_memberships;
CREATE POLICY agent_memberships_read_own
ON public.agent_memberships FOR SELECT
USING (user_id = auth.uid() OR public.is_homeoffer_admin(auth.uid()));

DROP POLICY IF EXISTS agent_transactions_read_own ON public.agent_transactions;
CREATE POLICY agent_transactions_read_own
ON public.agent_transactions FOR SELECT
USING (agent_id = auth.uid() OR public.is_homeoffer_admin(auth.uid()));

DROP POLICY IF EXISTS agent_rewards_read_own ON public.agent_rewards;
CREATE POLICY agent_rewards_read_own
ON public.agent_rewards FOR SELECT
USING (
  beneficiary_agent_id = auth.uid()
  OR producing_agent_id = auth.uid()
  OR public.is_homeoffer_admin(auth.uid())
);

DROP POLICY IF EXISTS platform_fee_obligations_read_own ON public.platform_fee_obligations;
CREATE POLICY platform_fee_obligations_read_own
ON public.platform_fee_obligations FOR SELECT
USING (agent_id = auth.uid() OR public.is_homeoffer_admin(auth.uid()));

DROP POLICY IF EXISTS sponsorship_history_read_own_network ON public.agent_sponsorship_history;
CREATE POLICY sponsorship_history_read_own_network
ON public.agent_sponsorship_history FOR SELECT
USING (
  agent_id = auth.uid()
  OR sponsor_agent_id = auth.uid()
  OR public.is_homeoffer_admin(auth.uid())
);

DROP POLICY IF EXISTS agent_status_audit_read_own ON public.agent_status_audit;
CREATE POLICY agent_status_audit_read_own
ON public.agent_status_audit FOR SELECT
USING (agent_id = auth.uid() OR public.is_homeoffer_admin(auth.uid()));

DROP POLICY IF EXISTS agent_compliance_events_read_own ON public.agent_compliance_events;
CREATE POLICY agent_compliance_events_read_own
ON public.agent_compliance_events FOR SELECT
USING (agent_id = auth.uid() OR public.is_homeoffer_admin(auth.uid()));

REVOKE ALL ON FUNCTION public.roll_up_agent_downline(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_subscription_forfeiture(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_agent_listing_eligibility(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.restore_agent_organization_eligibility(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_platform_fee_nonpayment(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_agent_rule_violation(uuid, text, text, text, jsonb, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.run_due_agent_enforcement_internal() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.claim_agent_sponsor(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_listing_eligibility(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_organization_dashboard(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_due_agent_enforcement() TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_platform_fee_nonpayment(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_agent_rule_violation(uuid, text, text, text, jsonb, uuid) TO authenticated;

-- Backfill an active sponsorship-history row for current direct sponsorships.
INSERT INTO public.agent_sponsorship_history (
  agent_id, sponsor_agent_id, started_at, metadata
)
SELECT
  u.id,
  u.referred_by_agent_id,
  coalesce(u.created_at, now()),
  jsonb_build_object('source', 'migration_backfill')
FROM public.users u
WHERE u.user_type = 'agent'
  AND u.referred_by_agent_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.agent_sponsorship_history h
    WHERE h.agent_id = u.id
      AND h.ended_at IS NULL
  );

-- Optional daily automation. Supabase projects with pg_cron available will
-- run subscription enforcement every day at 4:00 AM UTC.
DO $$
DECLARE
  v_existing_job bigint;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;

    SELECT jobid INTO v_existing_job
    FROM cron.job
    WHERE jobname = 'homeoffer-agent-enforcement'
    LIMIT 1;

    IF v_existing_job IS NOT NULL THEN
      PERFORM cron.unschedule(v_existing_job);
    END IF;

    PERFORM cron.schedule(
      'homeoffer-agent-enforcement',
      '0 4 * * *',
      'SELECT public.run_due_agent_enforcement_internal();'
    );
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR undefined_table THEN
    RAISE NOTICE 'pg_cron was not enabled; call run_due_agent_enforcement daily from a trusted server job.';
END $$;

COMMIT;

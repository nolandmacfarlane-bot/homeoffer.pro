-- Allow authenticated users to create and maintain only their own HomeOffer.pro profile.
-- Required for Google, Meta and email account creation.

BEGIN;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_insert_own_profile ON public.users;
CREATE POLICY users_insert_own_profile
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_read_own_profile ON public.users;
CREATE POLICY users_read_own_profile
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own_profile ON public.users;
CREATE POLICY users_update_own_profile
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

COMMIT;

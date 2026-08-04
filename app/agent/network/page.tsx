'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/immutability, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import BackButton from '@/components/BackButton'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { primaryButton, secondaryButton } from '@/lib/ui-styles'

type Membership = {
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

type NetworkAgent = {
  id: string
  first_name: string
  last_name: string
  email: string
  referred_by_agent_id: string | null
  closedUnits: number
}

type SponsorCandidate = {
  id: string
  first_name: string
  last_name: string
  phone_number: string | null
  dre_license_number: string | null
}

type Reward = {
  id: string
  tier: 1 | 2
  amount: number
  status: string
  created_at: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function AgentNetworkPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [tierOne, setTierOne] = useState<NetworkAgent[]>([])
  const [tierTwo, setTierTwo] = useState<NetworkAgent[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [closedUnits, setClosedUnits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [systemReady, setSystemReady] = useState(true)
  const [publicPreview, setPublicPreview] = useState(false)
  const [sponsorSearch, setSponsorSearch] = useState('')
  const [sponsorResults, setSponsorResults] = useState<SponsorCandidate[]>([])
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorCandidate | null>(null)
  const [sponsorSearching, setSponsorSearching] = useState(false)
  const [tierOneModel, setTierOneModel] = useState(10)
  const [tierTwoModel, setTierTwoModel] = useState(20)
  const [annualClosings, setAnnualClosings] = useState(6)

  useEffect(() => {
    loadNetwork()
    const membershipResult = new URLSearchParams(window.location.search).get('membership')
    if (membershipResult === 'success') {
      setMessage('Payment received. Stripe is confirming your membership now.')
    }
  }, [])

  async function loadNetwork() {
    let authenticatedAgent = false
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setPublicPreview(true)
        return
      }
      if (currentUser.user_type !== 'agent') {
        router.push('/buyer')
        return
      }
      authenticatedAgent = true
      setUser(currentUser)

      const [membershipResult, propertyResult, rewardResult, tierOneResult] = await Promise.all([
        supabase
          .from('agent_memberships')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
        supabase
          .from('properties')
          .select('id, status')
          .eq('listing_agent_id', currentUser.id)
          .in('status', ['closed', 'sold']),
        supabase
          .from('agent_rewards')
          .select('id, tier, amount, status, created_at')
          .eq('beneficiary_agent_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('users')
          .select('id, first_name, last_name, email, referred_by_agent_id')
          .eq('referred_by_agent_id', currentUser.id)
          .eq('user_type', 'agent'),
      ])

      const migrationMissing =
        membershipResult.error?.code === '42P01' ||
        rewardResult.error?.code === '42P01' ||
        tierOneResult.error?.code === '42703'

      const currentUserIsOwner = currentUser.email?.toLowerCase() === 'noland.macfarlane@gmail.com'
      if (migrationMissing && !currentUserIsOwner) {
        setSystemReady(false)
      }

      setMembership((membershipResult.data as Membership | null) || null)
      setClosedUnits(propertyResult.data?.length || 0)
      setRewards((rewardResult.data as Reward[] | null) || [])

      const firstTier = (tierOneResult.data as NetworkAgent[] | null) || []
      const firstTierIds = firstTier.map((agent) => agent.id)
      let secondTier: NetworkAgent[] = []
      let transactions: { agent_id: string }[] = []

      if (firstTierIds.length > 0) {
        const [tierTwoResult, productionResult] = await Promise.all([
          supabase
            .from('users')
            .select('id, first_name, last_name, email, referred_by_agent_id')
            .in('referred_by_agent_id', firstTierIds)
            .eq('user_type', 'agent'),
          supabase
            .from('agent_transactions')
            .select('agent_id')
            .in('agent_id', firstTierIds)
            .eq('status', 'paid'),
        ])
        secondTier = (tierTwoResult.data as NetworkAgent[] | null) || []

        const secondTierIds = secondTier.map((agent) => agent.id)
        if (secondTierIds.length > 0) {
          const { data } = await supabase
            .from('agent_transactions')
            .select('agent_id')
            .in('agent_id', secondTierIds)
            .eq('status', 'paid')
          transactions = [...(productionResult.data || []), ...(data || [])]
        } else {
          transactions = productionResult.data || []
        }
      }

      const withUnits = (agents: NetworkAgent[]) =>
        agents.map((agent) => ({
          ...agent,
          closedUnits: transactions.filter((transaction) => transaction.agent_id === agent.id).length,
        }))

      setTierOne(withUnits(firstTier))
      setTierTwo(withUnits(secondTier))
    } catch (error) {
      console.error('Agent network error:', error)
      if (!authenticatedAgent) {
        setPublicPreview(true)
        return
      }
      setMessage('We could not load the agent hub. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function openStripe(endpoint: string) {
    setBillingLoading(true)
    setMessage('')
    try {
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      if (!accessToken) throw new Error('Please sign in again.')

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Billing is unavailable.')
      window.location.assign(result.url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Billing is unavailable.')
      setBillingLoading(false)
    }
  }

  async function searchForSponsor() {
    const term = sponsorSearch.trim()
    if (term.length < 2) {
      setMessage('Enter at least two letters of the agent’s name.')
      return
    }

    setMessage('')
    setSponsorSearching(true)
    const firstTerm = term.split(/\s+/)[0].replace(/[,%()]/g, '')
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number, dre_license_number')
      .eq('user_type', 'agent')
      .neq('id', user.id)
      .or(`first_name.ilike.%${firstTerm}%,last_name.ilike.%${firstTerm}%`)
      .limit(12)

    setSponsorSearching(false)
    if (error) {
      setMessage('We could not search the agent directory. Please try again.')
      return
    }

    const normalized = term.toLowerCase()
    const matches = (data || []).filter((agent) =>
      `${agent.first_name || ''} ${agent.last_name || ''}`.toLowerCase().includes(normalized)
      || (agent.first_name || '').toLowerCase().includes(normalized)
      || (agent.last_name || '').toLowerCase().includes(normalized)
    )
    setSponsorResults(matches as SponsorCandidate[])
    if (matches.length === 0) setMessage('No matching agents were found.')
  }

  async function confirmSponsor() {
    if (!selectedSponsor || user?.referred_by_agent_id) return
    const fullName = `${selectedSponsor.first_name} ${selectedSponsor.last_name}`.trim()
    const confirmed = window.confirm(
      `This sponsor choice is permanent and cannot be changed. Are you sure you want to select ${fullName}?`
    )
    if (!confirmed) return

    setMessage('')
    const { data, error } = await supabase
      .from('users')
      .update({ referred_by_agent_id: selectedSponsor.id })
      .eq('id', user.id)
      .is('referred_by_agent_id', null)
      .select('referred_by_agent_id')
      .single()

    if (error || !data) {
      setMessage('Your sponsor could not be saved. It may already be selected.')
      return
    }

    setUser({ ...user, referred_by_agent_id: selectedSponsor.id })
    setMessage(`${fullName} is now permanently connected as your sponsor.`)
    setSponsorResults([])
  }

  const rewardTotals = useMemo(() => {
    const eligible = rewards.filter((reward) => reward.status !== 'void')
    return {
      pending: eligible
        .filter((reward) => ['pending', 'broker_review'].includes(reward.status))
        .reduce((sum, reward) => sum + Number(reward.amount), 0),
      approved: eligible
        .filter((reward) => reward.status === 'approved')
        .reduce((sum, reward) => sum + Number(reward.amount), 0),
      paid: eligible
        .filter((reward) => reward.status === 'paid')
        .reduce((sum, reward) => sum + Number(reward.amount), 0),
    }
  }, [rewards])

  const projection = useMemo(() => {
    const tierOneAnnual = tierOneModel * annualClosings * 250
    const tierTwoAnnual = tierTwoModel * annualClosings * 75
    return {
      tierOneAnnual,
      tierTwoAnnual,
      annual: tierOneAnnual + tierTwoAnnual,
      monthly: (tierOneAnnual + tierTwoAnnual) / 12,
      families: (tierOneModel + tierTwoModel) * annualClosings,
    }
  }, [tierOneModel, tierTwoModel, annualClosings])

  const ownerAccess = user?.email?.toLowerCase() === 'noland.macfarlane@gmail.com'
  const membershipActive = ownerAccess || membership?.status === 'active' || membership?.status === 'trialing'
  const memberStart = user?.created_at ? new Date(user.created_at) : null
  const monthsAsMember = memberStart
    ? Math.max(1, (new Date().getFullYear() - memberStart.getFullYear()) * 12 + new Date().getMonth() - memberStart.getMonth() + 1)
    : 0
  const memberDuration = memberStart
    ? `${monthsAsMember} ${monthsAsMember === 1 ? 'month' : 'months'}`
    : 'Not available'
  const memberSince = memberStart
    ? memberStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Membership date unavailable'

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading agent hub…</div>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Agent hub</p>
                <h1 className="mt-2 text-4xl font-black text-slate-950">Production, membership & network</h1>
                <p className="mt-3 max-w-3xl text-lg text-slate-600">
                  {publicPreview
                    ? 'Preview how agents track closed homes, their two-tier network, and broker-reviewed rewards.'
                    : 'Track closed homes, your two-tier network, and broker-reviewed rewards in one place.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {publicPreview ? (
                  <>
                    <Link href="/signup?role=agent" className={primaryButton}>
                      Join for $7/month
                    </Link>
                    <Link href="/login" className={secondaryButton}>
                      Agent sign in
                    </Link>
                  </>
                ) : (
                  <BackButton href="/agent/profile">Agent dashboard</BackButton>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {message && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-blue-900" role="status">
              {message}
            </div>
          )}

          {!systemReady && !ownerAccess && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950">
              <p className="font-black">Agent membership setup is awaiting database activation.</p>
              <p className="mt-1 text-sm">Your listing dashboard still works. Network and billing records will appear after the new migration is applied.</p>
            </div>
          )}

          {publicPreview && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-950">
              <p className="font-black">Public preview</p>
              <p className="mt-1 text-sm">The numbers below are examples. An agent’s real production, network, and reward information stays private after sign-in.</p>
            </div>
          )}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['HomeOffer.pro member', publicPreview ? '6 months' : memberDuration, publicPreview ? 'Example membership length' : `Since ${memberSince}`],
              ['Your closed homes', publicPreview ? '12' : closedUnits.toString(), publicPreview ? 'Example production record' : 'Recorded from your listings'],
              ['Tier 1 agents', publicPreview ? '10' : tierOne.length.toString(), publicPreview ? '60 example closed homes' : `${tierOne.reduce((sum, agent) => sum + agent.closedUnits, 0)} closed homes`],
              ['Tier 2 agents', publicPreview ? '20' : tierTwo.length.toString(), publicPreview ? '120 example closed homes' : `${tierTwo.reduce((sum, agent) => sum + agent.closedUnits, 0)} closed homes`],
              ['Paid rewards', publicPreview ? '$24,000' : money.format(rewardTotals.paid), publicPreview ? 'Illustrative annual scenario' : `${money.format(rewardTotals.pending)} pending review`],
            ].map(([label, value, detail]) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                <p className="mt-2 text-sm text-slate-600">{detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-2xl bg-slate-950 p-7 text-white shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-300">Agent membership</p>
                  <h2 className="mt-2 text-3xl font-black">{ownerAccess ? 'Permanent owner access' : '$7 per month'}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                  membershipActive ? 'bg-emerald-400 text-emerald-950' : 'bg-white/15 text-white'
                }`}>
                  {ownerAccess ? 'Owner access' : membership?.status?.replace('_', ' ') || 'Not subscribed'}
                </span>
              </div>
              <p className="mt-5 text-slate-300">
                {ownerAccess
                  ? 'Your account is permanently active with full access. No subscription or payment is required.'
                  : 'Access the agent network, production ledger, and member tools. Billing is handled securely by Stripe.'}
              </p>
              {membership?.current_period_end && (
                <p className="mt-3 text-sm text-slate-400">
                  {membership.cancel_at_period_end ? 'Access ends' : 'Renews'}{' '}
                  {new Date(membership.current_period_end).toLocaleDateString()}.
                </p>
              )}
              {!ownerAccess && <button
                onClick={() =>
                  publicPreview
                    ? router.push('/signup?role=agent')
                    : openStripe(
                        membershipActive
                          ? '/api/stripe/create-portal-session'
                          : '/api/stripe/create-checkout-session'
                      )
                }
                disabled={billingLoading || (!systemReady && !publicPreview)}
                className={`${primaryButton} mt-6 w-full`}
              >
                {billingLoading
                  ? 'Opening Stripe…'
                  : publicPreview
                    ? 'Create agent account'
                    : membershipActive
                      ? 'Manage billing'
                      : 'Subscribe for $7/month'}
              </button>}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">Your sponsor</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Select the agent who introduced you</h2>
              <p className="mt-3 text-slate-600">Search by first or last name, then verify the agent using their DRE number and phone number.</p>

              {publicPreview ? (
                <p className="mt-5 rounded-xl bg-slate-100 p-4 font-bold text-slate-700">Sign in to search the agent directory.</p>
              ) : user?.referred_by_agent_id ? (
                <p className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-900">Your sponsor has already been selected and cannot be changed.</p>
              ) : (
                <>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={sponsorSearch}
                      onChange={(event) => {
                        setSponsorSearch(event.target.value)
                        setSelectedSponsor(null)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') searchForSponsor()
                      }}
                      placeholder="Enter the agent’s first or last name"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
                    />
                    <button
                      onClick={searchForSponsor}
                      disabled={sponsorSearching}
                      className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-50"
                    >
                      {sponsorSearching ? 'Searching…' : 'Search agents'}
                    </button>
                  </div>

                  {sponsorResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {sponsorResults.map((agent) => {
                        const isSelected = selectedSponsor?.id === agent.id
                        return (
                          <button
                            key={agent.id}
                            type="button"
                            onClick={() => setSelectedSponsor(agent)}
                            className={`w-full rounded-xl border p-4 text-left transition ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}
                          >
                            <span className="block text-lg font-black text-slate-950">{agent.first_name} {agent.last_name}</span>
                            <span className="mt-1 block text-sm text-slate-600">
                              DRE #{agent.dre_license_number || 'Not provided'} · {agent.phone_number || 'Phone not provided'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {selectedSponsor && (
                    <div className="mt-4 rounded-xl border-2 border-blue-600 bg-blue-50 p-5">
                      <p className="font-black text-slate-950">Confirm your sponsor</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">This choice is irreversible. Make sure the name, DRE number and phone number identify the correct agent.</p>
                      <button
                        type="button"
                        onClick={confirmSponsor}
                        className={`${primaryButton} mt-4`}
                      >
                        Yes, permanently select this sponsor
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">Vision calculator</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Model a steadier long-term income stream</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-500">
                Illustration only—not an earnings promise. Uses proposed rewards of $250 for tier 1 and $75 for tier 2 per eligible closing.
              </p>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-6">
                {[
                  ['Tier 1 agents', tierOneModel, setTierOneModel, 1, 50],
                  ['Tier 2 agents', tierTwoModel, setTierTwoModel, 0, 100],
                  ['Average closings per agent / year', annualClosings, setAnnualClosings, 1, 24],
                ].map(([label, value, setter, min, max]) => (
                  <label key={label as string} className="block">
                    <span className="flex justify-between font-bold text-slate-800">
                      <span>{label as string}</span>
                      <span>{value as number}</span>
                    </span>
                    <input
                      type="range"
                      min={min as number}
                      max={max as number}
                      value={value as number}
                      onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))}
                      className="mt-3 w-full accent-blue-600"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-600 p-6 text-white sm:col-span-2">
                  <p className="text-sm font-bold text-blue-100">Illustrative network rewards</p>
                  <p className="mt-2 text-4xl font-black">{money.format(projection.annual)} / year</p>
                  <p className="mt-2 text-blue-100">{money.format(projection.monthly)} monthly average</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-5">
                  <p className="text-sm font-bold text-slate-500">Tier 1 portion</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{money.format(projection.tierOneAnnual)}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-5">
                  <p className="text-sm font-bold text-slate-500">Tier 2 portion</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{money.format(projection.tierTwoAnnual)}</p>
                </div>
                <p className="text-sm text-slate-600 sm:col-span-2">
                  At this pace, the network would help approximately <strong>{projection.families} families per year</strong>. Actual eligibility, payment, and timing depend on licensing, broker approval, completed services, closed transactions, and applicable law.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {[
              ['Tier 1 network', tierOne],
              ['Tier 2 network', tierTwo],
            ].map(([title, agents]) => (
              <article key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">{title as string}</h2>
                {(agents as NetworkAgent[]).length ? (
                  <div className="mt-5 divide-y divide-slate-200">
                    {(agents as NetworkAgent[]).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between gap-4 py-4">
                        <div>
                          <p className="font-black text-slate-900">{agent.first_name} {agent.last_name}</p>
                          <p className="text-sm text-slate-500">{agent.email}</p>
                        </div>
                        <p className="text-right font-black text-blue-700">{agent.closedUnits} homes</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">
                    {publicPreview ? 'Your agents and their closed-home totals will appear here.' : 'No agents recorded on this tier yet.'}
                  </p>
                )}
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
            <h2 className="text-xl font-black">Broker review comes before payment</h2>
            <p className="mt-2">
              The dashboard is a production and accounting ledger. It does not guarantee compensation or send transaction-based rewards automatically. Every reward remains subject to active licensing, written agreements, responsible-broker approval, services actually performed, closing, and applicable state and federal law.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}

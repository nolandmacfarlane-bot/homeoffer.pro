'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type OrganizationAgent = {
  id: string
  first_name: string
  last_name: string
  email: string
  account_status: string
  organization_eligible: boolean
  joined_at: string
  units_sold: number
}

type Transaction = {
  id: string
  address: string
  city: string | null
  state: string | null
  transaction_role: string
  sale_price: number | null
  closed_at: string | null
  status: string
}

type DashboardData = {
  account_status: string
  organization_eligible: boolean
  organization_forfeited_at: string | null
  membership: {
    status: string
    listing_allowed: boolean
    current_period_end: string | null
    delinquent_since: string | null
    days_delinquent: number
    forfeiture_processed_at: string | null
  }
  units_sold: number
  transactions: Transaction[]
  tier_one: OrganizationAgent[]
  tier_two: OrganizationAgent[]
  reward_totals: {
    paid: number
    pending: number
  }
  platform_fees: {
    open_count: number
    open_amount: number
  }
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const statusLabel = (status: string) =>
  status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function AgentOrganizationPanel() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrganization() {
      const { data: dashboard, error: dashboardError } = await supabase.rpc(
        'get_agent_organization_dashboard'
      )

      if (!active) return

      if (dashboardError) {
        const migrationMissing =
          dashboardError.code === '42883' ||
          dashboardError.code === 'PGRST202' ||
          dashboardError.message?.includes('get_agent_organization_dashboard')

        setError(
          migrationMissing
            ? 'The organization database migration still needs to be activated in Supabase.'
            : dashboardError.message
        )
      } else {
        setData(dashboard as DashboardData)
      }

      setLoading(false)
    }

    loadOrganization()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="font-bold text-slate-600">Loading your production and organization…</p>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <h2 className="text-2xl font-black text-slate-950">Production &amp; Organization</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-700">{error}</p>
        <Link
          href="/agent/network"
          className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-2.5 font-black text-white"
        >
          Open agent network
        </Link>
      </section>
    )
  }

  const daysUntilForfeiture = Math.max(0, 60 - (data.membership.days_delinquent || 0))
  const membershipDelinquent = ['past_due', 'unpaid', 'delinquent'].includes(
    data.membership.status
  )

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Your business
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950">
              Production &amp; Organization
            </h2>
            <p className="mt-2 text-slate-600">
              Your closed units, Tier 1 agents, Tier 2 agents and reward history.
            </p>
          </div>
          <Link
            href="/agent/network"
            className="rounded-full border border-slate-300 px-5 py-2.5 font-black text-slate-950 hover:border-blue-300 hover:text-blue-700"
          >
            Full network details
          </Link>
        </div>
      </div>

      {(data.account_status !== 'active' || !data.organization_eligible) && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-bold text-red-900 sm:px-8">
          Account status: {statusLabel(data.account_status)}. Organization eligibility:{' '}
          {data.organization_eligible ? 'Active' : 'Inactive'}.
        </div>
      )}

      {membershipDelinquent && !data.membership.forfeiture_processed_at && (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-950 sm:px-8">
          <strong>Membership payment is overdue, so new listing access is paused.</strong>{' '}
          Restore billing within{' '}
          {daysUntilForfeiture} days to keep your current organization. At 60 continuous days
          unpaid, your downline rolls up and does not return.
        </div>
      )}

      <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-6">
        {[
          ['Units sold', String(data.units_sold)],
          ['Tier 1 agents', String(data.tier_one.length)],
          ['Tier 2 agents', String(data.tier_two.length)],
          ['Rewards paid', money.format(data.reward_totals.paid || 0)],
          ['Rewards pending', money.format(data.reward_totals.pending || 0)],
          ['Open platform fees', money.format(data.platform_fees.open_amount || 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid border-t border-slate-200 lg:grid-cols-2">
        <OrganizationTable title="Tier 1 agents" agents={data.tier_one} />
        <OrganizationTable
          title="Tier 2 agents"
          agents={data.tier_two}
          className="border-t border-slate-200 lg:border-l lg:border-t-0"
        />
      </div>

      <div className="border-t border-slate-200 px-6 py-6 sm:px-8">
        <h3 className="text-xl font-black text-slate-950">Units sold</h3>
        {data.transactions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No closed units have been recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  <th className="pb-3 font-black">Property</th>
                  <th className="pb-3 font-black">Role</th>
                  <th className="pb-3 font-black">Closed</th>
                  <th className="pb-3 text-right font-black">Sale price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-4">
                      <p className="font-black text-slate-950">{transaction.address}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {[transaction.city, transaction.state].filter(Boolean).join(', ')}
                      </p>
                    </td>
                    <td className="py-4 font-semibold text-slate-700">
                      {statusLabel(transaction.transaction_role)}
                    </td>
                    <td className="py-4 text-slate-600">
                      {transaction.closed_at
                        ? new Date(transaction.closed_at).toLocaleDateString()
                        : 'Pending record'}
                    </td>
                    <td className="py-4 text-right font-black text-slate-950">
                      {transaction.sale_price ? money.format(transaction.sale_price) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs leading-5 text-slate-600 sm:px-8">
        Historical transactions and earned rewards remain recorded. Organization placement
        changes affect future eligibility only. Confirmed platform-fee refusal permanently
        disables the agent account.
      </div>
    </section>
  )
}

function OrganizationTable({
  title,
  agents,
  className = '',
}: {
  title: string
  agents: OrganizationAgent[]
  className?: string
}) {
  return (
    <div className={`p-6 sm:p-8 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
          {agents.length}
        </span>
      </div>

      {agents.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No agents in this tier yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">
                  {agent.first_name} {agent.last_name}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">{agent.email}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-black text-blue-700">{agent.units_sold} sold</p>
                <p className="mt-1 text-xs text-slate-500">
                  {statusLabel(agent.account_status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

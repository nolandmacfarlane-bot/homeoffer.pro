'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { ListingAgentBidder, ListingAgentBidEvent } from '@/lib/offers'

type Approval = {
  id: string
  buyer_id: string
  status: string
  created_at: string
  buyer: { first_name: string | null; last_name: string | null; email: string | null; user_type: string | null } | null
}
type Tab = 'bids' | 'pending' | 'approved' | 'denied'
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function AgentPrivateListingTabs({ propertyId, bidders, events }: {
  propertyId: string; bidders: ListingAgentBidder[]; events: ListingAgentBidEvent[]
}) {
  const [tab, setTab] = useState<Tab>('bids')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) { setMessage('Sign in as the listing agent to view private information.'); setLoading(false); return }
    try {
      const response = await fetch(`/api/approvals?propertyId=${encodeURIComponent(propertyId)}&scope=agent`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store',
      })
      if (!response.ok) throw new Error('Only the assigned listing agent may access these buyer records.')
      const payload = await response.json()
      setApprovals(payload.approvals ?? [])
      setMessage('')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load buyer approvals.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(), 15000)
    return () => window.clearInterval(interval)
  }, [propertyId])

  async function decide(id: string, approved: boolean) {
    setBusy(id)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) throw new Error('Sign in again to decide.')
      const response = await fetch('/api/approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ approvalId: id, approved }),
      })
      if (!response.ok) throw new Error('Unable to update approval.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save decision.') }
    finally { setBusy(null) }
  }

  const counts: Record<Tab, number> = {
    bids: events.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved' || a.approved).length,
    denied: approvals.filter(a => a.status === 'denied' || a.status === 'declined').length,
  }
  const visible = approvals.filter(a => tab === 'pending' ? a.status === 'pending' : tab === 'approved' ? (a.status === 'approved' || a.approved) : (a.status === 'denied' || a.status === 'declined'))
  const maxByBuyer = new Map(bidders.map(b => [b.bidder_id, b.maximum_amount]))
  return <section className="border-t border-slate-200 p-6">
    <p className="mb-4 text-sm font-semibold text-slate-600">Private listing-agent records · Buyer contact details and maximum bids are not public.</p>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Private property activity">
      {([
        ['bids', 'Current bids'], ['pending', 'Pending requests'], ['approved', 'Approved buyers'], ['denied', 'Denied buyers'],
      ] as const).map(([key, label]) =>
        <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
          className={`rounded-lg border px-4 py-2 text-sm font-bold ${tab === key ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-slate-700'}`}>
          {label} ({key === 'bids' ? events.length : loading ? '…' : counts[key]})
        </button>
      )}
    </div>
    {message && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{message}</p>}
    {tab === 'bids' ? <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[840px] text-left text-sm">
        <thead className="bg-slate-100"><tr>{['Time','Bidder','Email','Phone','Visible bid','Private maximum'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{events.slice(0, 150).map((e, i) => <tr key={`${e.sequence_number}-${i}`} className="border-b">
          <td className="p-3">{new Date(e.created_at).toLocaleString()}</td><td className="p-3 font-semibold">{e.full_name}</td>
          <td className="p-3">{e.email}</td><td className="p-3">{e.phone_number || 'Not provided'}</td>
          <td className="p-3">{money(e.amount)}</td><td className="p-3 font-bold">{money(e.maximum_amount)}</td>
        </tr>)}</tbody>
      </table>
      {!events.length && <p className="p-4 text-slate-500">No bids yet.</p>}
      <Link className="mt-3 inline-block text-sm font-bold text-blue-700 underline" href={`/agent/property/${propertyId}/offerors`}>View full bidder records</Link>
    </div> : <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-slate-100"><tr>{['Requested','Buyer','Email','Phone','Private maximum','Status / action'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{visible.map(a => <tr key={a.id} className="border-b">
          <td className="p-3">{new Date(a.created_at).toLocaleString()}</td>
          <td className="p-3 font-semibold">{[a.buyer?.first_name,a.buyer?.last_name].filter(Boolean).join(' ') || 'Buyer'}</td>
          <td className="p-3">{a.buyer?.email || 'Not provided'}</td>
          <td className="p-3">{bidders.find(b => b.bidder_id === a.buyer_id)?.phone_number || 'Not provided'}</td>
          <td className="p-3 font-bold">{maxByBuyer.has(a.buyer_id) ? money(maxByBuyer.get(a.buyer_id)!) : 'No bid'}</td>
          <td className="p-3">{tab === 'pending' ? <div className="flex gap-2">
            <button disabled={busy === a.id} onClick={() => decide(a.id, true)} className="rounded bg-green-700 px-3 py-2 font-bold text-white disabled:opacity-50">Approve</button>
            <button disabled={busy === a.id} onClick={() => decide(a.id, false)} className="rounded bg-red-700 px-3 py-2 font-bold text-white disabled:opacity-50">Decline</button>
          </div> : tab === 'approved' ? 'Approved' : 'Denied'}</td>
        </tr>)}</tbody>
      </table>
      {!visible.length && <p className="p-4 text-slate-500">{loading ? 'Loading requests…' : 'No buyers in this category.'}</p>}
    </div>}
  </section>
}

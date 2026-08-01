'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  getListingAgentBidderDetails,
  getListingAgentBidHistory,
  type ListingAgentBidder,
  type ListingAgentBidEvent,
} from '@/lib/offers'

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

type PropertyHeader = { id: string; address: string; city: string; state: string; zip: string }

export default function OfferorsPage() {
  const propertyId = useParams().id as string
  const [property, setProperty] = useState<PropertyHeader | null>(null)
  const [bidders, setBidders] = useState<ListingAgentBidder[]>([])
  const [events, setEvents] = useState<ListingAgentBidEvent[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error: propertyError } = await supabase.from('properties').select('id,address,city,state,zip').eq('id', propertyId).single()
        if (propertyError) throw propertyError
        const [privateBidders, privateEvents] = await Promise.all([
          getListingAgentBidderDetails(propertyId),
          getListingAgentBidHistory(propertyId),
        ])
        setProperty(data)
        setBidders(privateBidders)
        setEvents(privateEvents)
      } catch (cause: unknown) {
        setError(cause instanceof Error ? cause.message : 'This information is available only to the assigned listing agent.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [propertyId])

  if (loading) return <main className="min-h-screen grid place-items-center bg-gray-50">Loading bidder details…</main>

  if (error) return (
    <main className="min-h-screen grid place-items-center bg-gray-50 px-6">
      <section className="max-w-lg rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-black">Private listing information</h1>
        <p className="mt-3 text-gray-600">{error}</p>
        <Link href="/agent/dashboard" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 font-bold text-white">Agent dashboard</Link>
      </section>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7">
          <Link href="/agent/dashboard" className="text-base font-bold text-blue-700">← Agent dashboard</Link>
          <h1 className="mt-4 text-3xl font-black">Private bidder activity</h1>
          <p className="mt-1 text-gray-600">{property?.address}, {property?.city}, {property?.state} {property?.zip}</p>
          <p className="mt-3 max-w-3xl rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-950">Only the listing agent assigned to this property can view bidder identities, contact details, and private maximums. These details never appear in public bid history.</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><h2 className="text-2xl font-black">Bidders</h2><p className="text-gray-600">One row per person, including the maximum they privately authorized.</p></div>
            <div className="text-sm font-bold">{bidders.length} bidder{bidders.length === 1 ? '' : 's'} · {events.length} visible $500 steps</div>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-black text-white"><tr>{['Bidder','Type','Phone','Private maximum','Visible amount','Bid steps','Last activity','Status'].map(x => <th key={x} className="px-4 py-4">{x}</th>)}</tr></thead>
              <tbody>
                {bidders.map(bidder => <tr key={bidder.bidder_id} className="border-t">
                  <td className="px-4 py-4"><strong>{bidder.full_name}</strong><br/><a className="text-blue-700 underline" href={`mailto:${bidder.email}`}>{bidder.email}</a></td>
                  <td className="px-4 py-4 capitalize">{bidder.user_type}</td>
                  <td className="px-4 py-4">{bidder.phone_number ? <a className="text-blue-700 underline" href={`tel:${bidder.phone_number}`}>{bidder.phone_number}</a> : 'Not provided'}</td>
                  <td className="px-4 py-4 text-lg font-black">{money(bidder.maximum_amount)}</td>
                  <td className="px-4 py-4 font-bold">{money(bidder.visible_amount)}</td>
                  <td className="px-4 py-4">{bidder.bid_steps}</td>
                  <td className="px-4 py-4">{new Date(bidder.last_bid_at).toLocaleString()}</td>
                  <td className="px-4 py-4">{bidder.is_leading ? <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-800">Leading</span> : 'Outbid'}</td>
                </tr>)}
                {!bidders.length && <tr><td colSpan={8} className="p-10 text-center text-gray-500">No bids yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black">Complete $500-step history</h2>
          <p className="mb-4 text-gray-600">Every visible increment is recorded separately, even when a bidder authorizes a much higher private maximum.</p>
          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-100"><tr>{['Step','Visible bid','Bidder','Contact','Bidder maximum','Time'].map(x => <th key={x} className="px-4 py-4">{x}</th>)}</tr></thead>
              <tbody>{events.map(event => <tr key={`${event.sequence_number}-${event.created_at}`} className="border-t">
                <td className="px-4 py-3">#{event.sequence_number}</td><td className="px-4 py-3 font-black">{money(event.amount)}</td><td className="px-4 py-3">{event.full_name}</td><td className="px-4 py-3">{event.email}<br/>{event.phone_number || ''}</td><td className="px-4 py-3 font-bold">{money(event.maximum_amount)}</td><td className="px-4 py-3">{new Date(event.created_at).toLocaleString()}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

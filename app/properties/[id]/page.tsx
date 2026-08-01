'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import CountdownTimer from '@/components/CountdownTimer'
import { getCurrentUser } from '@/lib/auth'
import { getPropertyById } from '@/lib/properties'
import {
  getMyOfferStatus,
  getPublicOfferHistory,
  getPublicOfferSummary,
  submitMaximumOffer,
  type MyOfferStatus,
  type OfferSummary,
  type PublicBidEvent,
} from '@/lib/offers'
import { supabase } from '@/lib/supabase'

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

type Property = {
  id: string; address: string; city: string; state: string; zip: string
  bedrooms?: number; beds?: number; bathrooms?: number; baths?: number; sqft: number
  images?: string[]; starting_offer: number; listing_agent_id: string
  offer_end_date: string; description?: string
}
type SignedInUser = { id: string }

export default function PropertyDetailPage() {
  const propertyId = useParams<{ id: string }>().id
  const [property, setProperty] = useState<Property | null>(null)
  const [user, setUser] = useState<SignedInUser | null>(null)
  const [summary, setSummary] = useState<OfferSummary | null>(null)
  const [history, setHistory] = useState<PublicBidEvent[]>([])
  const [myStatus, setMyStatus] = useState<MyOfferStatus | null>(null)
  const [approved, setApproved] = useState(false)
  const [maximum, setMaximum] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [currentUser, prop, publicSummary, publicHistory] = await Promise.all([
        getCurrentUser(), getPropertyById(propertyId), getPublicOfferSummary(propertyId), getPublicOfferHistory(propertyId),
      ])
      setUser(currentUser); setProperty(prop); setSummary(publicSummary); setHistory(publicHistory)
      if (currentUser?.id) {
        const [{ data: approval }, status] = await Promise.all([
          supabase.from('agent_approvals').select('approved').eq('property_id', propertyId).eq('buyer_id', currentUser.id).maybeSingle(),
          getMyOfferStatus(propertyId),
        ])
        setApproved(Boolean(approval?.approved)); setMyStatus(status)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this property.')
    } finally { setLoading(false) }
  }, [propertyId])

  // Loading is an intentional client-side synchronization with Supabase.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  async function requestApproval() {
    if (!user?.id) { window.location.href = `/login?next=/properties/${propertyId}`; return }
    if (!property) { setError('This property is unavailable.'); return }
    setError('')
    const { data: existing } = await supabase.from('agent_approvals').select('id').eq('property_id', propertyId).eq('buyer_id', user.id).maybeSingle()
    const { error: requestError } = existing
      ? await supabase.from('agent_approvals').update({ approved: false }).eq('id', existing.id)
      : await supabase.from('agent_approvals').insert({ property_id: propertyId, buyer_id: user.id, listing_agent_id: property.listing_agent_id, approved: false })
    if (requestError) setError(requestError.message)
    else setNotice('Your approval request was sent to the listing agent.')
  }

  async function placeOffer(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice(''); setSubmitting(true)
    try {
      const result = await submitMaximumOffer(propertyId, Number(maximum))
      setNotice(result.extended ? 'Maximum saved. The offer period was extended by 7 minutes.' : 'Your private maximum was saved.')
      setMaximum(''); await load()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Could not save your maximum.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <main className="min-h-screen grid place-items-center bg-gray-50">Loading property…</main>
  if (!property) return <main className="min-h-screen grid place-items-center bg-gray-50"><Link href="/properties">Back to live listings</Link></main>

  const current = Number(summary?.current_amount ?? property.starting_offer)
  const premium = current * .03
  const minimum = Math.max(current + 500, (myStatus?.maximum_amount ?? current) + 500)

  return <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-950">
    <div className="mx-auto max-w-6xl">
      <Link href="/properties" className="mb-6 inline-flex min-h-12 items-center gap-3 text-lg font-bold text-blue-700">← Back to live listings</Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section>
          <div className="grid gap-2 sm:grid-cols-2">
            {(property.images || []).slice(0, 4).map((src: string, index: number) => <div key={src + index} className={`relative overflow-hidden rounded-2xl ${index === 0 ? 'sm:col-span-2 h-[28rem]' : 'h-64'}`}><Image src={src} alt={`${property.address} photo ${index + 1}`} fill sizes={index === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 640px) 100vw, 33vw'} className="object-cover" /></div>)}
          </div>
          <p className="mt-8 text-sm font-black uppercase tracking-[.18em] text-blue-700">Open for offers</p>
          <h1 className="mt-2 text-4xl font-black">{property.address}</h1>
          <p className="mt-2 text-lg text-gray-600">{property.city}, {property.state} {property.zip}</p>
          <p className="my-6 border-y py-5 text-xl font-bold">{property.bedrooms ?? property.beds} beds · {property.bathrooms ?? property.baths} baths · {Number(property.sqft).toLocaleString()} sq ft</p>
          {property.description && <><h2 className="text-2xl font-black">About this property</h2><p className="mt-3 text-lg leading-8 text-gray-700">{property.description}</p></>}

          <section className="mt-10 rounded-2xl border bg-white p-6">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-blue-700">Public activity</p><h2 className="text-2xl font-black">Offer history</h2></div><p className="text-sm text-gray-600">Every visible change is recorded in exact $500 steps.</p></div>
            <div className="mt-5 divide-y">
              {history.length ? history.map(item => <div key={item.sequence_number} className="grid grid-cols-[1fr_auto] gap-4 py-4"><div><strong>{item.masked_bidder}</strong><p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p></div><strong className="text-lg">{money(item.amount)}</strong></div>) : <p className="py-6 text-gray-600">No offers yet.</p>}
            </div>
          </section>
        </section>

        <aside><div className="sticky top-6 rounded-2xl border bg-white p-7 shadow-sm">
          <CountdownTimer endDate={property.offer_end_date} size="large" />
          <dl className="mt-6 space-y-3"><div className="flex justify-between"><dt>Leading offer</dt><dd className="font-black">{money(current)}</dd></div><div className="flex justify-between"><dt>Buyer premium (3%)</dt><dd className="font-black">{money(premium)}</dd></div><div className="flex justify-between border-t pt-3 text-xl"><dt className="font-black">Estimated total</dt><dd className="font-black text-blue-700">{money(current + premium)}</dd></div></dl>
          <p className="mt-5 text-sm leading-6 text-gray-600">Set the most you are willing to offer. Your maximum stays private. HomeOffer.pro advances the visible offer only as needed, one $500 step at a time, until a bidder’s limit is reached.</p>
          {myStatus && <div className="mt-4 rounded-xl bg-blue-50 p-4"><p className="font-bold">Your private maximum: {money(myStatus.maximum_amount)}</p><p className="text-sm">{myStatus.is_leading ? 'You currently have the leading offer.' : 'Another bidder currently leads.'}</p></div>}
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {notice && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
          {!user ? <Link href={`/login?next=/properties/${propertyId}`} className="mt-5 block rounded-full bg-red-600 px-5 py-3 text-center font-black text-white">Sign in to offer</Link>
          : !approved ? <button onClick={requestApproval} className="mt-5 w-full rounded-full bg-red-600 px-5 py-3 font-black text-white">Request listing agent approval to offer</button>
          : <form onSubmit={placeOffer} className="mt-5"><label className="font-bold" htmlFor="maximum">Your private maximum</label><div className="mt-2 flex"><span className="rounded-l-xl border border-r-0 px-4 py-3">$</span><input id="maximum" type="number" step="500" min={minimum} required value={maximum} onChange={e => setMaximum(e.target.value)} className="min-w-0 flex-1 rounded-r-xl border px-4 py-3" /></div><p className="mt-2 text-xs text-gray-500">Enter an exact $500 increment. Minimum {money(minimum)}.</p><button disabled={submitting} className="mt-4 w-full rounded-full bg-red-600 px-5 py-3 font-black text-white disabled:opacity-50">{submitting ? 'Saving…' : 'Set maximum & submit offer'}</button></form>}
          <p className="mt-5 border-t pt-4 text-sm font-semibold">The seller reserves the right to accept, reject, or counter any offer.</p>
        </div></aside>
      </div>
    </div>
  </main>
}

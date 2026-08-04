'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { primaryButton, secondaryButton } from '@/lib/ui-styles'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { getListingAgentBidderDetails, getListingAgentBidHistory, getPublicOfferSummary } from '@/lib/offers'
import CountdownTimer from '@/components/CountdownTimer'
import type { ListingAgentBidEvent, ListingAgentBidder } from '@/lib/offers'

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

type DashboardProperty = {
  id: string
  address: string
  city: string
  state: string
  zip: string
  status: string
  offer_end_date: string
  starting_offer: number
  bidders: ListingAgentBidder[]
  events: ListingAgentBidEvent[]
  currentAmount: number
  isActive: boolean
}

export default function AgentDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return router.push('/login')
      const { data, error } = await supabase.from('properties').select('*').eq('listing_agent_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      const enriched = await Promise.all((data || []).map(async property => {
        const [bidders, events, summary] = await Promise.all([
          getListingAgentBidderDetails(property.id),
          getListingAgentBidHistory(property.id),
          getPublicOfferSummary(property.id),
        ])
        const isActive = property.status === 'active' && new Date(property.offer_end_date) > new Date()
        return { ...property, bidders, events, currentAmount: summary?.current_amount ?? property.starting_offer, isActive }
      }))
      setProperties(enriched)
    } catch (error) {
      console.error(error)
    } finally { setLoading(false) }
  }, [router])

  // Loading is an intentional client-side synchronization with Supabase.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadDashboard() }, [loadDashboard])

  if (loading) return <main className="min-h-screen grid place-items-center bg-gray-50">Loading dashboard…</main>
  const bidderTotal = properties.reduce((sum, property) => sum + property.bidders.length, 0)
  const stepTotal = properties.reduce((sum, property) => sum + property.events.length, 0)

  return <main className="min-h-screen bg-gray-50 text-gray-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-7"><BackButton href="/" className="mb-5">Back to live listings</BackButton><div className="flex flex-wrap items-center justify-between gap-5"><div><h1 className="text-3xl font-black">Listing agent dashboard</h1><p className="text-gray-600">Your listings, bidders, private maximums and activity.</p></div><div className="flex flex-wrap gap-3"><Link href="/agent/listing-builder" className={primaryButton}>Post a property</Link><Link href="/agent/profile" className={secondaryButton}>Agent information</Link></div></div></div></header>
    <div className="mx-auto max-w-7xl px-5 py-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Listings',properties.length],['Active',properties.filter(p=>p.isActive).length],['Bidders',bidderTotal],['Visible $500 steps',stepTotal]].map(([label,value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="font-bold text-gray-600">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>)}
      </section>
      <section className="mt-8 space-y-6">
        {properties.map(property => <article key={property.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-black p-6 text-white"><div><h2 className="text-2xl font-black">{property.address}</h2><p className="text-gray-300">{property.city}, {property.state} {property.zip}</p></div><div className="text-right"><p className="text-sm text-gray-300">Current visible offer</p><p className="text-3xl font-black">{money(property.currentAmount)}</p></div></div>
          <div className="grid gap-6 p-6 lg:grid-cols-[260px_1fr]">
            <div className="space-y-4">{property.isActive && <CountdownTimer endDate={property.offer_end_date} size="small"/>}<div className="rounded-xl bg-gray-100 p-4"><p><strong>{property.bidders.length}</strong> bidders</p><p><strong>{property.events.length}</strong> visible bid steps</p><p><strong>{property.isActive ? 'Active' : 'Closed'}</strong></p></div><Link href={`/agent/property/${property.id}/offerors`} className={`${primaryButton} w-full`}>Private bidder details</Link><Link href={`/properties/${property.id}`} className={`${secondaryButton} w-full`}>View public listing</Link></div>
            <div><h3 className="text-xl font-black">Bidder overview</h3><p className="mb-4 text-sm text-gray-600">Private maximums are visible only here to you as this property’s listing agent.</p><div className="space-y-3">{property.bidders.slice(0,5).map(bidder => <div key={bidder.bidder_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><strong>{bidder.full_name}</strong><p className="text-sm text-gray-600">{bidder.email} · {bidder.phone_number || 'No phone'}</p></div><div className="text-right"><p className="text-sm text-gray-600">Private maximum</p><strong>{money(bidder.maximum_amount)}</strong></div></div>)}{!property.bidders.length && <p className="rounded-xl border border-dashed p-6 text-center text-gray-500">No bids yet.</p>}</div></div>
          </div>
        </article>)}
        {!properties.length && <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><h2 className="text-2xl font-black">No listings yet</h2><Link href="/agent/listing-builder" className={`${primaryButton} mt-5`}>Create your first listing</Link></div>}
      </section>
    </div>
  </main>
}

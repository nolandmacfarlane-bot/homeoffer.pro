'use client'

import { useEffect, useState } from 'react'
import OfferLink from '@/components/OfferLink'
import { supabase } from '@/lib/supabase'

type Stats = {
  currentAmount: number
  bidCount: number
  endDate: string | null
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function ListingStatsBar({
  address,
  city = '',
  zip = '',
  beds = 0,
  baths = 0,
  sqft = '',
  slug,
  fallbackOffer,
  fallbackTime,
}: {
  address: string
  city?: string
  zip?: string
  beds?: number
  baths?: number
  sqft?: string
  slug: string
  fallbackOffer: number
  fallbackTime: string
}) {
  const [stats, setStats] = useState<Stats>({ currentAmount: fallbackOffer, bidCount: 0, endDate: null })
  const [countdown, setCountdown] = useState(`${fallbackTime} left`)

  useEffect(() => {
    let active = true

    async function loadStats() {
      const { data: property } = await supabase
        .from('properties')
        .select('id, offer_end_date')
        .eq('address', address)
        .limit(1)
        .maybeSingle()

      if (!property || !active) return
      const { data: summary } = await supabase.rpc('get_public_offer_summary', {
        p_property_id: property.id,
      })
      const row = Array.isArray(summary) ? summary[0] : summary

      if (active) {
        setStats({
          currentAmount: Number(row?.current_amount ?? fallbackOffer),
          bidCount: Number(row?.bid_count ?? 0),
          endDate: property.offer_end_date,
        })
      }
    }

    void loadStats()
    return () => { active = false }
  }, [address, fallbackOffer])

  useEffect(() => {
    if (!stats.endDate) return

    function updateCountdown() {
      const difference = new Date(stats.endDate!).getTime() - Date.now()
      if (difference <= 0) {
        setCountdown('Offer period ended')
        return
      }

      const days = Math.floor(difference / 86_400_000)
      const hours = Math.floor((difference / 3_600_000) % 24)
      const minutes = Math.floor((difference / 60_000) % 60)
      const seconds = Math.floor((difference / 1_000) % 60)
      setCountdown(days > 0
        ? `${days}d ${String(hours).padStart(2, '0')}h`
        : `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      )
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1_000)
    return () => window.clearInterval(interval)
  }, [stats.endDate])

  const premium = stats.currentAmount * 0.03
  const total = stats.currentAmount + premium

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid items-stretch lg:grid-cols-[1fr_auto_320px]">
        <div className="px-6 py-6 sm:px-7">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Leading offer</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-slate-950">{money.format(stats.currentAmount)}</p>
          <p className="mt-2 text-base font-medium text-slate-700">{address}, {city} {zip}</p>
        </div>

        <dl className="grid grid-cols-3 border-y border-slate-200 lg:border-x lg:border-y-0">
          {[
            [String(beds), 'beds'],
            [String(baths), 'baths'],
            [sqft, 'sq ft'],
          ].map(([value, label]) => (
            <div key={label} className="flex min-w-24 flex-col justify-center px-5 py-5 text-center">
              <dt className="order-2 mt-1 text-sm font-medium text-slate-500">{label}</dt>
              <dd className="order-1 text-2xl font-black text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col justify-center bg-slate-50 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-slate-600">Time left</span>
            <span className="font-black tabular-nums text-slate-950">{countdown}</span>
          </div>
          <OfferLink
            slug={slug}
            address={address}
            className="mt-4 block rounded-xl bg-blue-700 px-6 py-3.5 text-center font-black text-white transition hover:bg-blue-600"
          >
            Get approved to offer
          </OfferLink>
        </div>
      </div>

      <div className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
        {[
          ["Buyer's premium (3%)", money.format(premium)],
          ['Total purchase price', money.format(total)],
          ['Offers received', String(stats.bidCount)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="font-bold text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

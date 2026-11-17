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
  slug,
  fallbackOffer,
  fallbackTime,
}: {
  address: string
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

  const total = stats.currentAmount * 1.03

  return (
    <section className="mt-4 grid overflow-hidden rounded-2xl bg-[#102f5c] text-white shadow-lg shadow-blue-950/10 lg:grid-cols-[1fr_1fr_.7fr_1fr_auto]">
      {[
        ['Time left', countdown],
        ['Leading offer', money.format(stats.currentAmount)],
        ['Offers', String(stats.bidCount)],
        ['Total price', money.format(total)],
      ].map(([label, value]) => (
        <div key={label} className="border-b border-white/10 px-5 py-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-200">{label}</p>
          <p className="mt-1 text-lg font-black">{value}</p>
        </div>
      ))}
      <div className="flex items-center p-3">
        <OfferLink slug={slug} address={address} className="w-full whitespace-nowrap rounded-xl bg-red-600 px-6 py-3 text-center font-black text-white transition hover:bg-red-500">Get approved</OfferLink>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

export default function ListingCountdown({ address, fallback }: { address: string; fallback: string }) {
  const [endDate, setEndDate] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    let active = true

    async function loadDeadline() {
      const { data } = await supabase
        .from('properties')
        .select('offer_end_date')
        .eq('address', address)
        .limit(1)
        .maybeSingle()

      if (active && data?.offer_end_date) setEndDate(data.offer_end_date)
    }

    void loadDeadline()
    return () => { active = false }
  }, [address])

  useEffect(() => {
    if (!endDate) return

    function update() {
      const difference = new Date(endDate!).getTime() - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference / 3_600_000) % 24),
        minutes: Math.floor((difference / 60_000) % 60),
        seconds: Math.floor((difference / 1_000) % 60),
        expired: false,
      })
    }

    update()
    const interval = window.setInterval(update, 1_000)
    return () => window.clearInterval(interval)
  }, [endDate])

  const underOneDay = timeLeft && !timeLeft.expired && timeLeft.days === 0
  const label = !timeLeft
    ? `${fallback} left`
    : timeLeft.expired
      ? 'Offer period ended'
      : underOneDay
        ? `${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s left`
        : `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}h left`

  return (
    <span
      aria-live="polite"
      className={`inline-flex rounded-full px-4 py-2 text-sm font-black ring-1 ${
        underOneDay
          ? 'bg-amber-300 text-amber-950 ring-amber-200'
          : 'bg-white/15 text-white ring-white/20'
      }`}
    >
      ◷ {label}
    </span>
  )
}

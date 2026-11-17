'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type OfferRow = {
  sequence_number: number
  amount: number
  masked_bidder: string | null
  created_at: string
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export default function OfferHistory({ address, className = '' }: { address: string; className?: string }) {
  const [entries, setEntries] = useState<OfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let active = true

    async function loadHistory() {
      setLoading(true)
      setUnavailable(false)

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('address', address)
        .limit(1)
        .maybeSingle()

      if (propertyError) {
        if (active) {
          setUnavailable(true)
          setLoading(false)
        }
        return
      }

      if (!property) {
        if (active) {
          setEntries([])
          setLoading(false)
        }
        return
      }

      const { data: offers, error: offerError } = await supabase.rpc(
        'get_public_offer_history',
        { p_property_id: property.id }
      )

      if (offerError) {
        if (active) {
          setUnavailable(true)
          setLoading(false)
        }
        return
      }

      if (active) {
        setEntries((offers ?? []) as OfferRow[])
        setLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [address])

  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Offer history</h2>

        </div>
        {!loading && !unavailable && (
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {entries.length} {entries.length === 1 ? 'offer' : 'offers'}
          </span>
        )}
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-slate-500">Loading offer history…</p>
      ) : unavailable ? (
        <p className="m-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Offer history is temporarily unavailable.
        </p>
      ) : entries.length === 0 ? (
        <div className="px-5 py-6">
          <p className="text-sm font-semibold text-slate-900">No offers yet</p>
          <p className="mt-1 text-sm text-slate-500">Be the first to submit an offer.</p>
        </div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto">
          <div className="sticky top-0 grid grid-cols-[1fr_1.1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <span>Buyer</span>
            <span>Submitted</span>
            <span className="text-right">Offer</span>
          </div>
          <ol className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <li
                key={entry.sequence_number}
                className="grid grid-cols-[1fr_1.1fr_auto] items-center gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {entry.masked_bidder || `Buyer ${entry.sequence_number}`}
                  </p>
                  {entry.sequence_number === entries[0]?.sequence_number && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      Leading
                    </span>
                  )}
                </div>
                <time className="text-xs text-slate-500" dateTime={entry.created_at}>
                  {dateTime.format(new Date(entry.created_at))}
                </time>
                <p className="text-right font-bold tabular-nums text-slate-950">
                  {money.format(Number(entry.amount))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

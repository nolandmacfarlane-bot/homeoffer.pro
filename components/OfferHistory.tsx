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
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Offer history</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bidder identities and private maximums are never shown publicly.
          </p>
        </div>
        {!loading && !unavailable && (
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
            {entries.length} {entries.length === 1 ? 'offer' : 'offers'}
          </span>
        )}
      </div>

      {loading ? (
        <p className="mt-5 text-sm font-semibold text-slate-500">
          Loading offer history…
        </p>
      ) : unavailable ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          Offer history is temporarily unavailable.
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="font-black text-slate-950">
            No offers have been submitted yet.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Be the first to submit an offer on this property.
          </p>
        </div>
      ) : (
        <ol className="mt-5 max-h-[360px] divide-y divide-slate-200 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.sequence_number}
              className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                B
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-950">
                    {entry.masked_bidder || `Buyer ${entry.sequence_number}`}
                  </p>
                  {entry.sequence_number === entries[0]?.sequence_number && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
                      Leading
                    </span>
                  )}
                </div>
                <time
                  className="text-sm text-slate-500"
                  dateTime={entry.created_at}
                >
                  {dateTime.format(new Date(entry.created_at))}
                </time>
              </div>
              <p className="text-lg font-black text-slate-950">
                {money.format(Number(entry.amount))}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

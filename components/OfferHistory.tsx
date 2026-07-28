'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type OfferRow = {
  id: string
  buyer_id: string | null
  amount: number
  created_at: string
  is_highest: boolean | null
}

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
}

type HistoryEntry = OfferRow & {
  initials: string
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

function initialsFor(profile?: ProfileRow) {
  const first = profile?.first_name?.trim().charAt(0) ?? ''
  const last = profile?.last_name?.trim().charAt(0) ?? ''
  return `${first}${last}`.toUpperCase()
}

function initialsLabel(initials: string) {
  return initials ? `${initials.split('').join('.') }.` : 'Buyer'
}

export default function OfferHistory({ address }: { address: string }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
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

      const { data: offers, error: offerError } = await supabase
        .from('offers')
        .select('id, buyer_id, amount, created_at, is_highest')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (offerError) {
        if (active) {
          setUnavailable(true)
          setLoading(false)
        }
        return
      }

      const rows = (offers ?? []) as OfferRow[]
      const buyerIds = [
        ...new Set(rows.map((offer) => offer.buyer_id).filter(Boolean)),
      ] as string[]
      const profileMap = new Map<string, ProfileRow>()

      if (buyerIds.length) {
        const { data: profiles } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', buyerIds)

        for (const profile of (profiles ?? []) as ProfileRow[]) {
          profileMap.set(profile.id, profile)
        }
      }

      if (active) {
        setEntries(
          rows.map((offer) => ({
            ...offer,
            initials: offer.buyer_id
              ? initialsFor(profileMap.get(offer.buyer_id))
              : '',
          }))
        )
        setLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [address])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Offer history</h2>
          <p className="mt-1 text-sm text-slate-500">
            Buyer names are abbreviated for privacy.
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
              key={entry.id}
              className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                {entry.initials || 'B'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-950">
                    {initialsLabel(entry.initials)}
                  </p>
                  {entry.is_highest && (
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

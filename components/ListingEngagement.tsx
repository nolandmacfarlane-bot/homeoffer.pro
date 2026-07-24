'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type Preferences = {
  email: boolean
  text: boolean
  emailAddress: string
  phoneNumber: string
}

const defaultPreferences: Preferences = {
  email: true,
  text: false,
  emailAddress: '',
  phoneNumber: '',
}

export default function ListingEngagement({ slug, address }: { slug: string; address: string }) {
  const [showReturnReminder, setShowReturnReminder] = useState(false)
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const viewKey = `homeoffer:last-viewed:${slug}`
    const preferenceKey = `homeoffer:listing-alerts:${slug}`
    const previousView = Number(window.localStorage.getItem(viewKey) || 0)
    const oneDay = 24 * 60 * 60 * 1000

    if (previousView && Date.now() - previousView >= oneDay) {
      setShowReturnReminder(true)
    }

    window.localStorage.setItem(viewKey, String(Date.now()))

    const storedPreferences = window.localStorage.getItem(preferenceKey)
    if (storedPreferences) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(storedPreferences) })
      } catch {
        window.localStorage.removeItem(preferenceKey)
      }
    }
  }, [slug])

  function savePreferences(event: FormEvent) {
    event.preventDefault()
    window.localStorage.setItem(`homeoffer:listing-alerts:${slug}`, JSON.stringify(preferences))
    setSaved(true)
  }

  return (
    <>
      {showReturnReminder && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black text-slate-950">Still interested in {address}?</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">The offer period is still active. Review the latest price and deadline before it ends.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/login" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700">Continue offering</Link>
            <button type="button" onClick={() => setShowReturnReminder(false)} className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-100">Dismiss</button>
          </div>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Listing alerts</p>
        <h2 className="mt-2 text-xl font-black text-slate-950">Never miss an offer update</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose how you want to hear when you are outbid, receive a counter-offer or the deadline is approaching.</p>

        <form onSubmit={savePreferences} className="mt-5 space-y-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
            <input type="checkbox" checked={preferences.email} onChange={(event) => setPreferences({ ...preferences, email: event.target.checked })} className="h-5 w-5 accent-blue-600" />
            <span className="font-black text-slate-900">Email updates</span>
          </label>
          {preferences.email && (
            <input type="email" required value={preferences.emailAddress} onChange={(event) => setPreferences({ ...preferences, emailAddress: event.target.value })} placeholder="Email address" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
            <input type="checkbox" checked={preferences.text} onChange={(event) => setPreferences({ ...preferences, text: event.target.checked })} className="h-5 w-5 accent-blue-600" />
            <span className="font-black text-slate-900">Text message updates</span>
          </label>
          {preferences.text && (
            <input type="tel" required value={preferences.phoneNumber} onChange={(event) => setPreferences({ ...preferences, phoneNumber: event.target.value })} placeholder="Mobile phone number" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
          )}

          <button type="submit" disabled={!preferences.email && !preferences.text} className="w-full rounded-full bg-slate-950 px-5 py-3 font-black text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40">
            Save alert preferences
          </button>
          {saved && <p role="status" className="text-center text-sm font-bold text-blue-700">Your preferences were saved for this property.</p>}
          <p className="text-xs leading-5 text-slate-500">Message frequency varies. Standard message and data rates may apply. You can change your preference at any time.</p>
        </form>
      </section>
    </>
  )
}

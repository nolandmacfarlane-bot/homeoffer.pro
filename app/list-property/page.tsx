'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function ListPropertyPage() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsSignedIn(Boolean(data.session))
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsSignedIn(Boolean(session))
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">For sellers and listing agents</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.045em] sm:text-6xl">List your property on HomeOffer.pro</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Put your home in front of active buyers with a clear 11-day offer period, transparent pricing and $500 offer increments. Accounts and bidding are free; listing agents pay $7 per month only when they publish a property.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={isSignedIn ? '/agent/listing-builder' : '/signup?role=seller'} className="rounded-full bg-blue-600 px-7 py-3.5 text-lg font-black text-white hover:bg-blue-700">Start a property listing</Link>
            {isSignedIn === false && (
              <Link href="/login" className="rounded-full border border-slate-300 bg-white px-7 py-3.5 text-lg font-black text-slate-950 hover:border-blue-400 hover:text-blue-700">Sign in to continue</Link>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            ['01', 'Tell us about the home', 'Add the address, property details, starting offer and description.'],
            ['02', 'Add photos and documents', 'Show buyers the home clearly and provide the information they need.'],
            ['03', 'Review and launch', 'Confirm the terms, publish the listing and begin the 11-day offer period.'],
          ].map(([number, title, copy]) => (
            <div key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">{number}</span>
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-7 py-6 sm:px-9">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">No-sale protection</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">If your home does not sell through HomeOffer.pro</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">You will not owe the 0.5% platform fee on a later off-platform sale. Instead, choose one of these two simple options:</p>
          </div>
          <div className="grid gap-5 p-7 sm:grid-cols-2 sm:p-9">
            <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-6">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-blue-700">Option 1</p>
              <p className="mt-3 text-4xl font-black text-slate-950">$1,000</p>
              <p className="mt-2 font-bold text-slate-700">Paid when the HomeOffer.pro campaign ends without a sale.</p>
            </div>
            <div className="rounded-2xl border border-slate-300 bg-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Option 2</p>
              <p className="mt-3 text-4xl font-black text-slate-950">$2,000</p>
              <p className="mt-2 font-bold text-slate-700">Paid only when the property later closes escrow.</p>
            </div>
          </div>
          <p className="border-t border-slate-200 px-7 py-4 text-xs leading-5 text-slate-500 sm:px-9">The selected option and payment terms will be confirmed in the signed listing documents before launch.</p>
        </section>

        <section className="mt-12 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
          <h2 className="text-3xl font-black">What you will need</h2>
          <ul className="mt-6 grid gap-4 text-sm font-bold text-slate-200 sm:grid-cols-2">
            <li>✓ Property address and basic details</li>
            <li>✓ Starting offer amount</li>
            <li>✓ Clear property photos</li>
            <li>✓ Description and known disclosures</li>
            <li>✓ Listing authority or seller verification</li>
            <li>✓ Contact information for review</li>
          </ul>
        </section>
      </section>
    </main>
  )
}

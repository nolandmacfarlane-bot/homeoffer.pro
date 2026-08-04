'use client'

import { useState } from 'react'
import { primaryButton } from '@/lib/ui-styles'

type Props = {
  title: string
  location: string
  start: string
  end: string
  appleUrl: string
}

export default function AddToCalendar({ title, location, start, end, appleUrl }: Props) {
  const [open, setOpen] = useState(false)
  const googleUrl = new URL('https://calendar.google.com/calendar/render')
  googleUrl.searchParams.set('action', 'TEMPLATE')
  googleUrl.searchParams.set('text', title)
  googleUrl.searchParams.set('dates', `${start}/${end}`)
  googleUrl.searchParams.set('location', location)
  googleUrl.searchParams.set('details', 'Open house listed on HomeOffer.pro')

  return (
    <div className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`${primaryButton} w-full px-4`}
      >
        <span aria-hidden="true">＋</span>
        Add to calendar
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <a
            href={googleUrl.toString()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-black text-slate-900 hover:bg-blue-50 hover:text-blue-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700" aria-hidden="true">G</span>
            Google Calendar
          </a>
          <a
            href={appleUrl}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-black text-slate-900 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-950" aria-hidden="true">●</span>
            Apple Calendar
          </a>
        </div>
      )}
    </div>
  )
}

'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type OpenHouse = {
  date: string
  startTime: string
  endTime: string
}

const emptyForm = {
  address: '',
  city: '',
  state: 'CA',
  zip: '',
  beds: '',
  baths: '',
  sqft: '',
  startingOffer: '',
  description: '',
  virtualTourUrl: '',
  agentName: '',
  brokerage: '',
  dreNumber: '',
  phone: '',
  email: '',
}

export default function AgentListingBuilder() {
  const [form, setForm] = useState(emptyForm)
  const [openHouses, setOpenHouses] = useState<OpenHouse[]>([{ date: '', startTime: '', endTime: '' }])
  const [photoNames, setPhotoNames] = useState<string[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('homeoffer:agent-listing-draft')
    if (!stored) return
    try {
      const draft = JSON.parse(stored)
      setForm({ ...emptyForm, ...draft.form })
      setOpenHouses(draft.openHouses?.length ? draft.openHouses : [{ date: '', startTime: '', endTime: '' }])
      setPhotoNames(draft.photoNames || [])
    } catch {
      window.localStorage.removeItem('homeoffer:agent-listing-draft')
    }
  }, [])

  useEffect(() => {
    return () => photoPreviews.forEach((url) => URL.revokeObjectURL(url))
  }, [photoPreviews])

  function updateField(name: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setSaved(false)
  }

  function updateOpenHouse(index: number, field: keyof OpenHouse, value: string) {
    setOpenHouses((current) => current.map((event, eventIndex) => eventIndex === index ? { ...event, [field]: value } : event))
    setSaved(false)
  }

  function addOpenHouse() {
    setOpenHouses((current) => [...current, { date: '', startTime: '', endTime: '' }])
  }

  function removeOpenHouse(index: number) {
    setOpenHouses((current) => current.filter((_, eventIndex) => eventIndex !== index))
  }

  function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    setPhotoNames(files.map((file) => file.name))
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)))
    setSaved(false)
  }

  function saveDraft(event: FormEvent) {
    event.preventDefault()
    window.localStorage.setItem('homeoffer:agent-listing-draft', JSON.stringify({
      form,
      openHouses,
      photoNames,
      savedAt: new Date().toISOString(),
    }))
    setSaved(true)
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
  const labelClass = 'block text-sm font-black text-slate-800'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-end lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">Agent listing workspace</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">Build a property listing</h1>
              <p className="mt-3 max-w-3xl text-lg text-slate-600">Collect the complete listing, media, open-house schedule and contact information in one organized draft.</p>
            </div>
            <Link
              href="/agent/profile"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-base font-black text-slate-900 transition hover:border-blue-600 hover:text-blue-700"
            >
              ← Agent Dashboard
            </Link>
          </div>
        </section>

        <form onSubmit={saveDraft} className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white">1</span>
              <h2 className="text-2xl font-black">Property information</h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className={labelClass}>Street address<input required className={inputClass} value={form.address} onChange={(e) => updateField('address', e.target.value)} /></label>
              <label className={labelClass}>City<input required className={inputClass} value={form.city} onChange={(e) => updateField('city', e.target.value)} /></label>
              <label className={labelClass}>State<input required className={inputClass} value={form.state} onChange={(e) => updateField('state', e.target.value)} /></label>
              <label className={labelClass}>ZIP code<input required className={inputClass} value={form.zip} onChange={(e) => updateField('zip', e.target.value)} inputMode="numeric" /></label>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className={labelClass}>Bedrooms<input required type="number" min="0" step="1" className={inputClass} value={form.beds} onChange={(e) => updateField('beds', e.target.value)} /></label>
              <label className={labelClass}>Bathrooms<input required type="number" min="0" step="0.5" className={inputClass} value={form.baths} onChange={(e) => updateField('baths', e.target.value)} /></label>
              <label className={labelClass}>Square footage<input required type="number" min="0" step="1" className={inputClass} value={form.sqft} onChange={(e) => updateField('sqft', e.target.value)} /></label>
              <label className={labelClass}>Starting offer<input required type="number" min="0" step="500" className={inputClass} value={form.startingOffer} onChange={(e) => updateField('startingOffer', e.target.value)} /></label>
            </div>
            <label className={`${labelClass} mt-5`}>Property description<textarea rows={5} className={inputClass} value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe the home, improvements, layout and notable features." /></label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white">2</span>
              <h2 className="text-2xl font-black">Photos and 3D tour</h2>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <label className={labelClass}>
                Property photos
                <span className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-5 text-center hover:bg-blue-100">
                  <span className="text-3xl" aria-hidden="true">＋</span>
                  <span className="mt-2 font-black text-blue-700">Choose multiple photos</span>
                  <span className="mt-1 text-xs font-semibold text-slate-500">JPG, PNG or WEBP</span>
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handlePhotos} />
              </label>
              <label className={labelClass}>3D tour or virtual-tour URL<input type="url" className={inputClass} value={form.virtualTourUrl} onChange={(e) => updateField('virtualTourUrl', e.target.value)} placeholder="https://my.matterport.com/show/..." /><span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">Add a Matterport, Zillow 3D Home or other public tour link.</span></label>
            </div>
            {(photoPreviews.length > 0 || photoNames.length > 0) && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {photoPreviews.length > 0 ? photoPreviews.map((src, index) => (
                  <div key={src} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img src={src} alt={photoNames[index] || `Selected property photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                    <p className="truncate px-3 py-2 text-xs font-bold text-slate-600">{photoNames[index]}</p>
                  </div>
                )) : photoNames.map((name) => <div key={name} className="rounded-xl bg-slate-100 p-3 text-xs font-bold text-slate-600">{name}</div>)}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white">3</span>
                <h2 className="text-2xl font-black">Open houses</h2>
              </div>
              <button type="button" onClick={addOpenHouse} className="rounded-full border-2 border-blue-600 px-5 py-2.5 font-black text-blue-700 hover:bg-blue-50">＋ Add another date</button>
            </div>
            <div className="mt-6 space-y-4">
              {openHouses.map((event, index) => (
                <div key={index} className="grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                  <label className={labelClass}>Date<input required type="date" className={inputClass} value={event.date} onChange={(e) => updateOpenHouse(index, 'date', e.target.value)} /></label>
                  <label className={labelClass}>Start time<input required type="time" className={inputClass} value={event.startTime} onChange={(e) => updateOpenHouse(index, 'startTime', e.target.value)} /></label>
                  <label className={labelClass}>End time<input required type="time" className={inputClass} value={event.endTime} onChange={(e) => updateOpenHouse(index, 'endTime', e.target.value)} /></label>
                  <button type="button" onClick={() => removeOpenHouse(index)} disabled={openHouses.length === 1} className="rounded-xl px-4 py-3 font-black text-red-600 hover:bg-red-50 disabled:opacity-30">Remove</button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-black text-white">4</span>
              <h2 className="text-2xl font-black">Listing-agent contact</h2>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className={labelClass}>Agent name<input required className={inputClass} value={form.agentName} onChange={(e) => updateField('agentName', e.target.value)} /></label>
              <label className={labelClass}>Brokerage<input required className={inputClass} value={form.brokerage} onChange={(e) => updateField('brokerage', e.target.value)} /></label>
              <label className={labelClass}>License / DRE number<input className={inputClass} value={form.dreNumber} onChange={(e) => updateField('dreNumber', e.target.value)} /></label>
              <label className={labelClass}>Phone number<input required type="tel" className={inputClass} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></label>
              <label className={labelClass}>Email address<input required type="email" className={inputClass} value={form.email} onChange={(e) => updateField('email', e.target.value)} /></label>
            </div>
          </section>

          <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-600">{saved ? 'Draft saved on this device.' : 'Save your work before leaving this page.'}</p>
            <button type="submit" className="rounded-full bg-blue-600 px-7 py-3.5 text-lg font-black text-white hover:bg-blue-700">Save listing draft</button>
          </div>
        </form>
      </main>
    </>
  )
}

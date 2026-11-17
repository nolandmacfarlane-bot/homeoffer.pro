import Link from 'next/link'
import BackButton from '@/components/BackButton'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ListingEngagement from '@/components/ListingEngagement'
import AddToCalendar from '@/components/AddToCalendar'
import OfferHistory from '@/components/OfferHistory'
import OfferLink from '@/components/OfferLink'

const homes: Record<string, {
  address: string
  city: string
  zip: string
  beds: number
  baths: number
  sqft: string
  offer: number
  time: string
  description: string
  features: string[]
  crop: string
}> = {
  '8575-hidden-lakes-drive': {
    address: '8575 Hidden Lakes Drive',
    city: 'Granite Bay, CA',
    zip: '95746',
    beds: 5,
    baths: 4,
    sqft: '4,218',
    offer: 612500,
    time: '18h 42m',
    description: 'A spacious Granite Bay residence designed for comfortable everyday living and entertaining, with generous indoor and outdoor gathering areas.',
    features: ['Five bedrooms', 'Four bathrooms', 'Three-car garage', 'Large entertaining spaces', 'Private backyard', 'Granite Bay location'],
    crop: 'object-[70%_center]',
  },
  '1642-poppy-circle': {
    address: '1642 Poppy Circle',
    city: 'Rocklin, CA',
    zip: '95765',
    beds: 5,
    baths: 3,
    sqft: '2,729',
    offer: 438000,
    time: '2d 08h',
    description: 'First time on the market, with a low-maintenance backyard, workshop, gazebo, pergola and an updated balcony off the primary suite.',
    features: ['Five bedrooms', 'Three bathrooms', 'Workshop', 'Gazebo and pergola', 'Primary-suite balcony', 'Near shopping and schools'],
    crop: 'object-[82%_center]',
  },
  '1064-empire-mine-road': {
    address: '1064 Empire Mine Road',
    city: 'Folsom, CA',
    zip: '95630',
    beds: 3,
    baths: 3,
    sqft: '2,184',
    offer: 526500,
    time: '4d 14h',
    description: 'A well-proportioned Folsom home with flexible living space, comfortable bedrooms and convenient access to local recreation and amenities.',
    features: ['Three bedrooms', 'Three bathrooms', 'Open living area', 'Attached garage', 'Outdoor entertaining area', 'Folsom location'],
    crop: 'object-center',
  },
  '2289-pleasant-grove-blvd': {
    address: '2289 Pleasant Grove Blvd',
    city: 'Roseville, CA',
    zip: '95747',
    beds: 4,
    baths: 3,
    sqft: '2,956',
    offer: 574000,
    time: '6d 03h',
    description: 'A Roseville home offering four bedrooms, multiple living areas and a practical layout close to everyday shopping and community amenities.',
    features: ['Four bedrooms', 'Three bathrooms', 'Multiple living areas', 'Attached garage', 'Backyard patio', 'Roseville location'],
    crop: 'object-[60%_center]',
  },
  '6120-colwell-lane': {
    address: '6120 Colwell Lane',
    city: 'Loomis, CA',
    zip: '95650',
    beds: 4,
    baths: 4,
    sqft: '3,604',
    offer: 697500,
    time: '8d 19h',
    description: 'A larger Loomis residence with room to gather, work and relax, set in a desirable community near trails, shopping and major routes.',
    features: ['Four bedrooms', 'Four bathrooms', 'Large kitchen', 'Home office space', 'Three-car garage', 'Loomis location'],
    crop: 'object-[75%_center]',
  },
  '3390-vista-robles-way': {
    address: '3390 Vista Robles Way',
    city: 'Auburn, CA',
    zip: '95602',
    beds: 3,
    baths: 2,
    sqft: '2,310',
    offer: 459000,
    time: '10d 11h',
    description: 'An Auburn property with a comfortable single-level feel, useful outdoor space and access to the foothill lifestyle.',
    features: ['Three bedrooms', 'Two bathrooms', 'Flexible living space', 'Attached garage', 'Outdoor area', 'Auburn location'],
    crop: 'object-left',
  },
}

const money = (amount: number) => amount.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const home = homes[slug]
  if (!home || !['8575-hidden-lakes-drive', '1642-poppy-circle'].includes(slug)) notFound()

  const premium = home.offer * 0.03
  const total = home.offer + premium

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <BackButton href="/#homes">Back to live listings</BackButton>

        <div className="mt-5 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-slate-200 lg:min-h-[560px]">
            <Image src="/homeoffer-hero.webp" alt={home.address} fill priority sizes="(max-width: 1024px) 100vw, 67vw" className={`object-cover ${home.crop}`} />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="relative min-h-44 overflow-hidden rounded-2xl bg-slate-200">
              <Image src="/homeoffer-hero.webp" alt={`${home.address} exterior view`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover object-left" />
            </div>
            <div className="relative min-h-44 overflow-hidden rounded-2xl bg-slate-200">
              <Image src="/homeoffer-hero.webp" alt={`${home.address} additional view`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover object-right" />
            </div>
          </div>
        </div>

        <header className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Open for offers</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{home.address}</h1>
            <p className="mt-2 text-lg font-semibold text-slate-600">{home.city} {home.zip}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-black text-slate-700">
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">{home.beds} beds</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">{home.baths} baths</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-sm">{home.sqft} sq ft</span>
          </div>
        </header>

        <section id="offer-process" className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102f5c] via-[#17477d] to-[#1d5b9a] p-7 text-white shadow-xl shadow-blue-950/15 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Offer overview</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">Make your strongest offer</h2>
              </div>
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-black ring-1 ring-white/20">◷ {home.time} left</span>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                <dt className="text-sm font-bold text-blue-100">Leading offer</dt>
                <dd className="mt-2 text-3xl font-black">{money(home.offer)}</dd>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                <dt className="text-sm font-bold text-blue-100">Buyer&apos;s premium (3%)</dt>
                <dd className="mt-2 text-3xl font-black">{money(premium)}</dd>
              </div>
              <div className="rounded-2xl bg-emerald-400 p-5 text-emerald-950 sm:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <dt className="text-sm font-black uppercase tracking-[0.12em]">Total purchase price</dt>
                  <dd className="text-4xl font-black tracking-tight">{money(total)}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-7 grid items-center gap-4 sm:grid-cols-[minmax(0,280px)_1fr]">
              <OfferLink slug={slug} address={home.address} className="rounded-full bg-red-600 px-6 py-4 text-center text-lg font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-500">Get approved to offer</OfferLink>
              <p className="text-sm leading-6 text-blue-100">Every offer increases in $500 increments until it reaches the maximum limit you set.</p>
            </div>
            <p className="mt-5 border-t border-white/15 pt-5 text-sm font-semibold text-blue-100">The seller reserves the right to accept, reject or counter any offer.</p>
          </div>

          <OfferHistory address={home.address} className="h-full rounded-[28px] border-0 shadow-lg shadow-slate-950/5" />
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[28px] bg-white p-7 shadow-sm sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Property details</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">About this home</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{home.description}</p>
            <div className="mt-8 rounded-2xl bg-blue-50 p-6">
              <h3 className="text-xl font-black text-slate-950">How the offer process works</h3>
              <p className="mt-2 leading-7 text-slate-600">Review the property information, become approved to participate and submit your offer before the timer ends. Your private maximum is never shown publicly.</p>
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-500">Property details shown are for the current marketplace preview and should be independently verified.</p>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-950">Open houses</h2>
              <p className="mt-1 text-sm text-slate-500">{home.address}, {home.city} {home.zip}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { day: 'Sat, Jul 25', time: '11:00 AM - 1:00 PM', start: '20260725T180000Z', end: '20260725T200000Z' },
                  { day: 'Sun, Jul 26', time: '1:00 PM - 4:00 PM', start: '20260726T200000Z', end: '20260726T230000Z' },
                ].map((event) => {
                  const calendarUrl = `/api/open-house-calendar?title=${encodeURIComponent(`Open House: ${home.address}`)}&location=${encodeURIComponent(`${home.address}, ${home.city} ${home.zip}`)}&start=${event.start}&end=${event.end}`
                  return (
                    <div key={event.start} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{event.day}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{event.time}</p>
                      <AddToCalendar
                        title={`Open House: ${home.address}`}
                        location={`${home.address}, ${home.city} ${home.zip}`}
                        start={event.start}
                        end={event.end}
                        appleUrl={calendarUrl}
                      />
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Listed by</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl font-black text-blue-700" aria-hidden="true">HO</div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">HomeOffer.pro Listing Team</h2>
                  <p className="mt-1 text-sm font-bold text-slate-600">Listing contact details are available to registered participants.</p>
                </div>
              </div>
              <Link href={`/login?next=/listing/${slug}`} className="mt-5 block rounded-full border-2 border-blue-600 px-5 py-3 text-center font-black text-blue-700 hover:bg-blue-50">Contact listing agent</Link>
            </section>

            <ListingEngagement slug={slug} address={home.address} />
          </aside>
        </div>
      </div>
    </main>
  )
}

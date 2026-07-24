import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'

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
  if (!home) notFound()

  const premium = home.offer * 0.03
  const total = home.offer + premium

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <Link href="/#homes" className="inline-flex items-center gap-2 text-lg font-black text-blue-700 transition hover:text-blue-900"><span className="text-2xl leading-none" aria-hidden="true">←</span><span>Back to live listings</span></Link>

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

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-600">Open for offers</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">{home.address}</h1>
            <p className="mt-2 text-lg font-semibold text-slate-600">{home.city} {home.zip}</p>

            <div className="mt-6 flex flex-wrap gap-3 border-y border-slate-200 py-5 text-lg font-black">
              <span>{home.beds} beds</span><span className="text-slate-300">·</span>
              <span>{home.baths} baths</span><span className="text-slate-300">·</span>
              <span>{home.sqft} sq ft</span>
            </div>

            <section className="py-8">
              <h2 className="text-2xl font-black">About this property</h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{home.description}</p>
            </section>

            <section className="border-t border-slate-200 py-8">
              <h2 className="text-2xl font-black">Property highlights</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {home.features.map((feature) => (
                  <li key={feature} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold">✓ {feature}</li>
                ))}
              </ul>
            </section>

            <section className="border-t border-slate-200 py-8">
              <h2 className="text-2xl font-black">Offer process</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Offers increase in $500 increments. Review the property information, become approved to participate and submit your offer before the timer ends.</p>
            </section>
          </div>

          <aside className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-950/5">
            <span className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-base font-black text-white">◷ {home.time} left</span>
            <dl className="mt-7 space-y-4 text-base">
              <div className="flex justify-between gap-4"><dt className="font-bold text-slate-600">Leading offer</dt><dd className="font-black">{money(home.offer)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="font-bold text-slate-600">Buyer&apos;s premium (3%)</dt><dd className="font-black">{money(premium)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-lg"><dt className="font-black">Total price</dt><dd className="font-black text-blue-700">{money(total)}</dd></div>
            </dl>
            <Link href="/login" className="mt-7 block rounded-full bg-red-600 px-6 py-4 text-center text-lg font-black text-white transition hover:bg-red-700">Get approved to offer</Link>
            <p className="mt-5 text-center text-sm leading-6 text-slate-500">Property details shown are for the current marketplace preview and should be independently verified.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}

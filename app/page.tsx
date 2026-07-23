import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

const listings = [
  { city: 'Granite Bay, CA', address: '8575 Hidden Lakes Drive', beds: 5, baths: 4, sqft: '4,218', offer: 612500, time: '18h 42m', hours: 18, crop: 'object-[70%_center]' },
  { city: 'Rocklin, CA', address: '1642 Poppy Circle', beds: 5, baths: 3, sqft: '2,729', offer: 438000, time: '2d 08h', hours: 56, crop: 'object-[82%_center]' },
  { city: 'Folsom, CA', address: '1064 Empire Mine Road', beds: 3, baths: 3, sqft: '2,184', offer: 526500, time: '4d 14h', hours: 110, crop: 'object-center' },
  { city: 'Roseville, CA', address: '2289 Pleasant Grove Blvd', beds: 4, baths: 3, sqft: '2,956', offer: 574000, time: '6d 03h', hours: 147, crop: 'object-[60%_center]' },
  { city: 'Loomis, CA', address: '6120 Colwell Lane', beds: 4, baths: 4, sqft: '3,604', offer: 697500, time: '8d 19h', hours: 211, crop: 'object-[75%_center]' },
  { city: 'Auburn, CA', address: '3390 Vista Robles Way', beds: 3, baths: 2, sqft: '2,310', offer: 459000, time: '10d 11h', hours: 251, crop: 'object-left' },
].sort((a, b) => a.hours - b.hours)

const money = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#0b1220]">
      <Navbar />

      <section className="border-b border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Open marketplace</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Active <span className="text-blue-600">homes</span></h1>
            <p className="mt-2 text-sm font-medium text-slate-600">Browse freely. Properties ending soon appear first.</p>
          </div>
          <Link href="/properties" className="w-fit rounded-full bg-[#0b1220] px-6 py-3 text-sm font-black text-white transition hover:bg-blue-600">Browse all homes</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white">Ending soon</button>
            <button className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Newly listed</button>
            <button className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Highest offer</button>
          </div>
          <p className="text-sm font-semibold text-slate-500"><span className="font-black text-slate-950">{listings.length}</span> active properties · 11-day offer periods · $500 increments</p>
        </div>

        <div className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((home) => {
            const buyerPremium = home.offer * 0.03
            const total = home.offer + buyerPremium

            return (
              <article key={home.address} className="group overflow-hidden border-b border-slate-200 bg-white pb-6">
                <div className="relative h-56 overflow-hidden rounded-xl bg-slate-200">
                  <Image src="/homeoffer-hero.webp" alt={`${home.address}, ${home.city}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className={`object-cover transition duration-500 group-hover:scale-[1.03] ${home.crop}`} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-5 pb-5 pt-14 text-white">
                    <span className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-black"><span aria-hidden="true">◷</span>{home.time} left</span>
                  </div>
                </div>

                <div className="pt-4">
                  <h2 className="text-lg font-black tracking-tight">{home.address}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{home.city}</p>
                  <p className="mt-2 text-sm text-slate-600">{home.beds} beds · {home.baths} baths · {home.sqft} sq ft</p>

                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="font-bold text-slate-600">Leading offer</dt><dd className="font-black text-slate-950">{money(home.offer)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="font-bold text-slate-600">Buyer&apos;s premium <span className="text-xs">(3%)</span></dt><dd className="font-black text-slate-950">{money(buyerPremium)}</dd></div>
                      <div className="flex justify-between gap-3 border-t border-blue-200 pt-2"><dt className="font-black">Total price</dt><dd className="font-black text-blue-700">{money(total)}</dd></div>
                    </dl>
                    <details className="mt-3 border-t border-blue-100 pt-3 text-xs text-slate-600">
                      <summary className="cursor-pointer font-bold text-blue-700">How pricing works</summary>
                      <p className="mt-2 leading-5">The buyer&apos;s premium is added to the accepted offer and includes HomeOffer&apos;s platform fee and buyer-agent compensation. Agent compensation is negotiable and may vary by agreement. Closing costs are separate.</p>
                    </details>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link href="/properties" className="font-black text-blue-700 hover:text-blue-900">View property →</Link>
                    <Link href="/login" className="rounded-full bg-[#0b1220] px-4 py-2 text-sm font-black text-white hover:bg-blue-600">Submit offer</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#0b1220] px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-400">Simple by design</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">How <span className="text-blue-400">HomeOffer</span> works</h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {[
              ['01', 'Browse openly', 'Explore every active home and see the leading offer, premium, total price and time remaining without signing in.'],
              ['02', 'Get ready to offer', 'Review the property, confirm your financing and representation, then complete bidding approval.'],
              ['03', 'Submit confidently', 'Offers move in $500 increments during an 11-day window. Everything stays visible and organized.'],
            ].map(([number, title, copy]) => (
              <div key={number} className="border-t border-slate-700 pt-5">
                <span className="text-sm font-black text-blue-400">{number}</span>
                <h3 className="mt-3 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div id="buyers" className="scroll-mt-24 rounded-2xl border border-slate-200 p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">For buyers</p>
            <h2 className="mt-2 text-2xl font-black">See the competition clearly.</h2>
            <p className="mt-3 leading-7 text-slate-600">Browse without an account, compare total prices and follow the homes you care about. Sign in only when you&apos;re ready to take action.</p>
            <Link id="submit-an-offer" href="/properties" className="mt-6 inline-flex scroll-mt-24 rounded-full bg-blue-600 px-5 py-3 font-black text-white hover:bg-blue-700">Find a home</Link>
          </div>
          <div id="sellers" className="scroll-mt-24 rounded-2xl border border-slate-200 p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">For sellers</p>
            <h2 className="mt-2 text-2xl font-black">Create focused competition.</h2>
            <p className="mt-3 leading-7 text-slate-600">Launch an organized 11-day offer period, keep buyers informed and review every offer in one place.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-full bg-[#0b1220] px-5 py-3 font-black text-white hover:bg-blue-600">List a property</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-slate-200 bg-[#f6f8fb] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Questions answered</p>
          <h2 className="mt-2 text-3xl font-black">HomeOffer FAQ</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {[
              ['Do I need an account to browse?', 'No. Anyone can browse active homes and view pricing without signing in.'],
              ['How long is the offer period?', 'Each home is open for offers for 11 days, typically from Thursday through the second Monday.'],
              ['How much does the next offer increase?', 'Offers move in clear $500 increments.'],
              ['What is the buyer’s premium?', 'The buyer’s premium is 3% of the accepted offer. It is added to the offer to calculate the total price and includes the platform fee and buyer-agent compensation.'],
              ['Can the seller accept or reject an offer?', 'Yes. The seller retains the right to accept, reject or counter an offer according to the listing terms.'],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black"><span>{question}</span><span className="text-xl text-blue-600 group-open:rotate-45">+</span></summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950 px-5 py-10 text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm sm:flex-row"><p>© 2026 <span className="font-bold text-white">HomeOffer<span className="text-blue-400">.pro</span></span></p><div className="flex gap-6"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/sms-policy">SMS policy</Link></div></div>
      </footer>
    </main>
  )
}

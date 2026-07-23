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

      <section id="how-it-works" className="scroll-mt-24 border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Simple by design</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                How <span className="text-blue-600">HomeOffer.pro</span> works
              </h1>
              <p className="mt-3 max-w-lg leading-7 text-slate-600">
                Browse openly, understand the full price and submit a clear offer when you&apos;re ready.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['01', 'Browse homes', 'See the leading offer, total price and time remaining.'],
                ['02', 'Get approved', 'Review the property, financing and representation details.'],
                ['03', 'Make an offer', 'Submit in clear $500 increments during the 11-day window.'],
              ].map(([number, title, copy]) => (
                <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">{number}</span>
                  <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="homes" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.035em] text-slate-950">Live <span className="text-blue-600">listings</span></h2>
            <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white">Ending soon</button>
            <button className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Newly listed</button>
            <button className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Highest offer</button>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-sm font-semibold text-slate-500"><span className="font-black text-slate-950">{listings.length}</span> active properties · 11 days · $500 increments</p>
            <Link href="/properties" className="text-sm font-black text-blue-700 hover:text-blue-900">View all properties →</Link>
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((home) => {
            const buyerPremium = home.offer * 0.03
            const total = home.offer + buyerPremium

            return (
              <article key={home.address} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/10">
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

      <section id="agent-partners" className="scroll-mt-20 border-y border-slate-200 bg-[#f6f8fb] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Built for agents
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Grow your business.<br />
                <span className="text-blue-600">Grow your network.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Join HomeOffer for just $7 a month, bring listings to a more transparent marketplace and earn partner rewards when agents in your network close real transactions.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-full bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-700">
                  Join for $7/month
                </Link>
                <Link href="/#agent-program-details" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-black text-slate-900 transition hover:border-blue-300 hover:text-blue-700">
                  See how rewards work
                </Link>
              </div>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ['$7', 'per month'],
                  ['2', 'reward levels'],
                  ['$0', 'for recruiting alone'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-2xl font-black text-slate-950">{value}</p>
                    <p className="mt-1 text-xs font-bold leading-4 text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="agent-program-details" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Agent Partner Program</p>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">Two levels. One simple goal.</h3>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">Rewards after closing</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black">You</div>
                    <p className="mt-5 text-sm font-bold text-slate-400">Your role</p>
                    <p className="mt-1 text-lg font-black">Build with HomeOffer</p>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">1</div>
                      <span className="text-2xl font-black text-blue-700">$250</span>
                    </div>
                    <p className="mt-5 text-sm font-bold text-blue-700">Direct partner</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">An agent you introduced closes a HomeOffer transaction.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700">2</div>
                      <span className="text-2xl font-black text-slate-950">$75</span>
                    </div>
                    <p className="mt-5 text-sm font-bold text-slate-800">Extended network</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">Their direct partner closes a HomeOffer transaction.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                  <p className="font-black text-slate-950">How a reward becomes eligible</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      ['01', 'An agent joins', 'They activate a $7 monthly agent membership.'],
                      ['02', 'A home is sold', 'A legitimate HomeOffer transaction successfully closes.'],
                      ['03', 'Rewards are released', 'Eligible partner rewards are paid from HomeOffer revenue.'],
                    ].map(([number, title, copy]) => (
                      <div key={number} className="flex gap-3">
                        <span className="font-black text-blue-600">{number}</span>
                        <div>
                          <p className="text-sm font-black text-slate-900">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-slate-500">
                  No reward is paid for recruiting or subscription activity alone. Program eligibility, amounts and payment timing are subject to licensing, brokerage approval, transaction requirements and final program terms.
                </p>
              </div>
            </div>
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
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 text-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex rounded-xl bg-white px-3 py-2 transition hover:opacity-90"
              aria-label="HomeOffer.pro home"
            >
              <Image
                src="/homeoffer-logo-15.png"
                alt="HomeOffer.pro"
                width={1908}
                height={824}
                className="h-9 w-auto"
              />
            </Link>
            <p>© 2026</p>
          </div>
          <div className="flex gap-6"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/sms-policy">SMS policy</Link></div>
        </div>
      </footer>
    </main>
  )
}

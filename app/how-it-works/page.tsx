import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Why HomeOffer.pro | A Clearer Way to Buy and Sell',
  description:
    'See how HomeOffer.pro creates a clearer, more organized real estate offer process for buyers, sellers, listing agents, buyer agents and brokers.',
}

const audiences = [
  {
    name: 'For buyers',
    bullets: [
      'See the leading offer and estimated total price',
      'Find open houses and deadlines quickly',
      'Use your own real estate agent',
    ],
  },
  {
    name: 'For sellers',
    bullets: [
      'Create urgency with an 11-day offer period',
      'Attract attention with a low starting offer',
      'Accept, reject or counter any offer',
    ],
  },
  {
    name: 'For listing agents',
    bullets: [
      'Manage one organized listing campaign',
      'Keep photos, dates and pricing together',
      'Spend less time repeating basic information',
    ],
  },
  {
    name: 'For buyer agents',
    bullets: [
      'Stay involved throughout the offer process',
      'Review the same information as your buyer',
      'Keep compensation clearly explained',
    ],
  },
  {
    name: 'For brokers',
    bullets: [
      'Use a consistent process across agents',
      'Maintain brokerage oversight',
      'Track eligible closings and rewards',
    ],
  },
]

const questions = [
  {
    question: 'Is HomeOffer.pro a traditional auction?',
    answer:
      'HomeOffer.pro is a structured real estate offer marketplace. The seller’s rights, the offer terms and any extension rules are controlled by the signed transaction documents. It should not be treated as an absolute auction unless the documents expressly say so.',
  },
  {
    question: 'Can a buyer use their own real estate agent?',
    answer:
      'Yes. Buyers can work with a licensed real estate agent of their choosing, subject to the representation agreement, brokerage requirements and the terms for the property.',
  },
  {
    question: 'How is the buyer agent included?',
    answer:
      'The buyer agent can help the buyer evaluate the property, financing, disclosures and offer terms. Any compensation must be disclosed and agreed to in the applicable written agreements.',
  },
  {
    question: 'What does the buyer’s premium pay for?',
    answer:
      'The displayed buyer’s premium is intended to include buyer-agent compensation and the HomeOffer.pro platform fee. The exact allocation, amount and payment terms are governed by the signed agreements and may be negotiable where required.',
  },
  {
    question: 'Does the seller have to accept the highest offer?',
    answer:
      'No. The seller is not required to accept the highest offer and reserves the right to accept, reject or counter any offer.',
  },
  {
    question: 'Can financed buyers participate?',
    answer:
      'Yes, when financing is permitted by the listing terms. Buyers should review qualification, proof-of-funds, loan and contingency requirements with their lender and agent before offering.',
  },
  {
    question: 'What happens if an offer arrives near the deadline?',
    answer:
      'Any automatic extension or final-offer procedure must be stated in the property’s rules and signed documents. The listing page should show the controlling deadline.',
  },
  {
    question: 'Is every offer and buyer detail public?',
    answer:
      'No. The marketplace can show useful pricing and activity information without publishing confidential personal, financial or contractual information.',
  },
  {
    question: 'What if the property does not sell through HomeOffer.pro?',
    answer:
      'Under the proposed no-sale policy, the seller chooses the agreed $1,000 campaign-end option or the $2,000 close-of-escrow option. A later off-platform sale would not also trigger the 0.5% platform fee. The signed listing documents control.',
  },
  {
    question: 'Does HomeOffer.pro replace an agent, broker, lender or attorney?',
    answer:
      'No. The platform organizes discovery and the offer process. Licensed professionals remain responsible for representation, supervision, financing, disclosures, contracts and legal or tax advice.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white text-[#0b1220]">
      <Navbar />

      <section className="border-b border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Why HomeOffer.pro
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Turn buyer interest into a clear, competitive offer process.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              Instead of letting a listing sit while buyers wonder what to do next, HomeOffer.pro
              brings interested buyers into one defined offer window. Buyers can see the leading offer,
              full price and deadline, while sellers gain urgency, visibility and a better opportunity
              for competing offers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-blue-600 px-6 py-3.5 text-base font-black text-white transition hover:bg-blue-700"
              >
                Browse live listings
              </Link>
              <Link
                href="/list-property"
                className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-base font-black text-slate-950 transition hover:border-blue-300 hover:text-blue-700"
              >
                List a property
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <p className="text-sm font-black text-slate-950">The HomeOffer.pro difference</p>
            <dl className="mt-5 divide-y divide-slate-200">
              {[
                ['11 days', 'One clear offer window'],
                ['$500', 'Simple offer increments'],
                ['Up front', 'Leading offer and total price'],
                ['One place', 'Listings, open houses and offer activity'],
              ].map(([value, label]) => (
                <div key={label} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm font-bold text-slate-600">{label}</dt>
                  <dd className="text-right text-xl font-black text-blue-700">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <nav
        aria-label="Page sections"
        className="sticky top-[74px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl sm:top-[92px]"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-6 lg:px-8">
          {audiences.map((audience) => (
            <a
              key={audience.name}
              href={`#${audience.name.toLowerCase().replaceAll(' ', '-').replace('for-', '')}`}
              className="whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {audience.name}
            </a>
          ))}
          <a
            href="#questions"
            className="whitespace-nowrap rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Questions answered
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Who benefits?
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
            One platform. Clear benefits for everyone.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {audiences.map((audience) => {
            const id = audience.name.toLowerCase().replaceAll(' ', '-').replace('for-', '')

            return (
              <article
                id={id}
                key={audience.name}
                className="scroll-mt-44 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-xl font-black tracking-[-0.02em] text-slate-950">
                  {audience.name}
                </h3>
                <ul className="mt-5 space-y-4">
                  {audience.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm font-bold leading-6 text-slate-600">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700"
                      >
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f6f8fb] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Why use HomeOffer.pro?
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              A simpler way to create competition for a home.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Buyers know what is happening, sellers get a focused offer period and everyone can
              follow the same clear process.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'A clear deadline',
                copy: 'Buyers have 11 days to view the home, attend open houses and submit an offer.',
              },
              {
                title: 'Straightforward pricing',
                copy: 'The leading offer, buyer’s premium and total price are shown clearly before anyone offers.',
              },
              {
                title: 'More buyer attention',
                copy: 'A low starting offer and defined timeline can encourage more buyers to look and participate.',
              },
              {
                title: 'The seller stays in control',
                copy: 'The seller reserves the right to accept, reject or counter any offer—including the highest offer.',
              },
            ].map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white"
                >
                  ✓
                </span>
                <h3 className="mt-5 text-xl font-black text-slate-950">{benefit.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{benefit.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="questions" className="scroll-mt-44 mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Questions answered
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
          What buyers, sellers and real estate professionals will want to know
        </h2>

        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black text-slate-950">
                <span>{question}</span>
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-blue-600 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-4xl pr-10 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
              A different approach to real estate
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
              Start with the part of HomeOffer.pro built for you.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Browse as a buyer, launch a property as a seller or join as a participating real
              estate professional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-blue-600 px-6 py-3.5 font-black text-white transition hover:bg-blue-500"
            >
              Browse homes
            </Link>
            <Link
              href="/list-property"
              className="rounded-full border border-slate-600 px-6 py-3.5 font-black text-white transition hover:border-white"
            >
              Sell a property
            </Link>
            <Link
              href="/signup?role=agent"
              className="rounded-full border border-slate-600 px-6 py-3.5 font-black text-white transition hover:border-white"
            >
              Join as an agent
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs leading-5 text-slate-400">
          Features and outcomes vary by property and transaction. Nothing on this page guarantees
          a sale price, number of offers, closing timeline or agent compensation. All activity is
          subject to signed agreements, brokerage approval and applicable law.
        </p>
      </section>
    </main>
  )
}

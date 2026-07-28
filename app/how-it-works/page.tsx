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
    number: '01',
    name: 'For buyers',
    headline: 'Shop with more context and less guesswork.',
    intro:
      'HomeOffer.pro puts the information buyers need to act confidently in one place.',
    benefits: [
      {
        title: 'See opportunities immediately',
        copy: 'Active homes appear first, so buyers can browse naturally instead of landing on an empty search screen.',
      },
      {
        title: 'Understand the full price',
        copy: 'The leading offer, buyer’s premium and estimated total price are shown separately before a buyer submits an offer.',
      },
      {
        title: 'Plan the next step',
        copy: 'Open-house dates, property details, time remaining and agent contact information are easy to find from the listing.',
      },
    ],
  },
  {
    number: '02',
    name: 'For sellers',
    headline: 'Create a focused moment around the sale.',
    intro:
      'A defined offer period gives the property a clear launch, timeline and call to action.',
    benefits: [
      {
        title: 'Concentrated market attention',
        copy: 'An 11-day offer period can bring interested buyers into the same decision window instead of letting the listing drift.',
      },
      {
        title: 'A low starting point can invite interest',
        copy: 'The pricing strategy is designed to encourage discovery and participation while the seller retains the rights stated in the listing agreement.',
      },
      {
        title: 'A fairer no-sale choice',
        copy: 'If the campaign does not produce a sale, the seller selects the agreed $1,000 campaign-end option or $2,000 close-of-escrow option—not a later 0.5% platform fee on an off-platform sale.',
      },
    ],
  },
  {
    number: '03',
    name: 'For listing agents',
    headline: 'Run a more organized listing campaign.',
    intro:
      'The listing, timeline and buyer activity are presented through one repeatable process.',
    benefits: [
      {
        title: 'One clear campaign hub',
        copy: 'Photos, property facts, open houses, pricing and contact details can be presented together instead of across disconnected messages.',
      },
      {
        title: 'Clear expectations for buyers',
        copy: 'The offer window and $500 increments make the next action easier to explain to every interested party.',
      },
      {
        title: 'More useful conversations',
        copy: 'When buyers can review the basics first, agents can spend more time on property-specific questions, qualification and representation.',
      },
    ],
  },
  {
    number: '04',
    name: 'For buyer agents',
    headline: 'Stay central to the buyer’s decision.',
    intro:
      'HomeOffer.pro is built to support representation—not route buyers around their agent.',
    benefits: [
      {
        title: 'Representation stays visible',
        copy: 'The buyer-agent role is addressed in the offer process so buyers know when and how their agent participates.',
      },
      {
        title: 'Compensation is explained',
        copy: 'The pricing breakdown shows that the buyer’s premium includes the platform fee and buyer-agent compensation, subject to the parties’ written agreements.',
      },
      {
        title: 'A shared source of information',
        copy: 'The buyer and agent can review the same listing details, offer status, deadlines and open-house schedule before deciding what to do next.',
      },
    ],
  },
  {
    number: '05',
    name: 'For brokers',
    headline: 'Bring consistency to a process that is usually fragmented.',
    intro:
      'A structured marketplace can help a brokerage oversee how participating agents present and manage campaigns.',
    benefits: [
      {
        title: 'A repeatable workflow',
        copy: 'Standard steps for listings, open houses, pricing and offers make the process easier to train, review and improve.',
      },
      {
        title: 'Broker oversight remains essential',
        copy: 'Agent participation, compensation and marketing remain subject to licensing rules, brokerage approval and the transaction documents.',
      },
      {
        title: 'Growth with accountability',
        copy: 'Agent-network rewards are tied to eligible closed transactions—not recruiting alone—and remain subject to final broker-approved program terms.',
      },
    ],
  },
]

const comparisonRows = [
  ['Finding homes', 'Buyers may start with a search form or scattered links.', 'Live opportunities are placed front and center for easy browsing.'],
  ['Offer timing', 'Deadlines and next steps can vary from listing to listing.', 'A defined 11-day window and clear $500 increments create a shared timeline.'],
  ['Price context', 'The list price may not show the buyer’s full expected price.', 'Leading offer, buyer’s premium and estimated total are separated.'],
  ['Open houses', 'Dates may be buried in remarks, posts or messages.', 'Dates and times are displayed in simple cards with calendar access.'],
  ['Buyer representation', 'The buyer-agent role can feel disconnected from the website.', 'Buyer-agent participation and compensation are explained in the process.'],
  ['Listing communication', 'Photos, questions, updates and offers may live in different places.', 'The property page acts as a central source for the campaign.'],
  ['Seller momentum', 'A listing can remain active without a clear decision point.', 'A focused campaign gives interested buyers a reason to act within a defined period.'],
  ['Broker consistency', 'Each agent may run a different process using different tools.', 'A repeatable workflow makes expectations easier to supervise and document.'],
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
      'No. Unless the signed documents specifically provide otherwise, the seller retains the right to accept, reject or counter an offer and may consider terms other than price.',
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
              A clearer, more focused way to buy and sell a home.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              Traditional home sales can scatter listings, deadlines, pricing and communication
              across multiple places. HomeOffer.pro brings the campaign into one easy-to-follow
              experience for buyers, sellers and the professionals representing them.
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
                ['11 days', 'A focused offer period'],
                ['$500', 'Clear offer increments'],
                ['3 parts', 'Offer, premium and total shown'],
                ['5 audiences', 'Buyer, seller, listing agent, buyer agent and broker'],
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
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Built around the whole transaction
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Better information benefits everyone at the table.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            These are the practical reasons each person can benefit from a more visible,
            structured offer process.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {audiences.map((audience) => {
            const id = audience.name.toLowerCase().replaceAll(' ', '-').replace('for-', '')

            return (
              <article
                id={id}
                key={audience.name}
                className="scroll-mt-44 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                  <div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                      {audience.number}
                    </span>
                    <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-blue-700">
                      {audience.name}
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                      {audience.headline}
                    </h3>
                    <p className="mt-4 leading-7 text-slate-600">{audience.intro}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {audience.benefits.map((benefit) => (
                      <div
                        key={benefit.title}
                        className="rounded-2xl border border-slate-200 bg-[#f6f8fb] p-5"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700"
                        >
                          ✓
                        </span>
                        <h4 className="mt-4 text-lg font-black text-slate-950">{benefit.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f6f8fb] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Side-by-side
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              What the experience is designed to improve
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              HomeOffer.pro does not replace the professionals or contracts in a real estate
              transaction. It gives them a clearer place to organize the customer experience.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <caption className="sr-only">
                  Comparison of a traditional selling process with the HomeOffer.pro experience
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-950 text-white">
                    <th scope="col" className="w-[20%] px-6 py-5 text-sm font-black">Area</th>
                    <th scope="col" className="w-[40%] px-6 py-5 text-sm font-black">Traditional process</th>
                    <th scope="col" className="w-[40%] px-6 py-5 text-sm font-black text-blue-300">HomeOffer.pro approach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {comparisonRows.map(([area, traditional, homeOffer]) => (
                    <tr key={area} className="align-top">
                      <th scope="row" className="px-6 py-5 text-sm font-black text-slate-950">{area}</th>
                      <td className="px-6 py-5 text-sm leading-6 text-slate-600">{traditional}</td>
                      <td className="border-l border-blue-100 bg-blue-50/60 px-6 py-5 text-sm font-semibold leading-6 text-slate-800">{homeOffer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

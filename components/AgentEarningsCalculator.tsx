'use client'

import { useState } from 'react'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function AgentEarningsCalculator() {
  const [directAgents, setDirectAgents] = useState(5)
  const [extendedAgents, setExtendedAgents] = useState(15)
  const [closingsPerAgent, setClosingsPerAgent] = useState(3)

  const directEarnings = directAgents * closingsPerAgent * 250
  const extendedEarnings = extendedAgents * closingsPerAgent * 75
  const annualEarnings = directEarnings + extendedEarnings

  return (
    <section
      id="agent-earnings-calculator"
      aria-labelledby="agent-earnings-title"
      className="mt-10 scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5"
    >
      <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Interactive estimate</p>
        <h3 id="agent-earnings-title" className="mt-1 text-3xl font-black tracking-[-0.03em] text-slate-950">
          Calculate your potential yearly earnings
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Move the sliders to see how Tier 1 and Tier 2 agent closings could add up over one year.
        </p>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-7">
          <label className="block">
            <span className="flex items-center justify-between gap-4">
              <span className="font-black text-slate-900">Tier 1 agents</span>
              <output className="min-w-16 rounded-lg bg-blue-600 px-3 py-1.5 text-center font-black text-white shadow-md shadow-blue-600/25">{directAgents}</output>
            </span>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={directAgents}
              onChange={(event) => setDirectAgents(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer accent-blue-600"
              aria-label="Number of Tier 1 agents"
            />
            <span className="mt-2 block text-right text-xs font-bold text-blue-700">50 agents</span>
          </label>

          <label className="block">
            <span className="flex items-center justify-between gap-4">
              <span className="font-black text-slate-900">Tier 2 agents</span>
              <output className="min-w-16 rounded-lg bg-blue-600 px-3 py-1.5 text-center font-black text-white shadow-md shadow-blue-600/25">{extendedAgents}</output>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={extendedAgents}
              onChange={(event) => setExtendedAgents(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer accent-blue-600"
              aria-label="Number of Tier 2 agents"
            />
            <span className="mt-2 block text-right text-xs font-bold text-blue-700">100 agents</span>
          </label>

          <label className="block">
            <span className="flex items-center justify-between gap-4">
              <span className="font-black text-slate-900">Average closings per agent each year</span>
              <output className="min-w-16 rounded-lg bg-blue-600 px-3 py-1.5 text-center font-black text-white shadow-md shadow-blue-600/25">{closingsPerAgent}</output>
            </span>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={closingsPerAgent}
              onChange={(event) => setClosingsPerAgent(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer accent-blue-600"
              aria-label="Average closings per agent each year"
            />
            <span className="mt-2 block text-right text-xs font-bold text-blue-700">25 closings</span>
          </label>
        </div>

        <div aria-live="polite" className="rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-slate-400">Potential yearly earnings</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">{currency.format(annualEarnings)}</p>

          <dl className="mt-7 space-y-3 border-t border-slate-700 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-300">Tier 1 rewards</dt>
              <dd className="font-black">{currency.format(directEarnings)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-300">Tier 2 rewards</dt>
              <dd className="font-black">{currency.format(extendedEarnings)}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs leading-5 text-slate-400">
            Illustrative estimate only. Rewards require eligible closed transactions and remain subject to licensing, brokerage approval and final program terms.
          </p>
        </div>
      </div>
    </section>
  )
}

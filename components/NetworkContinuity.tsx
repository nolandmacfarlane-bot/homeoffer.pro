export default function NetworkContinuity() {
  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5">
      <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Network continuity</p>
          <h3 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Your network stays connected.
          </h3>
          <p className="mt-4 text-base leading-7 text-slate-600">
            If an agent stops practicing or becomes ineligible, the organization beneath them is not lost. After the applicable grace period, their agents move to the nearest eligible sponsor above them.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-bold text-slate-400">Simple example</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black">
              <span className="rounded-lg bg-blue-600 px-3 py-2">You</span>
              <span aria-hidden="true" className="text-blue-300">→</span>
              <span className="rounded-lg border border-slate-600 px-3 py-2">Inactive agent</span>
              <span aria-hidden="true" className="text-blue-300">→</span>
              <span className="rounded-lg border border-slate-600 px-3 py-2">Their network</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The inactive position is removed from future reward placement, and the connected network rolls up to you.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            ['01', 'Grace period first', 'The agent receives time to renew their license, membership or brokerage eligibility before any permanent move.'],
            ['02', 'Automatic roll-up', 'If eligibility is not restored, the network moves to the nearest active and eligible sponsor above them.'],
            ['03', 'History is preserved', 'Original sponsorship, completed transactions and prior rewards remain recorded in the audit history.'],
          ].map(([number, title, copy]) => (
            <article key={number} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">{number}</span>
              <div>
                <h4 className="font-black text-slate-950">{title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="border-t border-slate-200 bg-blue-50 px-7 py-4 text-xs leading-5 text-slate-600 sm:px-9">
        Network placement affects future eligible rewards only. Final timing, eligibility and reassignment rules remain subject to licensing, responsible-broker approval and the Agent Partner Program terms.
      </p>
    </section>
  )
}

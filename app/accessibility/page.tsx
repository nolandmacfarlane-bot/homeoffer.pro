import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function AccessibilityStatementPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-5 py-14 text-slate-900 sm:px-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">HomeOffer.pro</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Accessibility statement</h1>
        <p className="mt-6 text-lg leading-8 text-slate-700">
          HomeOffer.pro is committed to providing a website that is usable by people of all abilities. We are working toward conformance with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
        </p>

        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-black">Accessibility features</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-700">
            <li>Keyboard-accessible navigation and controls</li>
            <li>Visible keyboard focus indicators and a skip-to-content link</li>
            <li>Text alternatives for meaningful images</li>
            <li>Support for text resizing, high contrast, reduced motion and underlined links</li>
            <li>Semantic headings, labels and status information for assistive technology</li>
          </ul>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-black">Need assistance?</h2>
          <p className="mt-4 leading-7 text-slate-700">
            If you have difficulty using HomeOffer.pro or need property information in another format, email{' '}
            <a className="font-bold text-blue-700 underline" href="mailto:support@cpt.law">support@cpt.law</a> or call{' '}
            <a className="font-bold text-blue-700 underline" href="tel:+19166049494">916-604-9494</a>. We welcome feedback and will make reasonable efforts to provide the information or service you need.
          </p>
        </section>

        <Link href="/" className="mt-10 inline-flex rounded-full bg-blue-700 px-5 py-3 font-black text-white hover:bg-blue-800">
          Return home
        </Link>
      </main>
    </>
  )
}

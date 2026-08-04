'use client'

import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <Link href="/" className="text-2xl sm:text-3xl font-bold text-white">
            Home Offer
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>Home Offer ("we," "us," "our," or "Company") operates the Home Offer platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, phone number, mailing address, and other information you voluntarily provide</li>
                <li><strong>Financial Information:</strong> Offer amounts, property details, and transaction history</li>
                <li><strong>Technical Data:</strong> IP address, browser type, pages visited, time and date stamps</li>
                <li><strong>OAuth Data:</strong> Information provided through Google or Meta authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitate property listings and offer submissions</li>
                <li>Process transactions and authenticate users</li>
                <li>Send marketing and promotional communications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Disclosure of Your Information</h2>
              <p>We may share information we have collected about you in certain situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To other users as necessary to facilitate property transactions</li>
                <li>To service providers who assist us in operating our website</li>
                <li>When required by law or to protect our legal rights</li>
                <li>To third parties with your consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Security of Your Information</h2>
              <p>We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is completely secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us at: support@homeoffer.pro</p>
            </section>

            <p className="text-sm text-gray-500 mt-8">Last updated: July 1, 2026</p>
          </div>

          <div className="mt-8 flex gap-4">
            <BackButton href="/">Back to Home</BackButton>
            <Link href="/terms" className="text-indigo-600 hover:underline">View Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

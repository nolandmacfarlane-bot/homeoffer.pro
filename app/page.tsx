'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Real Estate Offers Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Submit offers on homes. List properties. Manage negotiations. All in one transparent marketplace. No hidden offers. No surprises.
              </p>

              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition transform hover:scale-105"
              >
                Create a Free Account →
              </Link>

              <p className="text-sm text-gray-500 mt-6">
                ✓ Buy properties with confidence<br/>
                ✓ Sell listings to serious buyers<br/>
                ✓ Connect with verified agents
              </p>
            </div>

            {/* Right side visual */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🏠</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">For Buyers</h3>
                      <p className="text-indigo-100 text-sm">Find homes. Submit competitive offers. Track every step. Get notified instantly when offers change.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📋</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">For Sellers</h3>
                      <p className="text-indigo-100 text-sm">List properties. See all offers transparently. Send counter-offers. Negotiate directly with buyers.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🤝</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">For Agents</h3>
                      <p className="text-indigo-100 text-sm">Represent buyers & sellers. Close deals faster. Manage everything from one dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
              Here's How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Buyer Flow */}
              <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">🏠 If You're Buying</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-blue-900">1. Create Your Account</p>
                    <p className="text-sm text-blue-800">Sign up in seconds. Link a buyer's agent (optional).</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">2. Browse Properties</p>
                    <p className="text-sm text-blue-800">See active listings with countdown timers.</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">3. Make an Offer</p>
                    <p className="text-sm text-blue-800">Submit your offer in $500 increments.</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">4. Track Activity</p>
                    <p className="text-sm text-blue-800">See the highest offer. Get SMS/email updates.</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">5. Negotiate</p>
                    <p className="text-sm text-blue-800">Receive counter-offers. Make final decision.</p>
                  </div>
                </div>
              </div>

              {/* Seller Flow */}
              <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-green-900 mb-6">📋 If You're Selling</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-green-900">1. Create Your Account</p>
                    <p className="text-sm text-green-800">Sign up in seconds.</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">2. List Your Property</p>
                    <p className="text-sm text-green-800">Add address, photos, details. Set a 13-day offering period.</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">3. Receive Offers</p>
                    <p className="text-sm text-green-800">See all offers transparently in real-time.</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">4. Send Counters</p>
                    <p className="text-sm text-green-800">Counter-offer to negotiate with buyers.</p>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">5. Accept & Close</p>
                    <p className="text-sm text-green-800">Accept the best offer and proceed.</p>
                  </div>
                </div>
              </div>

              {/* Agent Flow */}
              <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-200">
                <h3 className="text-2xl font-bold text-purple-900 mb-6">🤝 If You're an Agent</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-purple-900">1. Create Your Account</p>
                    <p className="text-sm text-purple-800">Sign up and verify your California DRE license.</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">2. Represent Buyers</p>
                    <p className="text-sm text-purple-800">Buyers link you in their profile.</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">3. Manage Clients</p>
                    <p className="text-sm text-purple-800">See all offers from your buyer clients in one place.</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">4. Detect Conflicts</p>
                    <p className="text-sm text-purple-800">Know if clients are bidding on same property.</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-900">5. Close Faster</p>
                    <p className="text-sm text-purple-800">Coordinate negotiations and close deals.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Home Offer */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
              Why Home Offer?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Transparent Offers',
                  desc: 'See the highest offer amount. No hidden offers. Fair competition.',
                },
                {
                  icon: '⚡',
                  title: 'Fast & Easy',
                  desc: 'Submit offers in minutes. Negotiations in real-time. Close faster.',
                },
                {
                  icon: '🔒',
                  title: 'Secure & Legal',
                  desc: 'California DRE compliant. Verified agents only. All transactions protected.',
                },
                {
                  icon: '📱',
                  title: 'Mobile First',
                  desc: 'Browse, offer, and negotiate from your phone.',
                },
                {
                  icon: '🤝',
                  title: 'Verified Agents',
                  desc: 'Find agents by California DRE license. Know who you are working with.',
                },
                {
                  icon: '💰',
                  title: 'No Hidden Fees',
                  desc: 'Transparent pricing. See costs upfront.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 hover:shadow-lg transition">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Make Your Move?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join buyers, sellers, and agents on California's most transparent real estate marketplace.
            </p>

            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Create a Free Account
            </Link>

            <p className="text-indigo-200 text-sm mt-6">
              Already have an account? <Link href="/login" className="underline hover:text-white">Sign in</Link>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-white mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
                  <li><Link href="/signup" className="hover:text-white transition">Create Account</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Information</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/sms-policy" className="hover:text-white transition">SMS Policy</Link></li>
                  <li><Link href="/data-deletion" className="hover:text-white transition">Delete My Data</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">About</h3>
                <p className="text-sm">
                  Transparent real estate marketplace. California DRE compliant. Supporting buyers, sellers, and agents.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>© 2026 Home Offer Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

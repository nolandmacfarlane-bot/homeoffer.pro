'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (user) {
    // Redirect to dashboard based on user type
    if (user.user_type === 'seller' || user.user_type === 'agent') {
      router.push('/seller')
    } else {
      router.push('/buyer')
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">🏠 Home Offer</div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-semibold">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          The Transparent Real Estate Offer Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Submit offers with confidence. Watch the bidding in real-time. Close the deal with clarity.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
          >
            Start Bidding
          </Link>
          <Link
            href="/properties"
            className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-bold text-lg"
          >
            Browse Properties
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse</h3>
              <p className="text-gray-600">
                Explore properties in our marketplace. See details, photos, and starting prices.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Request Access</h3>
              <p className="text-gray-600">
                Find a property you love. Request approval from the listing agent to bid.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Offers</h3>
              <p className="text-gray-600">
                Once approved, submit your offer in $1,000 increments. Compete transparently.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Win</h3>
              <p className="text-gray-600">
                12-day bidding period. Highest offer wins. Close with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Why Home Offer?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Bidding</h3>
              <p className="text-gray-600">
                See real-time highest offers. No hidden bids. Fair competition for everyone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Timed Auctions</h3>
              <p className="text-gray-600">
                12-day bidding period with real-time countdowns. Auto-extends in final 15 minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">SMS Notifications</h3>
              <p className="text-gray-600">
                Get instant alerts when outbid. Never miss an opportunity to place a counter-offer.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600">
                Other bidders' identities remain private. You only see the current highest offer.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Legal Compliance</h3>
              <p className="text-gray-600">
                TCPA, GDPR, CCPA compliant. Your privacy and data are protected by law.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast & Easy</h3>
              <p className="text-gray-600">
                Sign up in seconds. Verify with Google or Meta. Start bidding immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join the marketplace. Find your next property. Bid with confidence.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-bold text-lg"
            >
              Create Account
            </Link>
            <Link
              href="/terms"
              className="bg-indigo-500 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
            >
              View Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center flex-wrap gap-6">
          <p className="text-sm">© 2026 California Probate & Trust. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/sms-policy" className="hover:text-white">
              SMS
            </Link>
            <Link href="/data-deletion" className="hover:text-white">
              Delete Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

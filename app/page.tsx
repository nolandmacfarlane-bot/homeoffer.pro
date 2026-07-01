import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Home Offer</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-white hover:text-gray-200 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-4">
          The New Way to Buy & Sell Homes
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Simple. Transparent. Real Estate. Submit offers, track competition,
          and close deals with complete visibility.
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/properties"
            className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition text-lg"
          >
            Browse Properties
          </Link>
          <Link
            href="/signup"
            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition text-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">For Sellers</h3>
            <p className="text-blue-100">
              Post your property, set your starting offer, and watch offers
              come in in real-time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">For Buyers</h3>
            <p className="text-blue-100">
              Make competitive offers, see the highest bid, and know exactly
              where you stand.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">For Agents</h3>
            <p className="text-blue-100">
              Manage listings and guide clients through a transparent,
              competitive process.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white/5 backdrop-blur-md py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-white mb-12 text-center">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="text-white font-bold mb-2">Post Property</h4>
              <p className="text-blue-100 text-sm">
                List your home with photos and starting offer price
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="text-white font-bold mb-2">Buyers Offer</h4>
              <p className="text-blue-100 text-sm">
                Approved buyers submit offers in $1,000 increments
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="text-white font-bold mb-2">Compete</h4>
              <p className="text-blue-100 text-sm">
                12-day period with automatic extensions for late offers
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h4 className="text-white font-bold mb-2">Close Deal</h4>
              <p className="text-blue-100 text-sm">
                Highest offer wins. Banks handle the rest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">
          Ready to get started?
        </h3>
        <Link
          href="/signup"
          className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition text-lg inline-block"
        >
          Create an Account
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-blue-100">
          <p>&copy; 2026 Home Offer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

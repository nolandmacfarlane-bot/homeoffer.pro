'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BuyerDashboard() {
  const router = useRouter()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      const { data: userOffers, error } = await supabase
        .from('offers')
        .select(`
          *,
          properties:property_id (address, city, state, zip, bedrooms, bathrooms, current_offer)
        `)
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOffers(userOffers || [])
    } catch (err) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
              <p className="text-gray-600 mt-1">Track your submitted offers</p>
            </div>
            <div className="space-x-4">
              <Link
                href="/properties"
                className="text-gray-600 hover:text-gray-900"
              >
                Browse Properties
              </Link>
              <button
                onClick={() => router.push('/login')}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't submitted any offers yet</p>
            <Link
              href="/properties"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-block"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {offer.properties?.address}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {offer.properties?.city}, {offer.properties?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Your Offer
                      </p>
                      <p className="text-3xl font-bold text-indigo-600">
                        ${offer.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          offer.is_highest
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {offer.is_highest ? '🏆 Highest Offer' : 'Submitted'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(offer.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    href={`/properties/${offer.property_id}`}
                    className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    View Property ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

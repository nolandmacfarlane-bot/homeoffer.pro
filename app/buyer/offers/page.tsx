'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BuyerOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'won' | 'lost'>('all')

  useEffect(() => {
    loadOffers()
  }, [])

  async function loadOffers() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get all offers by this buyer
      const { data: buyerOffers, error } = await supabase
        .from('offers')
        .select(`
          *,
          properties:property_id (
            id,
            address,
            city,
            state,
            starting_offer,
            offer_end_date,
            status
          ),
          agent_approvals:agent_approvals(id, approved)
        `)
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading offers:', error)
        return
      }

      // Enrich offers with status
      const enrichedOffers = (buyerOffers || []).map((offer: any) => {
        const endDate = new Date(offer.properties?.offer_end_date)
        const now = new Date()
        const isActive = endDate > now && offer.properties?.status === 'active'
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ...offer,
          isActive,
          daysLeft: isActive ? daysLeft : 0,
        }
      })

      setOffers(enrichedOffers)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    if (filter === 'pending') return !offer.isActive && offer.daysLeft > 0
    if (filter === 'approved') return offer.isActive
    if (filter === 'won') return offer.isActive && offer.daysLeft === 0
    if (filter === 'lost') return !offer.isActive && offer.daysLeft <= 0
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading offers...</p>
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
              <p className="text-gray-600 mt-1">Track all your submitted offers</p>
            </div>
            <Link
              href="/properties"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'won', 'lost'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({filteredOffers.length})
            </button>
          ))}
        </div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {filter === 'all'
                ? "You haven't submitted any offers yet"
                : `No ${filter} offers`}
            </p>
            <Link
              href="/properties"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOffers.map((offer) => {
              const property = offer.properties
              const statusColor = offer.isActive
                ? 'bg-green-50 border-green-200'
                : offer.daysLeft > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50'

              const statusText = offer.isActive
                ? `🟢 Active (${offer.daysLeft} days left)`
                : offer.daysLeft > 0
                  ? `⏳ Pending`
                  : `⚫ Closed`

              return (
                <div
                  key={offer.id}
                  className={`border-2 rounded-lg p-6 ${statusColor}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {property?.address}
                      </h3>
                      <p className="text-gray-600">
                        {property?.city}, {property?.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-600">
                        ${offer.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">{statusText}</p>
                    </div>
                  </div>

                  {/* Offer Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Submitted
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Starting Offer
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${property?.starting_offer.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Your Rank
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        #{filteredOffers.indexOf(offer) + 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Status
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {offer.isActive ? 'Bidding' : 'Closed'}
                      </p>
                    </div>
                  </div>

                  {/* SMS Placeholder */}
                  {offer.isActive && (
                    <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-4 text-sm text-blue-800">
                      📱 <strong>SMS:</strong> You'll receive notifications when your offer is approved or outbid
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href={`/properties/${property?.id}`}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition"
                    >
                      View Property
                    </Link>
                    {offer.isActive && (
                      <button
                        onClick={() => {
                          // TODO: Implement counter-offer
                          alert('Counter-offer feature coming soon')
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Counter Offer
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

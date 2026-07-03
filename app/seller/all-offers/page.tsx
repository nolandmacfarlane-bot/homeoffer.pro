'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AllOffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'amount' | 'time' | 'property'>('amount')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('active')

  useEffect(() => {
    loadOffers()
  }, [sortBy, filterStatus])

  async function loadOffers() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get all properties for this agent
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('listing_agent_id', currentUser.id)

      if (!properties) {
        setLoading(false)
        return
      }

      const propertyIds = properties.map((p) => p.id)

      if (propertyIds.length === 0) {
        setLoading(false)
        return
      }

      // Get all offers for these properties
      const { data: allOffers } = await supabase
        .from('offers')
        .select(`
          *,
          users:buyer_id (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          properties:property_id (
            id,
            address,
            city,
            state,
            offer_end_date,
            status
          )
        `)
        .in('property_id', propertyIds)

      if (!allOffers) {
        setLoading(false)
        return
      }

      // Filter by status
      let filtered: any[] = allOffers || []
      if (filterStatus === 'active') {
        const now = new Date()
        filtered = filtered.filter((o: any) => {
          const endDate = new Date(o.properties.offer_end_date)
          return endDate > now && o.properties.status === 'active'
        })
      } else if (filterStatus === 'closed') {
        const now = new Date()
        filtered = filtered.filter((o) => {
          const endDate = new Date(o.properties.offer_end_date)
          return endDate <= now || o.properties.status !== 'active'
        })
      }

      // Sort
      const sorted = filtered.sort((a: any, b: any) => {
        if (sortBy === 'amount') return b.amount - a.amount
        if (sortBy === 'time') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sortBy === 'property') return a.properties.address.localeCompare(b.properties.address)
        return 0
      })

      setOffers(sorted)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Offers</h1>
              <p className="text-gray-600 mt-1">View offers across all your properties</p>
            </div>
            <Link
              href="/seller"
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back
            </Link>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="amount">Highest Offer</option>
                <option value="time">Most Recent</option>
                <option value="property">Property</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Offers</option>
                <option value="active">Active Only</option>
                <option value="closed">Closed Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-gray-600 mb-6">
          Showing <strong>{offers.length}</strong> offers
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No offers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const endDate = new Date(offer.properties.offer_end_date)
              const now = new Date()
              const isActive = endDate > now && offer.properties.status === 'active'

              return (
                <div
                  key={offer.id}
                  className={`p-6 rounded-lg border-l-4 ${
                    isActive
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    {/* Property */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                        Property
                      </p>
                      <Link
                        href={`/properties/${offer.properties.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-indigo-600 block"
                      >
                        {offer.properties.address}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {offer.properties.city}, {offer.properties.state}
                      </p>
                    </div>

                    {/* Buyer */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                        Buyer
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {offer.users.first_name} {offer.users.last_name}
                      </p>
                      <a
                        href={`mailto:${offer.users.email}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {offer.users.email}
                      </a>
                    </div>

                    {/* Offer Amount */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                        Offer
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ${offer.amount.toLocaleString()}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                        Status
                      </p>
                      <p className="text-sm font-semibold">
                        {isActive ? (
                          <span className="text-green-600">🟢 Active</span>
                        ) : (
                          <span className="text-gray-600">⚫ Closed</span>
                        )}
                      </p>
                      {isActive && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.ceil(
                            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                          )}d left
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/agent/property/${offer.properties.id}/counter-offer`}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center text-sm transition"
                      >
                        Counter
                      </Link>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition">
                        Contact
                      </button>
                    </div>
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

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPropertyWithOffers } from '@/lib/properties'
import { submitOffer } from '@/lib/offers'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import CountdownTimer from '@/components/CountdownTimer'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [offerAmount, setOfferAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPropertyData()
  }, [propertyId])

  async function loadPropertyData() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      const { property, offers } = await getPropertyWithOffers(propertyId)
      setProperty(property)
      
      // PRIVACY FIX: Only show current highest offer, don't expose other bidders
      // Also don't show user details of other bidders
      if (offers && offers.length > 0) {
        // Only include the highest offer in the list shown to users
        // Other offers are hidden from view
        setOffers([offers[0]]) // Only highest
      } else {
        setOffers([])
      }
    } catch (err) {
      console.error('Error loading property:', err)
    } finally {
      setLoading(false)
    }
  }

  const highestOffer = offers?.[0]
  const userOffer = offers?.find((o: any) => o.buyer_id === user?.id)

  async function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!user) {
        throw new Error('You must be logged in to submit an offer')
      }

      if (!offerAmount) {
        throw new Error('Please enter an offer amount')
      }

      const amount = parseInt(offerAmount)

      await submitOffer(propertyId, user.id, amount)

      // Reload property data
      await loadPropertyData()
      setOfferAmount('')

      alert('✅ Offer submitted! You can view it in My Offers.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Property not found</p>
          <Link href="/properties" className="text-indigo-600 hover:underline">
            Back to properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/properties" className="text-indigo-600 hover:underline text-sm font-semibold mb-4 block">
            ← Back to Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {property.images?.[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.address}</h1>
              <p className="text-gray-600 text-lg mb-6">
                {property.city}, {property.state} {property.zip}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">BEDS</p>
                  <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">BATHS</p>
                  <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {(property.sqft / 1000).toFixed(1)}K
                  </p>
                  <p className="text-gray-600">Sq Ft</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-gray-600">
                  <strong>Starting Offer:</strong>{' '}
                  <span className="text-lg text-indigo-600 font-bold">
                    ${property.starting_offer.toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span className="text-lg font-semibold">
                    {property.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                  </span>
                </p>
              </div>

              {/* Offer Details Section */}
              {property.status === 'active' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Current offering</h3>
                  <p className="text-gray-600 mb-2">
                    <strong>Current Highest Offer:</strong>
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 mb-4">
                    ${highestOffer?.amount.toLocaleString() || property.starting_offer.toLocaleString()}
                  </p>

                  {userOffer && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                      <p className="text-green-800 font-semibold">✓ Your Current Offer</p>
                      <p className="text-lg font-bold text-green-600">
                        ${userOffer.amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center mb-2">
                    ℹ️ Other bidders' names are kept private. You see only the highest offer.
                  </p>
                </div>
              )}

              {/* Property Description */}
              {property.description && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About this Property</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Offer Submission & Countdown */}
          <div className="lg:col-span-1">
            {/* Countdown Timer */}
            {property.status === 'active' && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <CountdownTimer endDate={property.offer_end_date} size="large" />
              </div>
            )}

            {/* Approval Message or Offer Form */}
            {property.status === 'active' && (
              <>
                {!user?.approved ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-semibold mb-2">⏳ Awaiting Approval</p>
                    <p className="text-yellow-700 text-sm mb-4">
                      Your access to submit offers is pending approval from the listing agent.
                    </p>
                    <button
                      onClick={async () => {
                        if (!user?.id) return
                        try {
                          await supabase.from('agent_approvals').insert({
                            property_id: propertyId,
                            buyer_id: user.id,
                            listing_agent_id: property.listing_agent_id,
                          })
                          alert('Approval request sent! The listing agent will review shortly.')
                          await loadPropertyData()
                        } catch (err: any) {
                          alert('Error: ' + err.message)
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm w-full"
                    >
                      Request Approval
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-4 bg-white rounded-lg shadow p-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Offer ($500 increments)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-600">$</span>
                        <input
                          type="number"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          step="500"
                          min={Math.max(500, (highestOffer?.amount || property.starting_offer) + 500)}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                          placeholder="0"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Min: $
                        {Math.max(500, (highestOffer?.amount || property.starting_offer) + 500).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Offer'}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      📱 You'll be notified when someone offers more
                    </p>
                  </form>
                )}
              </>
            )}

            {property.status !== 'active' && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 font-semibold">⚫ offering Closed</p>
                <p className="text-sm text-gray-500 mt-2">Check your offers in My Offers</p>
                <Link
                  href="/buyer/offers"
                  className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  View My Offers
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

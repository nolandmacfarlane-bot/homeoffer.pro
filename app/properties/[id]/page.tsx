'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPropertyWithOffers } from '@/lib/properties'
import { submitOffer } from '@/lib/offers'
import { getCurrentUser } from '@/lib/auth'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    loadPropertyData()
    loadCurrentUser()
  }, [propertyId])

  useEffect(() => {
    if (!property) return

    const interval = setInterval(() => {
      const now = new Date()
      const endDate = new Date(property.offer_end_date)
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Offer period closed')
        clearInterval(interval)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${mins}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [property])

  async function loadPropertyData() {
    try {
      const data = await getPropertyWithOffers(propertyId)
      setProperty(data.property)
      setOffers(data.offers || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentUser() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      router.push('/login')
    }
  }

  async function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const amount = parseInt(offerAmount)

      if (!amount || amount < 1000) {
        throw new Error('Offer must be at least $1,000')
      }

      if (amount % 1000 !== 0) {
        throw new Error('Offers must be in $1,000 increments')
      }

      if (user?.id) {
        await submitOffer(propertyId, user.id, amount)
        setOfferAmount('')
        await loadPropertyData()
        alert('Offer submitted successfully!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Property not found</p>
        </div>
      </div>
    )
  }

  const highestOffer = offers?.[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Home Offer</h1>
          <div></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-gray-200 h-96 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
              {property.images?.[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>

            {/* Address & Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {property.address}
              </h2>
              <p className="text-gray-600 mb-6">
                {property.city}, {property.state} {property.zip}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {property.bedrooms}
                  </p>
                  <p className="text-gray-600">Bedrooms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {property.bathrooms}
                  </p>
                  <p className="text-gray-600">Bathrooms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {(property.sqft / 1000).toFixed(1)}K
                  </p>
                  <p className="text-gray-600">Sq Ft</p>
                </div>
              </div>

              <div className="space-y-2">
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
            </div>

            {/* Offers List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Offers ({offers.length})
              </h3>

              {offers.length === 0 ? (
                <p className="text-gray-500">No offers yet.</p>
              ) : (
                <div className="space-y-2">
                  {offers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg ${
                        idx === 0 ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {idx === 0 && '🏆 '}
                            ${offer.amount.toLocaleString()}
                          </p>
                          {offer.users && (
                            <p className="text-sm text-gray-600">
                              {offer.users.first_name} {offer.users.last_name}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(offer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Offer Submission Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              {/* Countdown */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6 border border-indigo-100">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Time Left
                </p>
                <p className="text-2xl font-bold text-indigo-600">{timeLeft}</p>
              </div>

              {/* Current Highest */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                  Current Highest Offer
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ${(highestOffer?.amount || property.starting_offer).toLocaleString()}
                </p>
              </div>

              {/* Submit Offer */}
              {property.status === 'active' && (
                <form onSubmit={handleSubmitOffer} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Offer ($1,000 increments)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        step="1000"
                        min={Math.max(1000, (highestOffer?.amount || property.starting_offer) + 1000)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        placeholder="0"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Min: $
                      {Math.max(1000, (highestOffer?.amount || property.starting_offer) + 1000).toLocaleString()}
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
                    ✓ All offers must be approved by the listing agent first
                  </p>
                </form>
              )}

              {property.status !== 'active' && (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600 font-semibold">
                    This offer period has closed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

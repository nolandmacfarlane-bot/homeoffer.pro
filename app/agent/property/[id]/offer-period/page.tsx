'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function NegotiationsPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get property
      const { data: prop } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (!prop || prop.listing_agent_id !== currentUser.id) {
        router.push('/agent/dashboard')
        return
      }

      setProperty(prop)

      // Get all offers with buyer info (sorted by buyer then by time)
      const { data: allOffers } = await supabase
        .from('offers')
        .select(`
          *,
          users:buyer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('property_id', propertyId)
        .order('buyer_id', { ascending: true })
        .order('created_at', { ascending: true })

      setOffers(allOffers || [])

      // Set first buyer as selected
      if (allOffers && allOffers.length > 0) {
        setSelectedBuyer(allOffers[0].buyer_id)
      }
    } catch (err) {
      console.error('Error:', err)
      router.push('/agent/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Get unique buyers
  const buyers = Array.from(
    new Map(
      offers.map((o) => [
        o.buyer_id,
        { id: o.buyer_id, name: `${o.users.first_name} ${o.users.last_name}`, email: o.users.email },
      ])
    ).values()
  )

  // Get offers for selected buyer
  const buyerOffers = selectedBuyer
    ? offers.filter((o) => o.buyer_id === selectedBuyer)
    : []

  const highestOfferAmount = Math.max(
    ...offers.map((o) => o.amount),
    property?.starting_offer || 0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Property not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Negotiations Timeline</h1>
              <p className="text-gray-600 mt-1">{property.address}</p>
            </div>
            <BackButton href={`/agent/property/${propertyId}/offerors`}>Back to offerors</BackButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Buyer List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Buyers ({buyers.length})
            </h2>

            <div className="space-y-2">
              {buyers.map((buyer) => {
                const buyerOfferCount = offers.filter(
                  (o) => o.buyer_id === buyer.id
                ).length
                const buyerMaxOffer = Math.max(
                  ...offers
                    .filter((o) => o.buyer_id === buyer.id)
                    .map((o) => o.amount),
                  0
                )

                return (
                  <button
                    key={buyer.id}
                    onClick={() => setSelectedBuyer(buyer.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedBuyer === buyer.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{buyer.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{buyerOfferCount} offers</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      ${buyerMaxOffer.toLocaleString()}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="lg:col-span-3">
            {selectedBuyer ? (
              <>
                {/* Buyer Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  {(() => {
                    const buyer = buyers.find((b) => b.id === selectedBuyer)
                    const buyerOfferCount = buyerOffers.length
                    const buyerMaxOffer = Math.max(
                      ...buyerOffers.map((o) => o.amount),
                      0
                    )
                    const isCurrent = buyerMaxOffer === highestOfferAmount

                    return (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {buyer?.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{buyer?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-indigo-600">
                            ${buyerMaxOffer.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isCurrent && (
                              <span className="text-green-600 font-bold">
                                🏆 HIGHEST OFFER
                              </span>
                            )}
                            {!isCurrent && (
                              <span className="text-gray-600">
                                {buyerOfferCount} offer{buyerOfferCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Timeline */}
                <h3 className="text-lg font-bold text-gray-900 mb-4">Offer History</h3>

                <div className="space-y-4">
                  {buyerOffers.map((offer, idx) => {
                    const isHighest = offer.amount === highestOfferAmount

                    return (
                      <div
                        key={offer.id}
                        className={`p-6 rounded-lg border-l-4 ${
                          isHighest
                            ? 'bg-green-50 border-green-500'
                            : idx === buyerOffers.length - 1
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">
                              {new Date(offer.created_at).toLocaleDateString()}{' '}
                              {new Date(offer.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {isHighest && (
                              <span className="inline-block bg-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded mt-2">
                                CURRENT HIGHEST
                              </span>
                            )}
                          </div>
                          <p className="text-3xl font-bold text-indigo-600">
                            ${offer.amount.toLocaleString()}
                          </p>
                        </div>

                        {/* Increase from previous */}
                        {idx > 0 && (
                          <p className="text-sm text-gray-600">
                            📈 Increase: +${(
                              offer.amount - buyerOffers[idx - 1].amount
                            ).toLocaleString()}
                          </p>
                        )}

                        {/* Time since last offer */}
                        {idx > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            ⏱️{' '}
                            {(() => {
                              const prev = new Date(buyerOffers[idx - 1].created_at)
                              const curr = new Date(offer.created_at)
                              const diffMs = curr.getTime() - prev.getTime()
                              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                              const diffHours = Math.floor(
                                (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                              )
                              const diffMins = Math.floor(
                                (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                              )

                              if (diffDays > 0)
                                return `${diffDays}d ${diffHours}h since last offer`
                              if (diffHours > 0)
                                return `${diffHours}h ${diffMins}m since last offer`
                              return `${diffMins}m since last offer`
                            })()}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-3">
                  <Link
                    href={`/agent/property/${propertyId}/counter-offer`}
                    className="block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition"
                  >
                    Send Counter Offer
                  </Link>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                    📧 Contact Buyer
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No offers yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

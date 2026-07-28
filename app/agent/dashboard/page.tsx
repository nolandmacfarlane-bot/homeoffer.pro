'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'
import Navbar from '@/components/Navbar'

export default function AgentDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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

      if (currentUser.user_type !== 'agent' && currentUser.user_type !== 'seller') {
        router.push('/buyer')
        return
      }

      setUser(currentUser)

      // Get all properties listed by this agent
      const { data: agentProperties, error } = await supabase
        .from('properties')
        .select(`
          *,
          offers (
            id,
            amount,
            buyer_id,
            created_at,
            users:buyer_id (
              id,
              first_name,
              last_name,
              email,
              phone_number
            )
          )
        `)
        .eq('listing_agent_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enrich with stats
      const enrichedProps = (agentProperties || []).map((prop: any) => {
        const offers = prop.offers || []
        const sortedOffers = [...offers].sort((a, b) => b.amount - a.amount)

        const endDate = new Date(prop.offer_end_date)
        const now = new Date()
        const isActive = endDate > now && prop.status === 'active'

        return {
          ...prop,
          totalOffers: offers.length,
          highestOffer: sortedOffers[0]?.amount || prop.starting_offer,
          highestOfferor: sortedOffers[0]?.users,
          isActive,
          daysLeft: isActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          allOffers: sortedOffers,
        }
      })

      setProperties(enrichedProps)
    } catch (err) {
      // A listing/profile query failure is not an authentication failure.
      console.error('Error loading agent dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Agent workspace</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">My listings</h1>
            <p className="mt-2 text-base text-slate-600">Manage your properties, activity, and offers in one place.</p>
          </div>
          <Link
            href="/agent/listing-builder"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-black text-white transition hover:bg-blue-700"
          >
            Post a property
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Properties</p>
              <p className="text-3xl font-bold text-indigo-600">{properties.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-green-600">
                {properties.filter((p) => p.isActive).length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Offers</p>
              <p className="text-3xl font-bold text-blue-600">
                {properties.reduce((sum, p) => sum + p.totalOffers, 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Pending</p>
              <p className="text-3xl font-bold text-purple-600">
                {properties.reduce(
                  (sum, p) => sum + (p.allOffers?.filter((o: any) => !o.is_highest)?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Properties */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No properties listed yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Property Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{property.address}</h2>
                      <p className="text-indigo-100">
                        {property.city}, {property.state} {property.zip}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">${property.starting_offer.toLocaleString()}</p>
                      <p className="text-indigo-100 text-sm">Starting Offer</p>
                    </div>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Stats */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Countdown */}
                      {property.isActive && (
                        <CountdownTimer endDate={property.offer_end_date} size="small" />
                      )}

                      {/* Offer Stats */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 font-semibold mb-3">OFFER STATS</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Offers:</span>
                            <span className="font-bold text-gray-900">{property.totalOffers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Highest:</span>
                            <span className="font-bold text-indigo-600">
                              ${property.highestOffer.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-bold ${property.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                              {property.isActive ? '🟢 Active' : '⚫ Closed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Link
                          href={`/agent/property/${property.id}`}
                          className="w-full block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition"
                        >
                          Manage Property
                        </Link>
                        <Link
                          href={`/agent/property/${property.id}/offerors`}
                          className="w-full block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition"
                        >
                          View Offerors
                        </Link>
                      </div>
                    </div>

                    {/* Right: Top Offerors */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Top Offerors ({property.allOffers?.length || 0})
                      </h3>

                      {property.allOffers && property.allOffers.length > 0 ? (
                        <div className="space-y-3">
                          {property.allOffers.slice(0, 5).map((offer: any, idx: number) => (
                            <div
                              key={offer.id}
                              className={`p-4 rounded-lg border-l-4 ${
                                idx === 0
                                  ? 'bg-green-50 border-green-500'
                                  : idx === 1
                                    ? 'bg-yellow-50 border-yellow-500'
                                    : 'bg-gray-50 border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">
                                    #{idx + 1} -{' '}
                                    {offer.users?.first_name} {offer.users?.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600">{offer.users?.email}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(offer.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-indigo-600">
                                    ${offer.amount.toLocaleString()}
                                  </p>
                                  {idx === 0 && (
                                    <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded mt-1">
                                      HIGHEST
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button className="mt-2 text-sm text-indigo-600 hover:underline font-semibold">
                                Contact Offeror
                              </button>
                            </div>
                          ))}

                          {property.allOffers.length > 5 && (
                            <Link
                              href={`/agent/property/${property.id}/offerors`}
                              className="block text-center text-indigo-600 hover:underline font-semibold text-sm py-2"
                            >
                              View All {property.allOffers.length} Offerors →
                            </Link>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No offers yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

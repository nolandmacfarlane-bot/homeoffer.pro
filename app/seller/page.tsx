'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getPropertiesByAgent, getPropertyWithOffers } from '@/lib/properties'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SellerDashboard() {
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

      setUser(currentUser)

      const agentProps = await getPropertiesByAgent(currentUser.id)
      const propsWithOffers = await Promise.all(
        (agentProps || []).map(async (prop) => {
          const { offers } = await getPropertyWithOffers(prop.id)
          return {
            ...prop,
            offer_count: offers?.length || 0,
            highest_offer: offers?.[0]?.amount || prop.starting_offer,
          }
        })
      )

      setProperties(propsWithOffers)
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
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your property listings</p>
            </div>
            <div className="space-x-4">
              <Link
                href="/properties"
                className="text-gray-600 hover:text-gray-900"
              >
                Browse
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
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You have no active listings</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              Post a Property
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {properties.map((property) => {
              const daysLeft = Math.ceil(
                (new Date(property.offer_end_date).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div className="flex">
                    {/* Image */}
                    <div className="w-40 h-40 bg-gray-200 flex-shrink-0 flex items-center justify-center">
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

                    {/* Details */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {property.address}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {property.city}, {property.state} {property.zip}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Status
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {property.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Offers
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {property.offer_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Highest Offer
                          </p>
                          <p className="text-lg font-bold text-indigo-600">
                            ${property.highest_offer.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Time Left
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {daysLeft} days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-6 flex flex-col justify-between">
                      <Link
                        href={`/properties/${property.id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center font-semibold"
                      >
                        View Details
                      </Link>
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

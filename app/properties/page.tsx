'use client'

import { useEffect, useState } from 'react'
import { getActiveProperties, getPropertyWithOffers } from '@/lib/properties'
import Link from 'next/link'
import { Property } from '@/lib/supabase'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      const data = await getActiveProperties()
      const propertiesWithOffers = await Promise.all(
        (data || []).map(async (prop) => {
          const { highest_offer } = await getPropertyWithOffers(prop.id)
          return {
            ...prop,
            current_offer: highest_offer?.amount || prop.starting_offer,
          }
        })
      )
      setProperties(propertiesWithOffers)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Home Offer</h1>
          <div className="space-x-4">
            <Link href="/buyer" className="text-gray-600 hover:text-gray-900">
              My Offers
            </Link>
            <Link href="/seller" className="text-gray-600 hover:text-gray-900">
              My Properties
            </Link>
            <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Active Properties</h2>
          <p className="text-gray-600">
            {properties.length} properties available for offers
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No active properties at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const daysLeft = Math.ceil(
                (new Date(property.offer_end_date).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )

              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
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

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {property.address}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {property.city}, {property.state} {property.zip}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {property.bedrooms}
                        </p>
                        <p>Bed</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {property.bathrooms}
                        </p>
                        <p>Bath</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {property.sqft.toLocaleString()}
                        </p>
                        <p>Sq ft</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Current Offer:</span>
                        <span className="font-bold text-lg text-indigo-600">
                          ${property.current_offer.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Left:</span>
                        <span className="font-semibold text-orange-600">
                          {daysLeft} days
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

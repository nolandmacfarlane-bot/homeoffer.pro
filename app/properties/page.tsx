'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      const { data } = await supabase
        .from('properties')
        .select('*, offers(amount)')
        .eq('status', 'active')
        .order('offer_end_date', { ascending: true })

      setProperties(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5f7fb]">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-4xl font-black tracking-tight text-gray-950">Homes open for offers</h1>
            <p className="text-gray-600 mt-2">Ending soonest first. No account needed to browse.</p>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-gray-600 mb-6">
            Found <strong>{properties.length}</strong> active properties
          </p>

          {properties.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">No active properties at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const endDate = new Date(property.offer_end_date)
                const now = new Date()
                const isActive = endDate > now && property.status === 'active'
                const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                const currentOffer = Math.max(property.starting_offer, ...(property.offers || []).map((offer: any) => offer.amount))
                const platformFee = currentOffer * 0.005
                const buyerAgentCommission = currentOffer * 0.025

                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden group-hover:opacity-90 transition">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.address}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}

                      {isActive && <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/85 px-3 py-2 text-sm font-black text-white">{daysLeft}d left</div>}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {/* Address */}
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {property.address}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {property.city}, {property.state}
                      </p>

                      {/* Price */}
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current offer</p>
                      <p className="text-2xl font-black text-blue-700 mb-3">${currentOffer.toLocaleString()}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-gray-200 text-center">
                        <div>
                          <p className="text-xs text-gray-600">BEDS</p>
                          <p className="font-bold text-gray-900">{property.beds}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">BATHS</p>
                          <p className="font-bold text-gray-900">{property.baths}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">SQFT</p>
                          <p className="font-bold text-gray-900">
                            {(property.sqft / 1000).toFixed(1)}K
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 rounded-lg bg-blue-50 p-3 text-xs">
                        <div className="flex justify-between"><span className="text-slate-600">Platform fee (0.5%)</span><strong>${platformFee.toLocaleString()}</strong></div>
                        <div className="flex justify-between"><span className="text-slate-600">Buyer&apos;s agent commission (2.5%)</span><strong>${buyerAgentCommission.toLocaleString()}</strong></div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

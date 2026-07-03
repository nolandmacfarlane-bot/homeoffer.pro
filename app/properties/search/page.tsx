'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'

export default function PropertySearchPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    status: 'active',
  })

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')

      if (filters.minPrice) {
        query = query.gte('starting_offer', parseInt(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('starting_offer', parseInt(filters.maxPrice))
      }
      if (filters.beds) {
        query = query.eq('beds', parseInt(filters.beds))
      }
      if (filters.baths) {
        query = query.eq('baths', parseInt(filters.baths))
      }

      const { data: props, error } = await query.order('created_at', {
        ascending: false,
      })

      if (error) throw error

      // Filter by search query
      let filtered: any[] = props || []
      if (searchQuery) {
        filtered = filtered.filter(
          (p: any) =>
            p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.state.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setProperties(filtered)
    } catch (err: any) {
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading properties...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Home</h1>

          {/* Search & Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, city, or state..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="absolute right-3 top-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-1 rounded-lg font-semibold text-sm">
                🔍
              </button>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="beds"
                value={filters.beds}
                onChange={handleFilterChange}
                placeholder="Beds"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="baths"
                value={filters.baths}
                onChange={handleFilterChange}
                placeholder="Baths"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={loadProperties}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-6">
          Found <strong>{properties.length}</strong> properties
        </p>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No properties found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const endDate = new Date(property.offer_end_date)
              const now = new Date()
              const isActive = endDate > now && property.status === 'active'

              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition group"
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

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isActive ? (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                          🟢 Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          ⚫ Closed
                        </span>
                      )}
                    </div>
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
                    <p className="text-2xl font-bold text-indigo-600 mb-3">
                      ${property.starting_offer.toLocaleString()}
                    </p>

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

                    {/* Countdown or Closed */}
                    {isActive ? (
                      <div className="text-xs text-orange-600 font-semibold text-center">
                        ⏱️ {Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}d left
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center">Bidding closed</div>
                    )}
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

'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function BuyerClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOffers: 0,
    activeOffers: 0,
    totalValue: 0,
  })

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.user_type !== 'agent') {
        router.push('/buyer')
        return
      }

      setUser(currentUser)

      // Get all offers made by buyers this agent represents
      // For now, we'll get offers where buyer_agent_id matches current user
      const { data: allOffers, error } = await supabase
        .from('offers')
        .select(`
          *,
          users:buyer_id (
            id,
            first_name,
            last_name,
            email,
            phone_number,
            user_type
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
        .eq('buyer_agent_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group offers by buyer client
      const clientMap = new Map<string, any>()

      allOffers?.forEach((offer) => {
        const buyerId = offer.users.id
        if (!clientMap.has(buyerId)) {
          clientMap.set(buyerId, {
            id: buyerId,
            ...offer.users,
            offers: [],
            totalBid: 0,
            maxOffer: 0,
            propertiesCount: new Set(),
          })
        }

        const client = clientMap.get(buyerId)
        client.offers.push(offer)
        client.totalBid += offer.amount
        client.maxOffer = Math.max(client.maxOffer, offer.amount)
        client.propertiesCount.add(offer.properties.id)
      })

      // Convert to array
      const clientsArray = Array.from(clientMap.values()).map((client) => ({
        ...client,
        propertiesCount: client.propertiesCount.size,
      }))

      setClients(clientsArray)

      // Calculate stats
      const now = new Date()
      const activeOffers = allOffers?.filter((o) => {
        const endDate = new Date(o.properties.offer_end_date)
        return endDate > now && o.properties.status === 'active'
      }) || []

      setStats({
        totalClients: clientsArray.length,
        totalOffers: allOffers?.length || 0,
        activeOffers: activeOffers.length,
        totalValue: clientsArray.reduce((sum, c) => sum + c.totalBid, 0),
      })
    } catch (err) {
      console.error('Error:', err)
      router.push('/agent/dashboard')
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
              <h1 className="text-3xl font-bold text-gray-900">
                My Buyer Clients
              </h1>
              <p className="text-gray-600 mt-1">Manage all your buyer clients in one place</p>
            </div>
            <BackButton href="/agent/dashboard">Agent dashboard</BackButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalClients}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Offers</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalOffers}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Active Offers</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeOffers}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ${(stats.totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No buyer clients yet</p>
            <p className="text-gray-500 text-sm">
              Buyers will appear here once they link you as their agent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-gray-600">{client.email}</p>
                      {client.phone_number && (
                        <p className="text-gray-600">{client.phone_number}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-600">
                        ${client.maxOffer.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Highest Offer</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Offers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {client.offers.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Properties</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {client.propertiesCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Total offer</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(client.totalBid / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  {/* Recent Offers Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Recent Offers ({client.offers.length})
                    </p>
                    <div className="space-y-2">
                      {client.offers.slice(0, 3).map((offer: any) => (
                        <div key={offer.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {offer.properties.address}
                          </span>
                          <span className="font-bold text-indigo-600">
                            ${offer.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {client.offers.length > 3 && (
                        <p className="text-xs text-gray-500">
                          + {client.offers.length - 3} more offers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/agent/buyer-clients/${client.id}`}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition"
                    >
                      View Full Profile
                    </Link>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                      📞 Contact
                    </button>
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

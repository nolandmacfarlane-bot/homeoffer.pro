'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getPropertiesByAgent, getPropertyWithOffers } from '@/lib/properties'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SellerDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'properties' | 'approvals'>('properties')
  const [approvingId, setApprovingId] = useState<string | null>(null)

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

      // Load properties
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

      // Load pending approvals
      const { data: approvals, error } = await supabase
        .from('agent_approvals')
        .select(`
          *,
          users:buyer_id (id, first_name, last_name, email),
          properties:property_id (address, city, state)
        `)
        .eq('listing_agent_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Approval loading error:', error)
      } else {
        setPendingApprovals(approvals || [])
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproval(approvalId: string, approved: boolean) {
    setApprovingId(approvalId)

    try {
      const { data: authData } = await supabase.auth.getSession()
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.session?.access_token || ''}`,
        },
        body: JSON.stringify({ approvalId, approved }),
      })

      if (!response.ok) throw new Error('Approval failed')

      // Refresh approvals
      await loadDashboard()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setApprovingId(null)
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
              <h1 className="text-3xl font-bold text-gray-900">Listing Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage properties and buyer approvals</p>
            </div>
            <div className="space-x-4">
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">
                Browse
              </Link>
              <button
                onClick={() => router.push('/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buyer Approvals ({pendingApprovals.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <>
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
          </>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <>
            {pendingApprovals.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">No pending buyer approvals</p>
                <p className="text-gray-500 text-sm mt-2">
                  When buyers request access, they'll appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {approval.users?.first_name} {approval.users?.last_name}
                        </h3>
                        <p className="text-gray-600">{approval.users?.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Wants to offer on:{' '}
                          <span className="font-semibold text-gray-900">
                            {approval.properties?.address}, {approval.properties?.city}{' '}
                            {approval.properties?.state}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Requested {new Date(approval.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleApproval(approval.id, true)}
                          disabled={approvingId === approval.id}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, false)}
                          disabled={approvingId === approval.id}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

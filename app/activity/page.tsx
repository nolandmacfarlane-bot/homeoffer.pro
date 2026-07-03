'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ActivityPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'offers' | 'approvals' | 'bids'>('all')

  useEffect(() => {
    loadActivity()
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadActivity, 5000)
    return () => clearInterval(interval)
  }, [filter])

  async function loadActivity() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get offers submitted by user
      const { data: userOffers } = await supabase
        .from('offers')
        .select(`
          *,
          properties:property_id (address, city, state)
        `)
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Get approvals for user (if agent)
      const { data: approvals } = await supabase
        .from('agent_approvals')
        .select(`
          *,
          users:buyer_id (first_name, last_name, email),
          properties:property_id (address, city, state)
        `)
        .eq('listing_agent_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Combine and format activities
      const combinedActivities: any[] = []

      userOffers?.forEach((offer) => {
        combinedActivities.push({
          id: offer.id,
          type: 'offer',
          timestamp: offer.created_at,
          title: `You submitted an offer`,
          description: `$${offer.amount.toLocaleString()} on ${offer.properties?.address}`,
          property: offer.properties,
          amount: offer.amount,
          icon: '💰',
          color: 'blue',
        })
      })

      approvals?.forEach((approval) => {
        combinedActivities.push({
          id: approval.id,
          type: 'approval',
          timestamp: approval.created_at,
          title: approval.approved 
            ? `${approval.users?.first_name} was approved` 
            : `Approval request from ${approval.users?.first_name}`,
          description: approval.properties?.address,
          property: approval.properties,
          approved: approval.approved,
          icon: approval.approved ? '✅' : '⏳',
          color: approval.approved ? 'green' : 'yellow',
        })
      })

      // Sort by timestamp
      combinedActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Filter
      let filtered = combinedActivities
      if (filter === 'offers') {
        filtered = combinedActivities.filter((a) => a.type === 'offer')
      } else if (filter === 'approvals') {
        filtered = combinedActivities.filter((a) => a.type === 'approval')
      }

      setActivities(filtered)
    } catch (err) {
      console.error('Error loading activity:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
              <p className="text-gray-600 mt-1">Real-time marketplace activity</p>
            </div>
            <Link
              href="/buyer"
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'offers', 'approvals'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity Timeline */}
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No activity yet</p>
            <Link
              href="/properties"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow p-6 border-l-4"
                style={{
                  borderColor:
                    activity.color === 'blue'
                      ? '#4f46e5'
                      : activity.color === 'green'
                        ? '#22c55e'
                        : '#eab308',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">{activity.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{activity.description}</p>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {/* Amount (for offers) */}
                  {activity.type === 'offer' && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-indigo-600">
                        ${activity.amount.toLocaleString()}
                      </p>
                      <Link
                        href={`/properties/${activity.property?.id}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        View Property
                      </Link>
                    </div>
                  )}

                  {/* Status (for approvals) */}
                  {activity.type === 'approval' && (
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {activity.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-refresh notice */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
        🔄 Auto-refreshing every 5 seconds
      </div>
    </div>
  )
}

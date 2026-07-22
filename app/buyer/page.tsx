'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BuyerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    smsEnabled: false,
  })
  const [loading, setLoading] = useState(true)

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

      // Get offer stats
      const { data: offers, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .eq('buyer_id', currentUser.id)

      if (offersError) throw offersError

      const now = new Date()
      const activeOffers = offers?.filter((offer: any) => {
        // Would need to join with properties to check offer_end_date
        return true
      }) || []

      setStats({
        totalOffers: offers?.length || 0,
        activeOffers: activeOffers.length,
        smsEnabled: currentUser.sms_opt_in || false,
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
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
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.first_name}
              </h1>
              <p className="text-gray-600 mt-1">Your buyer dashboard</p>
            </div>
            <div className="space-x-4">
              <Link
                href="/account/sms-settings"
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                SMS Settings
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Offers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase mb-1">
                  Total Offers
                </p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats.totalOffers}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* Active Offers */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase mb-1">
                  Active Bids
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeOffers}
                </p>
              </div>
              <div className="text-4xl">🟢</div>
            </div>
          </div>

          {/* SMS Status */}
          <div className={`rounded-lg shadow p-6 ${stats.smsEnabled ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase mb-1">
                  SMS Notifications
                </p>
                <p className={`text-lg font-bold ${stats.smsEnabled ? 'text-blue-600' : 'text-gray-600'}`}>
                  {stats.smsEnabled ? '✅ Enabled' : '⚫ Disabled'}
                </p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Browse Properties */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🏠 Browse Properties</h3>
            <p className="text-gray-600 mb-4">
              Explore available properties and submit your offers
            </p>
            <Link
              href="/properties"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              View Properties
            </Link>
          </div>

          {/* My Offers */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📋 My Offers</h3>
            <p className="text-gray-600 mb-4">
              Track all your submitted offers and see their status
            </p>
            <Link
              href="/buyer/offers"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              View My Offers
            </Link>
          </div>

          {/* SMS Settings */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">📱 SMS Settings</h3>
            <p className="text-gray-600 mb-4">
              Manage your SMS notifications and preferences
            </p>
            <Link
              href="/account/sms-settings"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Manage SMS
            </Link>
          </div>

          {/* Privacy & Legal */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🔒 Privacy & Legal</h3>
            <p className="text-gray-600 mb-4">
              View our privacy policy, terms, and delete your data
            </p>
            <Link
              href="/privacy"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              View Policies
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 How It Works</h3>
          <ol className="list-decimal pl-6 space-y-2 text-blue-800">
            <li>Browse properties and find one you like</li>
            <li>Request approval from the listing agent</li>
            <li>Once approved, submit your offer in $500 increments</li>
            <li>If you're outoffer, you'll get an SMS notification</li>
            <li>Keep offering until the 13-day period ends</li>
            <li>Winner is announced automatically</li>
          </ol>
          <p className="text-sm text-blue-700 mt-4">
            📖 <strong>Pro Tip:</strong> Enable SMS notifications to get real-time updates when you're outoffer!
          </p>
        </div>
      </div>
    </div>
  )
}

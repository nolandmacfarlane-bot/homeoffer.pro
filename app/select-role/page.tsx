'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function SelectRolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentUser().catch(() => router.push('/login'))
  }, [router])

  async function selectRole(role: 'agent' | 'buyer-agent' | 'buyer') {
    setLoading(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const roleMap = {
        agent: 'agent',
        'buyer-agent': 'buyer',
        buyer: 'buyer',
      }

      await supabase
        .from('users')
        .update({ user_type: roleMap[role] })
        .eq('id', user.id)

      if (role === 'agent') {
        router.push('/seller')
      } else {
        router.push('/properties')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-center">What's your role?</h1>
        <p className="text-gray-600 text-center mb-8 sm:mb-10">Choose how you'll use Home Offer</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Listing Agent */}
          <button
            onClick={() => selectRole('agent')}
            disabled={loading}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-lg p-6 sm:p-8 text-center transition hover:scale-105 disabled:opacity-50 min-h-64"
            aria-pressed="false"
          >
            <div className="text-5xl sm:text-6xl mb-4">📋</div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Listing Agent</h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">Post properties and manage offers</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Create listings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Approve buyers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Track offers</span>
              </li>
            </ul>
          </button>

          {/* Buyer Agent */}
          <button
            onClick={() => selectRole('buyer-agent')}
            disabled={loading}
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 rounded-lg p-6 sm:p-8 text-center transition hover:scale-105 disabled:opacity-50 min-h-64"
            aria-pressed="false"
          >
            <div className="text-5xl sm:text-6xl mb-4">🤝</div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Buyer Agent</h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">Submit offers on behalf of your clients</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Browse properties</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Submit offers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Track bids</span>
              </li>
            </ul>
          </button>

          {/* Independent Buyer */}
          <button
            onClick={() => selectRole('buyer')}
            disabled={loading}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 rounded-lg p-6 sm:p-8 text-center transition hover:scale-105 disabled:opacity-50 min-h-64"
            aria-pressed="false"
          >
            <div className="text-5xl sm:text-6xl mb-4">🏠</div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Buyer (No Agent)</h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">Submit your own offers directly</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Browse properties</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Submit offers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" aria-hidden="true">✓</span>
                <span>Track bids</span>
              </li>
            </ul>
          </button>
        </div>

        <p className="text-center text-gray-600 mt-8 sm:mt-10 text-xs sm:text-sm">
          You can change this anytime in your account settings
        </p>

        <div className="mt-8 pt-8 border-t text-center text-xs text-gray-500">
          <p>ADA Compliant ♿</p>
        </div>
      </div>
    </div>
  )
}

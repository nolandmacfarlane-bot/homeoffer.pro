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
    // Check if user is logged in
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">What's your role?</h1>
        <p className="text-gray-600 text-center mb-8">Choose how you'll use Home Offer</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listing Agent */}
          <button
            onClick={() => selectRole('agent')}
            disabled={loading}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:border-blue-600 rounded-lg p-8 text-center transition hover:scale-105 disabled:opacity-50"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Listing Agent</h3>
            <p className="text-gray-700 mb-4">Post properties and manage offers</p>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>✓ Create listings</li>
              <li>✓ Approve buyers</li>
              <li>✓ Track offers</li>
            </ul>
          </button>

          {/* Buyer Agent */}
          <button
            onClick={() => selectRole('buyer-agent')}
            disabled={loading}
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:border-green-600 rounded-lg p-8 text-center transition hover:scale-105 disabled:opacity-50"
          >
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Buyer Agent</h3>
            <p className="text-gray-700 mb-4">Submit offers on behalf of your clients</p>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>✓ Browse properties</li>
              <li>✓ Submit offers</li>
              <li>✓ Track bids</li>
            </ul>
          </button>

          {/* Independent Buyer */}
          <button
            onClick={() => selectRole('buyer')}
            disabled={loading}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 hover:border-purple-600 rounded-lg p-8 text-center transition hover:scale-105 disabled:opacity-50"
          >
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Buyer (No Agent)</h3>
            <p className="text-gray-700 mb-4">Submit your own offers directly</p>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>✓ Browse properties</li>
              <li>✓ Submit offers</li>
              <li>✓ Track bids</li>
            </ul>
          </button>
        </div>

        <p className="text-center text-gray-600 mt-8 text-sm">
          You can change this anytime in your account settings
        </p>
      </div>
    </div>
  )
}

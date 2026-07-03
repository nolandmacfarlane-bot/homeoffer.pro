'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SelectRolePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'buyer' | 'seller' | 'agent' | null>(null)
  const [showAgentSearch, setShowAgentSearch] = useState(false)
  const [agentSearch, setAgentSearch] = useState('')
  const [agentResults, setAgentResults] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }

  async function searchAgents(query: string) {
    if (!query || query.length < 2) {
      setAgentResults([])
      return
    }

    try {
      const { data: agents } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number')
        .eq('user_type', 'agent')
        .or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
        )
        .limit(10)

      setAgentResults(agents || [])
    } catch (err) {
      console.error('Error searching agents:', err)
    }
  }

  async function handleSelectRole(selectedRole: 'buyer' | 'seller' | 'agent') {
    setRole(selectedRole)

    if (selectedRole === 'buyer') {
      setShowAgentSearch(true)
    } else {
      await saveRole(selectedRole, null)
    }
  }

  async function handleSelectAgent(agent: any) {
    setSelectedAgent(agent)
    await saveRole('buyer', agent.id)
  }

  async function handleSkipAgent() {
    await saveRole('buyer', null)
  }

  async function saveRole(selectedRole: string, agentId: string | null) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          user_type: selectedRole,
          agent_id: agentId,
        })
        .eq('id', user.id)

      if (error) throw error

      // Redirect to appropriate dashboard
      if (selectedRole === 'buyer') {
        router.push('/buyer')
      } else if (selectedRole === 'seller' || selectedRole === 'agent') {
        router.push('/seller')
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
      setSaving(false)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {!role ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {user?.first_name}!</h1>
            <p className="text-xl text-gray-600">How would you like to use Home Offer?</p>
          </div>
        ) : !showAgentSearch ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Almost there!</h1>
            <p className="text-xl text-gray-600">Complete your profile</p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Do you have a buyer's agent?</h1>
            <p className="text-xl text-gray-600">Link your agent to collaborate on offers</p>
          </div>
        )}

        {/* Role Selection */}
        {!role ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Buyer */}
            <button
              onClick={() => handleSelectRole('buyer')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🏠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm a Buyer</h2>
              <p className="text-gray-600 mb-4">
                Browse properties and submit competitive offers
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✓ Submit offers</li>
                <li>✓ Track your bids</li>
                <li>✓ Get notifications</li>
              </ul>
              <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition">
                Get Started →
              </div>
            </button>

            {/* Seller/Agent */}
            <button
              onClick={() => handleSelectRole('agent')}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm a Listing Agent</h2>
              <p className="text-gray-600 mb-4">
                List properties and manage buyer offers
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✓ List properties</li>
                <li>✓ Manage offers</li>
                <li>✓ Contact buyers</li>
              </ul>
              <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition">
                Get Started →
              </div>
            </button>

            {/* Buyer's Agent */}
            <button
              onClick={() => {
                setRole('agent')
                setShowAgentSearch(false)
                handleSelectRole('agent')
              }}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm a Buyer's Agent</h2>
              <p className="text-gray-600 mb-4">
                Represent buyers and manage multiple offers
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>✓ Manage clients</li>
                <li>✓ Track offers</li>
                <li>✓ Coordinate bids</li>
              </ul>
              <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition">
                Get Started →
              </div>
            </button>
          </div>
        ) : showAgentSearch ? (
          <div className="max-w-2xl mx-auto">
            {/* Search for Agent */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Find Your Agent</h3>

              <input
                type="text"
                value={agentSearch}
                onChange={(e) => {
                  setAgentSearch(e.target.value)
                  searchAgents(e.target.value)
                }}
                placeholder="Search by name or email..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />

              {/* Agent Results */}
              {agentSearch && (
                <div className="space-y-2 mb-6">
                  {agentResults.length > 0 ? (
                    agentResults.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent)}
                        disabled={saving}
                        className="w-full text-left p-4 border border-gray-300 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50"
                      >
                        <p className="font-bold text-gray-900">
                          {agent.first_name} {agent.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{agent.email}</p>
                        {agent.phone_number && (
                          <p className="text-sm text-gray-600">{agent.phone_number}</p>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">No agents found</p>
                  )}
                </div>
              )}

              {/* Skip Option */}
              <button
                onClick={handleSkipAgent}
                disabled={saving}
                className="w-full text-center text-indigo-600 hover:underline font-semibold disabled:opacity-50"
              >
                Skip for now →
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => {
                setRole(null)
                setShowAgentSearch(false)
                setAgentSearch('')
                setAgentResults([])
              }}
              className="w-full text-center text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back to role selection
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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

    const intendedRole = window.localStorage.getItem('homeoffer_signup_role')
    if (intendedRole === 'agent' && currentUser.user_type !== 'agent') {
      const { error: roleError } = await supabase
        .from('users')
        .update({ user_type: 'agent' })
        .eq('id', currentUser.id)

      if (!roleError) {
        const sponsorCode = window.localStorage.getItem('homeoffer_sponsor_code')
        if (sponsorCode) {
          const { error: sponsorError } = await supabase.rpc('claim_agent_sponsor', {
            sponsor_code: sponsorCode,
          })
          if (!sponsorError) window.localStorage.removeItem('homeoffer_sponsor_code')
        }
        window.localStorage.removeItem('homeoffer_signup_role')
        router.push('/agent/profile')
        return
      }
    }
    
    // If user already has a role, send them to their dashboard
    if (currentUser.user_type) {
      if (currentUser.user_type === 'buyer') {
        router.push('/buyer')
      } else if (currentUser.user_type === 'seller') {
        router.push('/seller')
      } else if (currentUser.user_type === 'agent') {
        router.push('/agent/profile')
      }
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
        .select('id, first_name, last_name, email, phone_number, dre_license_number')
        .eq('user_type', 'agent')
        .eq('dre_verified', true)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,dre_license_number.ilike.%${query}%`)
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

      if (selectedRole === 'agent') {
        const sponsorCode = window.localStorage.getItem('homeoffer_sponsor_code')
        if (sponsorCode) {
          const { error: sponsorError } = await supabase.rpc('claim_agent_sponsor', {
            sponsor_code: sponsorCode,
          })
          if (!sponsorError) {
            window.localStorage.removeItem('homeoffer_sponsor_code')
          }
        }
      }

      // Redirect to appropriate dashboard
      if (selectedRole === 'buyer') {
        router.push('/buyer')
      } else if (selectedRole === 'seller') {
        router.push('/seller')
      } else if (selectedRole === 'agent') {
        router.push('/agent/profile')
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {!role ? (
            <>
              {/* Role Selection */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {user?.first_name}!</h1>
                <p className="text-xl text-gray-600">How would you like to use Home Offer?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Buyer Card */}
                <button
                  onClick={() => handleSelectRole('buyer')}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition text-left group"
                >
                  <div className="text-6xl mb-4">🏠</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Buyer</h2>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>✓ Browse properties</li>
                    <li>✓ Submit offers</li>
                    <li>✓ Track your activity</li>
                    <li>✓ Coordinate with agents</li>
                  </ul>
                </button>

                {/* Seller Card */}
                <button
                  onClick={() => handleSelectRole('seller')}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition text-left group"
                >
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Seller</h2>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>✓ Create listings</li>
                    <li>✓ Receive offers</li>
                    <li>✓ Send counter-offers</li>
                    <li>✓ Manage negotiations</li>
                  </ul>
                </button>

                {/* Agent Card */}
                <button
                  onClick={() => handleSelectRole('agent')}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl hover:scale-105 transition text-left group"
                >
                  <div className="text-6xl mb-4">🤝</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Real Estate Agent</h2>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>✓ Add DRE license</li>
                    <li>✓ Manage buyer clients</li>
                    <li>✓ Track deals</li>
                    <li>✓ Close transactions faster</li>
                  </ul>
                </button>
              </div>
            </>
          ) : showAgentSearch && !selectedAgent ? (
            <>
              {/* Agent Search */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Do you have a buyer's agent?</h1>
                <p className="text-xl text-gray-600 mb-2">Link your agent to collaborate on offers</p>
                <p className="text-sm text-gray-500">(optional - you can find one later)</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                {/* Search Input */}
                <input
                  type="text"
                  value={agentSearch}
                  onChange={(e) => {
                    setAgentSearch(e.target.value)
                    searchAgents(e.target.value)
                  }}
                  placeholder="Search by agent name or DRE number..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
                />

                {/* Agent Results */}
                {agentSearch && agentResults.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {agentResults.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-500 transition text-left"
                      >
                        <p className="font-bold text-gray-900">
                          {agent.first_name} {agent.last_name}
                        </p>
                        <p className="text-sm text-gray-600">DRE #{agent.dre_license_number || 'Not provided'} · {agent.phone_number || 'Phone not provided'}</p>
                      </button>
                    ))}
                  </div>
                ) : agentSearch && agentResults.length === 0 ? (
                  <p className="text-center text-gray-500 mb-6">No agents found</p>
                ) : null}

                {/* Skip Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSkipAgent}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                  >
                    {saving ? 'Setting up...' : 'Continue Without an Agent'}
                  </button>
                </div>
              </div>

              {/* Go Back */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setRole(null)
                    setShowAgentSearch(false)
                    setAgentSearch('')
                    setAgentResults([])
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  ← Back
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

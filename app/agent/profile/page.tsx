'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AgentProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dre_license_number: '',
    broker_name: '',
    broker_dre_number: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
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

      const { data: authData } = await supabase.auth.getUser()
      const metadata = authData.user?.user_metadata || {}

      setUser({ ...currentUser, ...metadata })
      setFormData({
        first_name: currentUser.first_name || metadata.first_name || '',
        last_name: currentUser.last_name || metadata.last_name || '',
        email: currentUser.email || authData.user?.email || '',
        phone_number: currentUser.phone_number || metadata.phone_number || '',
        dre_license_number: currentUser.dre_license_number || metadata.dre_license_number || '',
        broker_name: currentUser.broker_name || metadata.broker_name || '',
        broker_dre_number: currentUser.broker_dre_number || metadata.broker_dre_number || '',
      })
    } catch (err) {
      console.error('Error:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const profileDetails = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        dre_license_number: formData.dre_license_number,
        broker_name: formData.broker_name,
        broker_dre_number: formData.broker_dre_number,
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: profileDetails,
      })
      if (metadataError) throw metadataError

      const { error } = await supabase
        .from('users')
        .update(profileDetails)
        .eq('id', user.id)

      const isMissingAgentColumn =
        error?.message?.includes('schema cache') &&
        ['phone_number', 'dre_license_number', 'broker_name', 'broker_dre_number'].some(
          (field) => error.message.includes(field)
        )

      if (error && !isMissingAgentColumn) throw error

      setUser({ ...user, ...profileDetails })
      setEditing(false)
      await loadProfile()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Profile</h1>
              <p className="text-gray-600 mt-1">Manage your professional information</p>
            </div>
            <Link
              href="/agent/dashboard"
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-950">
            <h2 className="text-xl font-bold">Agent information</h2>
            <p className="mt-2 text-sm">Your license information is stored with your profile. Manual approval is not required to browse or submit offers.</p>
          </div>

          {/* Profile Form */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">First Name</p>
                    <p className="text-gray-900 text-lg">{formData.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Last Name</p>
                    <p className="text-gray-900 text-lg">{formData.last_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Email</p>
                  <p className="text-gray-900 text-lg">{formData.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-1">Phone</p>
                  <p className="text-gray-900 text-lg">{formData.phone_number || '(Not provided)'}</p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">License Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">DRE License #</p>
                      <p className="text-gray-900 text-lg">
                        {formData.dre_license_number || '(Not provided)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">Broker Name</p>
                      <p className="text-gray-900 text-lg">
                        {formData.broker_name || '(Not provided)'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Broker DRE #</p>
                    <p className="text-gray-900 text-lg">
                      {formData.broker_dre_number || '(Not provided)'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">License Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        California DRE License # *
                      </label>
                      <input
                        type="text"
                        value={formData.dre_license_number}
                        onChange={(e) =>
                          setFormData({ ...formData, dre_license_number: e.target.value })
                        }
                        placeholder="12345678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find your license at: <a href="https://www.bre.ca.gov/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">bre.ca.gov</a>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Broker Name
                      </label>
                      <input
                        type="text"
                        value={formData.broker_name}
                        onChange={(e) =>
                          setFormData({ ...formData, broker_name: e.target.value })
                        }
                        placeholder="Your Broker's Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Broker DRE License #
                    </label>
                    <input
                      type="text"
                      value={formData.broker_dre_number}
                      onChange={(e) =>
                        setFormData({ ...formData, broker_dre_number: e.target.value })
                      }
                      placeholder="Broker's DRE #"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm">
                    <strong>DRE verification:</strong> After you add your DRE license number, our team will verify it within 24-48 hours. Once verified, you'll appear in buyer agent directories.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving...' : '✅ Save Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

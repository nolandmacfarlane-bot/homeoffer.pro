'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import BackButton from '@/components/BackButton'
import { dangerButton, primaryButton, secondaryButton } from '@/lib/ui-styles'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_offers: true,
    email_approvals: true,
    sms_offers: false,
    sms_approvals: false,
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

      setUser(currentUser)
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
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
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
        })
        .eq('id', user.id)

      if (error) throw error

      alert('✅ Profile updated!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      alert('Error signing out')
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="flex max-w-4xl flex-col gap-4 px-4 py-6 mx-auto sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            {user?.user_type === 'agent' && (
              <BackButton href="/agent/profile">Agent dashboard</BackButton>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Tabs */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'notifications'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔔 Notifications
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'privacy'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔒 Privacy
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'account'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔐 Account
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Email (cannot change)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
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

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className={primaryButton}
                    >
                      {saving ? 'Saving...' : '✅ Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">Email Offers</p>
                        <p className="text-sm text-gray-600">Get notified when you receive offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_offers}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_offers: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">Email Approvals</p>
                        <p className="text-sm text-gray-600">Get notified when offers are approved</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_approvals}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_approvals: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">SMS Offers</p>
                        <p className="text-sm text-gray-600">Get text messages about new offers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms_offers}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            sms_offers: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                        disabled={!user.sms_opt_in}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">SMS Approvals</p>
                        <p className="text-sm text-gray-600">Get text messages about offer approvals</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms_approvals}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            sms_approvals: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                        disabled={!user.sms_opt_in}
                      />
                    </div>
                  </div>

                  <button className={`${primaryButton} mt-6`}>
                    ✅ Save Preferences
                  </button>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Data</h2>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">Download My Data</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Download all your personal data in a standard format
                      </p>
                      <button className={secondaryButton}>
                        📥 Download Data
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">Delete My Account</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all data
                      </p>
                      <button className={dangerButton}>
                        🗑️ Delete Account
                      </button>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-900 text-sm">
                        <strong>Privacy Policy:</strong> Read our{' '}
                        <Link href="/privacy" className="font-bold hover:underline">
                          complete privacy policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account & Security</h2>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">Account Type</p>
                      <p className="text-gray-600 capitalize font-semibold">
                        {user.user_type === 'agent' ? 'Real Estate Agent' : user.user_type}
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">Member Since</p>
                      <p className="text-gray-600">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">Change Password</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Update your password to keep your account secure
                      </p>
                      <button className={secondaryButton}>
                        🔑 Change Password
                      </button>
                    </div>

                    <div className="p-4 border-t-2 border-red-200 bg-red-50 rounded-lg mt-6">
                      <p className="font-semibold text-red-900 mb-2">Sign Out</p>
                      <button
                        onClick={handleSignOut}
                        className={dangerButton}
                      >
                        🚪 Sign Out Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

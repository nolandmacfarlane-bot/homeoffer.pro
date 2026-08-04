'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function SMSSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get SMS opt-in status from user metadata
      const { data, error } = await supabase
        .from('users')
        .select('sms_opt_in')
        .eq('id', currentUser.id)
        .single()

      if (error) {
        console.error('Error loading SMS settings:', error)
      } else {
        setSmsOptIn(data?.sms_opt_in || false)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSMSToggle(newValue: boolean) {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({ sms_opt_in: newValue })
        .eq('id', user.id)

      if (error) throw error

      setSmsOptIn(newValue)
      setMessage(
        newValue
          ? '✅ SMS notifications enabled'
          : '✅ SMS notifications disabled'
      )

      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`)
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SMS Settings</h1>
              <p className="text-gray-600 mt-1">Manage your SMS notifications</p>
            </div>
            <BackButton href="/buyer">Back</BackButton>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* SMS Opt-In Setting */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            SMS Notifications
          </h2>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Receive SMS Updates
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Get notified about offers, approvals, and important marketplace
                updates via text message
              </p>
            </div>
            <button
              onClick={() => handleSMSToggle(!smsOptIn)}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                smsOptIn ? 'bg-green-600' : 'bg-gray-300'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  smsOptIn ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
              {message}
            </div>
          )}
        </div>

        {/* SMS Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Current Status</h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>
              <strong>Phone Number:</strong> {user?.phone_number || 'Not provided'}
            </p>
            <p>
              <strong>SMS Notifications:</strong>{' '}
              <span className={smsOptIn ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {smsOptIn ? '✅ Enabled' : '⚫ Disabled'}
              </span>
            </p>
            <p>
              <strong>Message Types:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Buyer approval requests</li>
              <li>Approval confirmations</li>
              <li>New offer notifications</li>
              <li>Offer status updates</li>
            </ul>
          </div>
        </div>

        {/* Opt-Out Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-3">How to Opt-Out</h3>
          <p className="text-yellow-800 text-sm mb-3">
            You can disable SMS notifications at any time using any of these methods:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-yellow-800 text-sm">
            <li>Toggle the "Receive SMS Updates" switch above</li>
            <li>Reply STOP to any SMS message from us</li>
            <li>Reply UNSUBSCRIBE to any SMS message</li>
          </ul>
          <p className="text-yellow-800 text-sm mt-3">
            Message and data rates may apply. See our{' '}
            <Link href="/sms-policy" className="font-semibold underline">
              SMS Policy
            </Link>{' '}
            for more details.
          </p>
        </div>

        {/* Update Phone Number */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Update Phone Number
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            To update the phone number where you receive SMS notifications, please contact support@cpt.law
          </p>
          <a
            href="mailto:support@cpt.law"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Contact Support
          </a>
        </div>

        {/* Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-600">
          <Link href="/privacy" className="hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900">
            Terms of Service
          </Link>
          <Link href="/sms-policy" className="hover:text-gray-900">
            SMS Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

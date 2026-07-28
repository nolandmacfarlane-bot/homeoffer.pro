'use client'

import { useEffect, useState } from 'react'
import { signUp } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  })
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentSignup, setAgentSignup] = useState(false)
  const [signupRole, setSignupRole] = useState<'buyer' | 'seller' | 'agent'>('buyer')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const referralCode = params.get('ref')
    const requestedRole = params.get('role')
    const role =
      requestedRole === 'seller'
        ? 'seller'
        : requestedRole === 'agent' || referralCode
          ? 'agent'
          : 'buyer'

    setSignupRole(role)
    setAgentSignup(role === 'agent')

    if (role === 'seller' || role === 'agent') {
      window.localStorage.setItem('homeoffer_signup_role', role)
    } else {
      window.localStorage.removeItem('homeoffer_signup_role')
    }

    if (referralCode) {
      window.localStorage.setItem('homeoffer_sponsor_code', referralCode.toUpperCase())
    }
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.password !== formData.password_confirm) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      await signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: signupRole,
        sms_opt_in: smsOptIn,
      })

      if (agentSignup) {
        const sponsorCode = window.localStorage.getItem('homeoffer_sponsor_code')
        if (sponsorCode) {
          const { supabase } = await import('@/lib/supabase')
          const { error: sponsorError } = await supabase.rpc('claim_agent_sponsor', {
            sponsor_code: sponsorCode,
          })
          if (!sponsorError) window.localStorage.removeItem('homeoffer_sponsor_code')
        }
        window.localStorage.removeItem('homeoffer_signup_role')
        router.push('/agent/profile')
      } else if (signupRole === 'seller') {
        window.localStorage.removeItem('homeoffer_signup_role')
        router.push('/seller')
      } else {
        router.push('/buyer')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Home Offer</h1>
        <p className="text-gray-600 mb-6">
          {agentSignup ? 'Create your agent account' : 'Create your account'}
        </p>
        {agentSignup && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
            Agent membership is $7 per month. Add your license details after creating your account, then complete secure billing through Stripe.
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-gray-500 text-xs">(min 8 characters)</span>
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
              required
              aria-required="true"
              aria-describedby="password-hint"
            />
            <p id="password-hint" className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={formData.password_confirm}
              onChange={(e) =>
                setFormData({ ...formData, password_confirm: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900"
              required
              aria-required="true"
            />
          </div>

          {/* SMS Opt-In Checkbox */}
          <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
            <input
              type="checkbox"
              id="sms-optin"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-1 w-4 h-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="sms-optin" className="text-xs text-gray-700 cursor-pointer">
              I agree to receive SMS text message notifications about offers, approvals, and marketplace updates. Standard message rates apply. I can opt-out anytime by replying STOP. See our{' '}
              <Link href="/sms-policy" className="text-indigo-600 hover:underline font-semibold">
                SMS Policy
              </Link>
              .
            </label>
          </div>

          {/* Terms & Privacy Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              required
            />
            <label htmlFor="terms" className="text-xs text-gray-700 cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-indigo-600 hover:underline font-semibold">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-indigo-600 hover:underline font-semibold">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className="w-full bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 min-h-12 text-base"
            aria-busy={loading}
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded px-1">
            Sign in
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t text-center text-xs text-gray-500 space-y-2">
          <p>By creating an account, you agree to our policies.</p>
          <p>ADA Compliant ♿</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type AccountRole = 'buyer' | 'seller' | 'agent'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function completeSignIn() {
      try {
        const params = new URLSearchParams(window.location.search)
        const providerError = params.get('error_description') || params.get('error')
        if (providerError) throw new Error(providerError)

        const code = params.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            const { data: existingSession } = await supabase.auth.getSession()
            if (!existingSession.session) throw exchangeError
          }
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!sessionData.session?.user) {
          throw new Error('We could not finish signing you in. Please try again.')
        }

        const authUser = sessionData.session.user
        const intendedRole: AccountRole = 'buyer'

        const { data: existingProfile, error: lookupError } = await supabase
          .from('users')
          .select('id, user_type')
          .eq('id', authUser.id)
          .maybeSingle()

        if (lookupError) throw lookupError

        let accountRole = existingProfile?.user_type as AccountRole | null

        if (!existingProfile) {
          const fullName =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'User'
          const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/)
          accountRole = intendedRole

          const { error: insertError } = await supabase.from('users').insert({
            id: authUser.id,
            email: authUser.email,
            first_name: firstName || 'User',
            last_name: lastNameParts.join(' '),
            user_type: accountRole,
            sms_opt_in: false,
          })

          if (insertError) throw insertError
        }

        if (accountRole === 'agent') {
          const sponsorCode = window.localStorage.getItem('homeoffer_sponsor_code')
          if (sponsorCode) {
            const { error: sponsorError } = await supabase.rpc('claim_agent_sponsor', {
              sponsor_code: sponsorCode,
            })
            if (!sponsorError) window.localStorage.removeItem('homeoffer_sponsor_code')
          }
        }

        window.localStorage.removeItem('homeoffer_signup_role')

        if (!active) return
        router.replace('/')
      } catch (err: any) {
        if (active) setError(err.message || 'Unable to complete sign in.')
      }
    }

    completeSignIn()
    return () => {
      active = false
    }
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {error ? (
          <>
            <h1 className="text-2xl font-black text-slate-950">Sign in could not be completed</h1>
            <p className="mt-3 leading-7 text-slate-600">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-black text-white hover:bg-blue-700"
            >
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"
              aria-hidden="true"
            />
            <h1 className="mt-5 text-2xl font-black text-slate-950">Finishing your sign in</h1>
            <p className="mt-2 text-slate-600">Your HomeOffer.pro account will open in a moment.</p>
          </>
        )}
      </div>
    </main>
  )
}

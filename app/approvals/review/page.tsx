'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildLoginPath } from '@/lib/auth-redirect'

export default function ReviewApprovalPage() {
  const [id, setId] = useState('')
  const [decision, setDecision] = useState<'approve' | 'decline' | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestId = params.get('id') || ''
    const action = params.get('decision')
    setId(requestId)
    setDecision(action === 'approve' || action === 'decline' ? action : null)
  }, [])

  async function confirmDecision() {
    if (!id || !decision || busy) return
    setBusy(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        window.location.assign(buildLoginPath(window.location.pathname + window.location.search))
        return
      }
      const makeRequest = async (token: string) => fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approvalId: id, approved: decision === 'approve' }),
      })
      let response = await makeRequest(data.session.access_token)
      if (response.status === 401) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshed.session) {
          window.location.assign(buildLoginPath(window.location.pathname + window.location.search))
          return
        }
        response = await makeRequest(refreshed.session.access_token)
      }
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save approval decision.')
      setCompleted(true)
      setMessage(decision === 'approve' ? 'Buyer approved for bidding.' : 'Bidding request declined.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save approval decision.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold">Bidding approval</h1>
        {!id || !decision ? (
          <p className="mt-4">This approval link is incomplete. Open the link from your HomeOffer.pro email.</p>
        ) : completed ? (
          <p className="mt-5 font-semibold text-green-700" role="status">{message}</p>
        ) : (
          <>
            <p className="mt-4 text-slate-600">
              {decision === 'approve' ? 'Approve this buyer to bid on the property?' : 'Decline this buyer’s bidding request?'}
            </p>
            <p className="mt-2 text-sm text-slate-500">Only the assigned listing agent can confirm this action. Clicking an email link alone does not change the approval.</p>
            <button type="button" disabled={busy} onClick={confirmDecision} className={`mt-6 w-full rounded-lg px-5 py-3 font-bold text-white disabled:opacity-60 ${decision === 'approve' ? 'bg-green-700' : 'bg-red-700'}`}>
              {busy ? 'Saving…' : decision === 'approve' ? 'Confirm approval' : 'Confirm decline'}
            </button>
            {message && <p className="mt-4 text-red-700" role="alert">{message}</p>}
          </>
        )}
        <Link href="/seller" className="mt-6 inline-block font-semibold text-blue-700">Back to dashboard</Link>
      </div>
    </main>
  )
}

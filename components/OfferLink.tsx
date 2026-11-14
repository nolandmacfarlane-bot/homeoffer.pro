'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { buildLoginPath } from '@/lib/auth-redirect'
import { supabase } from '@/lib/supabase'

type PropertyMatch = { id: string; listing_agent_id: string }

export default function OfferLink({ slug, address, className, children }: {
  slug: string
  address: string
  className?: string
  children: ReactNode
}) {
  const returnPath = `/listing/${slug}#offer-process`
  const [open, setOpen] = useState(false)
  const [property, setProperty] = useState<PropertyMatch | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [submitting, setSubmitting] = useState<'agent' | 'instant' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [approvalState, setApprovalState] = useState<'approved' | 'pending' | 'denied' | null>(null)
  const [approvedPropertyId, setApprovedPropertyId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  useEffect(() => {
    let active = true
    let checking = false
    async function syncApproval() {
      if (checking || document.visibilityState === 'hidden') return
      checking = true
      try {
        const { data: auth } = await supabase.auth.getSession()
        if (!auth.session) {
          if (active) { setApprovalState(null); setApprovedPropertyId(null) }
          return
        }
        const { data: match } = await supabase.from('properties')
          .select('id').ilike('address', address.trim()).limit(1).maybeSingle()
        if (!match?.id) return
        const response = await fetch(`/api/approvals?propertyId=${encodeURIComponent(match.id)}`, {
          headers: { Authorization: `Bearer ${auth.session.access_token}` },
          cache: 'no-store',
        })
        if (!response.ok) return
        const payload = await response.json()
        if (!active) return
        const status = payload.approval?.status
        setApprovalState(payload.approval?.approved || status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : status === 'denied' ? 'denied' : null)
        setApprovedPropertyId(match.id)
        if (payload.approval?.approved || status === 'approved') setOpen(false)
      } catch {
        // Keep the current button until approval status can be verified.
      } finally { checking = false }
    }
    void syncApproval()
    const interval = window.setInterval(() => void syncApproval(), 4000)
    const onFocus = () => void syncApproval()
    window.addEventListener('focus', onFocus)
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('focus', onFocus) }
  }, [address])

  async function getSessionAndProperty() {
    const [{ data: auth }, { data: match, error: lookupError }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('properties').select('id, listing_agent_id').ilike('address', address.trim()).limit(1).maybeSingle(),
    ])
    if (!auth.session) {
      window.location.assign(buildLoginPath(returnPath))
      return null
    }
    if (lookupError || !match?.id) throw new Error('This listing is a preview and is not connected to an active bidding record. The listing agent must publish it before approval requests can be submitted.')
    return { session: auth.session, property: match as PropertyMatch }
  }

  async function showApproval() {
    if (approvalState === 'approved' && approvedPropertyId) {
      window.location.assign(`/properties/${approvedPropertyId}`)
      return
    }
    if (approvalState === 'pending') {
      setError('')
      setNotice('Your approval request is pending. The listing agent has been notified.')
      setOpen(true)
      return
    }
    setError('')
    try {
      const result = await getSessionAndProperty()
      if (!result) return
      setProperty(result.property)
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start bidding approval.')
      setOpen(true)
    }
  }

  async function postWithFreshSession(url: string, propertyId: string) {
    async function send(token: string) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId }),
      })
    }

    const { data: initial, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !initial.session) {
      throw new Error('Your sign-in has expired. Please sign in again before requesting approval.')
    }

    let response = await send(initial.session.access_token)
    if (response.status === 401) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !refreshed.session) {
        throw new Error('Your sign-in has expired. Please sign in again before requesting approval.')
      }
      response = await send(refreshed.session.access_token)
    }
    return response
  }

  async function requestAgentApproval() {
    if (!acknowledged) { setError('Please confirm the buyer’s premium before continuing.'); return }
    setSubmitting('agent'); setError(''); setNotice('')
    try {
      const result = await getSessionAndProperty()
      if (!result) return
      const response = await postWithFreshSession('/api/approvals', result.property.id)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to send approval request.')
      if (payload.approval?.approved || payload.approval?.status === 'approved') {
        setApprovalState('approved')
        setApprovedPropertyId(result.property.id)
        setOpen(false)
        return
      }
      setApprovalState('pending')
      setNotice(payload.notificationSent
        ? 'Your approval request was sent, and the listing agent was emailed.'
        : 'Your approval request was saved. Email notification has not been confirmed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request approval.')
    } finally { setSubmitting(null) }
  }

  async function startInstantApproval() {
    if (!acknowledged) { setError('Please confirm the buyer’s premium before continuing.'); return }
    setSubmitting('instant'); setError(''); setNotice('')
    try {
      const result = await getSessionAndProperty()
      if (!result) return
      const response = await postWithFreshSession('/api/card-verification', result.property.id)
      const payload = await response.json()
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Unable to start instant approval.')
      window.location.assign(payload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start instant approval.')
      setSubmitting(null)
    }
  }

  return <>
    <button type="button" onClick={showApproval} className={approvalState === 'approved' ? `${className ?? ''} !bg-green-600 hover:!bg-green-700 !text-white` : className}>{approvalState === 'approved' ? 'Submit offer' : approvalState === 'pending' ? 'Approval pending' : children}</button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/65 p-4" role="dialog" aria-modal="true" aria-labelledby="bidding-approval-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-blue-800 px-6 py-5 text-white">
          <h2 id="bidding-approval-title" className="text-lg font-black uppercase tracking-wide">Bidding approval</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-3xl leading-none hover:bg-white/10" aria-label="Close bidding approval">×</button>
        </div>
        <div className="p-6 sm:p-8">
          <p className="border-b border-slate-200 pb-4 font-black text-blue-800">Approval request</p>
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center leading-7 text-slate-800">
            Verify your identity for instant approval, or request approval directly from the listing agent. You will not be charged during verification.
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold leading-6 text-slate-700">
            <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-blue-700" />
            <span>I understand that if the seller selects me as the winning buyer, my purchase contract amount will be the winning offer plus the 3% buyer’s premium.</span>
          </label>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p>}
          {notice && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 font-bold text-green-800">{notice}</p>}
          {approvalState === 'pending' ? <p className="mt-6 text-center font-bold text-blue-800">Your approval request is pending. This page updates automatically when the agent responds.</p> : <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={Boolean(submitting) || Boolean(notice)} onClick={requestAgentApproval} className="rounded-xl border-2 border-blue-700 px-5 py-3 font-black text-blue-800 disabled:opacity-50">{submitting === 'agent' ? 'Sending…' : 'Request listing agent approval'}</button>
            <button type="button" disabled={Boolean(submitting) || Boolean(notice)} onClick={startInstantApproval} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-50">{submitting === 'instant' ? 'Opening verification…' : 'Approve me for bidding'}</button>
          </div>}
          {property && <p className="mt-4 text-center text-xs text-slate-400">Approval is linked to this property only.</p>}
        </div>
      </div>
    </div>}
  </>
}

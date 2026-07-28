'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPropertyWithOffers } from '@/lib/properties'
import { submitOffer } from '@/lib/offers'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import CountdownTimer from '@/components/CountdownTimer'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [offerAmount, setOfferAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [offerRole, setOfferRole] = useState<'buyer' | 'agent' | ''>('')
  const [approvalGranted, setApprovalGranted] = useState(false)
  const [approvalRequested, setApprovalRequested] = useState(false)
  const [cardVerified, setCardVerified] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    loadPropertyData()
  }, [propertyId])

  async function loadPropertyData() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser?.id) {
        setCardVerified(Boolean(currentUser.offer_card_verified))
        const { data: approval } = await supabase
          .from('agent_approvals')
          .select('id, approved')
          .eq('property_id', propertyId)
          .eq('buyer_id', currentUser.id)
          .maybeSingle()
        setApprovalRequested(Boolean(approval))
        setApprovalGranted(Boolean(approval?.approved))

        const query = new URLSearchParams(window.location.search)
        const sessionId = query.get('session_id')
        if (query.get('card_verification') === 'complete' && sessionId) {
          const response = await fetch(`/api/card-verification?session_id=${encodeURIComponent(sessionId)}`)
          const result = await response.json()
          if (response.ok && result.verified && result.propertyId === propertyId) {
            setCardVerified(true)
            await supabase.auth.updateUser({ data: { offer_card_verified: true } })
            window.history.replaceState({}, '', `/properties/${propertyId}`)
          }
        }
      }

      const { property, offers } = await getPropertyWithOffers(propertyId)
      setProperty(property)
      
      // PRIVACY FIX: Only show current highest offer, don't expose other bidders
      // Also don't show user details of other bidders
      if (offers && offers.length > 0) {
        // Only include the highest offer in the list shown to users
        // Other offers are hidden from view
        setOffers([offers[0]]) // Only highest
      } else {
        setOffers([])
      }
    } catch (err) {
      console.error('Error loading property:', err)
    } finally {
      setLoading(false)
    }
  }

  const highestOffer = offers?.[0]
  const userOffer = offers?.find((o: any) => o.buyer_id === user?.id)
  const currentOfferAmount = highestOffer?.amount || property?.starting_offer || 0
  const platformFee = currentOfferAmount * 0.005
  const buyerAgentCommission = currentOfferAmount * 0.025
  const estimatedTotal = currentOfferAmount + platformFee + buyerAgentCommission
  const canSubmitOffer = approvalGranted || cardVerified

  async function startCardVerification() {
    if (!user) {
      router.push(`/login?redirect=/properties/${propertyId}`)
      return
    }

    setVerificationLoading(true)
    setError('')
    try {
      const response = await fetch('/api/card-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, email: user.email }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) throw new Error(result.error || 'Unable to start card verification')
      window.location.href = result.url
    } catch (err: any) {
      setError(err.message)
      setVerificationLoading(false)
    }
  }

  async function requestListingAgentApproval() {
    if (!user) {
      router.push(`/login?redirect=/properties/${propertyId}`)
      return
    }

    setError('')
    const { error: approvalError } = await supabase.from('agent_approvals').insert({
      property_id: propertyId,
      buyer_id: user.id,
      listing_agent_id: property.listing_agent_id,
      approved: false,
    })
    if (approvalError && !approvalError.message.toLowerCase().includes('duplicate')) {
      setError(approvalError.message)
      return
    }
    setApprovalRequested(true)
  }

  async function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!user) {
        throw new Error('You must be logged in to submit an offer')
      }

      if (!offerRole) {
        throw new Error('Choose whether you are submitting as a buyer or an agent')
      }

      if (!canSubmitOffer) {
        throw new Error('Request listing-agent approval or verify a card before submitting an offer')
      }

      if (!offerAmount) {
        throw new Error('Please enter an offer amount')
      }

      const amount = parseInt(offerAmount)

      await submitOffer(propertyId, user.id, amount)

      // Reload property data
      await loadPropertyData()
      setOfferAmount('')

      alert('✅ Offer submitted! You can view it in My Offers.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Property not found</p>
          <Link href="/properties" className="text-indigo-600 hover:underline">
            Back to properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/properties" className="text-indigo-600 hover:underline text-sm font-semibold mb-4 block">
            ← Back to Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              {property.images?.[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.address}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.address}</h1>
              <p className="text-gray-600 text-lg mb-6">
                {property.city}, {property.state} {property.zip}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">BEDS</p>
                  <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">BATHS</p>
                  <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {(property.sqft / 1000).toFixed(1)}K
                  </p>
                  <p className="text-gray-600">Sq Ft</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-gray-600">
                  <strong>Starting Offer:</strong>{' '}
                  <span className="text-lg text-indigo-600 font-bold">
                    ${property.starting_offer.toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{' '}
                  <span className="text-lg font-semibold">
                    {property.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                  </span>
                </p>
              </div>

              {/* Offer Details Section */}
              {property.status === 'active' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Current offering</h3>
                  <p className="text-gray-600 mb-2">
                    <strong>Current Highest Offer:</strong>
                  </p>
                  <p className="text-3xl font-bold text-blue-700 mb-4">
                    ${highestOffer?.amount.toLocaleString() || property.starting_offer.toLocaleString()}
                  </p>

                  <div className="mb-5 space-y-2 rounded-lg border border-blue-200 bg-white p-4 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Platform fee (0.5%)</span><strong>${platformFee.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Buyer&apos;s agent commission (2.5%)</span><strong>${buyerAgentCommission.toLocaleString()}</strong></div>
                    <div className="flex justify-between border-t border-blue-100 pt-2 text-base"><strong>Estimated total</strong><strong className="text-blue-700">${estimatedTotal.toLocaleString()}</strong></div>
                  </div>

                  {userOffer && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                      <p className="text-green-800 font-semibold">✓ Your Current Offer</p>
                      <p className="text-lg font-bold text-green-600">
                        ${userOffer.amount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center mb-2">
                    ℹ️ Other bidders' names are kept private. You see only the highest offer.
                  </p>
                </div>
              )}

              {/* Property Description */}
              {property.description && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About this Property</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Offer Submission & Countdown */}
          <div className="lg:col-span-1">
            {/* Countdown Timer */}
            {property.status === 'active' && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <CountdownTimer endDate={property.offer_end_date} size="large" />
              </div>
            )}

            {/* Offer identity, verification and submission */}
            {property.status === 'active' && (
              <div className="space-y-4">
                {!user ? (
                  <div className="rounded-lg border border-blue-200 bg-white p-6 shadow">
                    <h3 className="text-xl font-bold text-gray-900">Ready to submit an offer?</h3>
                    <p className="mt-2 text-sm text-gray-600">Create a free account or sign in first.</p>
                    <Link href={`/login?redirect=/properties/${propertyId}`} className="mt-4 block rounded-lg bg-blue-600 px-4 py-3 text-center font-bold text-white hover:bg-blue-700">Sign in to continue</Link>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg bg-white p-6 shadow">
                      <h3 className="text-lg font-bold text-gray-900">Who are you submitting this offer for?</h3>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setOfferRole('buyer')} aria-pressed={offerRole === 'buyer'} className={`rounded-lg border-2 px-4 py-3 font-bold ${offerRole === 'buyer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-900'}`}>I am a buyer</button>
                        <button type="button" onClick={() => setOfferRole('agent')} aria-pressed={offerRole === 'agent'} className={`rounded-lg border-2 px-4 py-3 font-bold ${offerRole === 'agent' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-900'}`}>I am an agent</button>
                      </div>
                    </div>

                    {!canSubmitOffer && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                        <h3 className="font-bold text-gray-900">Verify before submitting</h3>
                        <p className="mt-1 text-sm text-gray-600">Choose either option. Bidding is free.</p>
                        <div className="mt-4 space-y-3">
                          <button type="button" onClick={requestListingAgentApproval} disabled={approvalRequested} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300">
                            {approvalRequested ? 'Approval request sent' : "Request listing agent's approval to offer"}
                          </button>
                          <button type="button" onClick={startCardVerification} disabled={verificationLoading} className="w-full rounded-lg border-2 border-gray-900 bg-white px-4 py-3 font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-50">
                            {verificationLoading ? 'Opening secure verification...' : 'Verify with a credit or debit card'}
                          </button>
                          <p className="text-center text-xs text-gray-500">Card verification does not purchase anything or charge a HomeOffer.pro fee.</p>
                        </div>
                      </div>
                    )}

                    {canSubmitOffer && (
                      <form onSubmit={handleSubmitOffer} className="space-y-4 rounded-lg bg-white p-6 shadow">
                        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                          {cardVerified ? 'Card verified' : 'Approved by the listing agent'}
                        </div>
                        {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Your offer ($500 increments)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600">$</span>
                            <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} step="500" min={Math.max(500, (highestOffer?.amount || property.starting_offer) + 500)} className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Minimum: ${Math.max(500, (highestOffer?.amount || property.starting_offer) + 500).toLocaleString()}</p>
                        </div>
                        <button type="submit" disabled={submitting || !offerRole} className="w-full rounded-lg bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50">
                          {submitting ? 'Submitting...' : 'Submit offer'}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {property.status !== 'active' && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 font-semibold">⚫ offering Closed</p>
                <p className="text-sm text-gray-500 mt-2">Check your offers in My Offers</p>
                <Link
                  href="/buyer/offers"
                  className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  View My Offers
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

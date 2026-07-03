'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CounterOfferPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [topOffers, setTopOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [counterAmount, setCounterAmount] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get property
      const { data: prop } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (!prop || prop.listing_agent_id !== currentUser.id) {
        router.push('/agent/dashboard')
        return
      }

      setProperty(prop)

      // Get top 10 offers
      const { data: offers } = await supabase
        .from('offers')
        .select(`
          *,
          users:buyer_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('property_id', propertyId)
        .order('amount', { ascending: false })
        .limit(10)

      setTopOffers(offers || [])
    } catch (err) {
      console.error('Error:', err)
      router.push('/agent/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendCounterOffer() {
    if (!selectedOffer || !counterAmount) return

    setSending(true)
    try {
      // In real implementation, create counter_offer record
      // For now, send notification via SMS/email placeholder
      
      console.log('[COUNTER OFFER PLACEHOLDER]')
      console.log('To:', selectedOffer.users.email)
      console.log('Counter Amount:', counterAmount)
      console.log('Message:', counterMessage)

      alert(
        `Counter offer of $${parseInt(counterAmount).toLocaleString()} sent to ${selectedOffer.users.first_name}!`
      )

      setCounterAmount('')
      setCounterMessage('')
      setSelectedOffer(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Property not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Send Counter Offer</h1>
              <p className="text-gray-600 mt-1">{property.address}</p>
            </div>
            <Link
              href={`/agent/property/${propertyId}/offerors`}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Offers List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Offeror</h2>

            <div className="space-y-3">
              {topOffers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">No offers yet</p>
                </div>
              ) : (
                topOffers.map((offer, idx) => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    className={`w-full text-left p-6 rounded-lg border-2 transition ${
                      selectedOffer?.id === offer.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {offer.users.first_name} {offer.users.last_name}
                          </h3>
                          {idx === 0 && (
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                              HIGHEST
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{offer.users.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-indigo-600">
                          ${offer.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rank #{idx + 1}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Counter Offer Form */}
          <div className="lg:col-span-1">
            {selectedOffer ? (
              <div className="sticky top-4 bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Counter Offer
                  </h3>
                  <p className="text-gray-600 text-sm">
                    To: {selectedOffer.users.first_name} {selectedOffer.users.last_name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Current Offer: ${selectedOffer.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Counter Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-600">$</span>
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      step="1000"
                      min={selectedOffer.amount + 1000}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Min: ${(selectedOffer.amount + 1000).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    placeholder="e.g., 'Can you meet at this price?'"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSendCounterOffer}
                    disabled={sending || !counterAmount}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
                  >
                    {sending ? 'Sending...' : 'Send Counter Offer'}
                  </button>

                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-3 rounded-lg font-semibold transition"
                  >
                    Clear
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
                  <p>
                    <strong>Note:</strong> Counter offer will be sent to buyer via email and SMS (if opted in).
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                <p>Select an offeror to send a counter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

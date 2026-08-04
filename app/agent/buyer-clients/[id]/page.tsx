'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'
import BackButton from '@/components/BackButton'

export default function BuyerClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [contactMode, setContactMode] = useState<'email' | 'sms' | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadClientData()
  }, [clientId])

  async function loadClientData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Get all offers from this buyer
      const { data: allOffers, error } = await supabase
        .from('offers')
        .select(`
          *,
          users:buyer_id (
            id,
            first_name,
            last_name,
            email,
            phone_number,
            sms_opt_in
          ),
          properties:property_id (
            id,
            address,
            city,
            state,
            starting_offer,
            offer_end_date,
            status
          )
        `)
        .eq('buyer_id', clientId)
        .eq('buyer_agent_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!allOffers || allOffers.length === 0) {
        router.push('/agent/buyer-clients')
        return
      }

      // Set client info from first offer
      const firstOffer = allOffers[0]
      setClient(firstOffer.users)

      // Enrich offers with status
      const enrichedOffers = allOffers.map((offer) => {
        const endDate = new Date(offer.properties.offer_end_date)
        const now = new Date()
        const isActive = endDate > now && offer.properties.status === 'active'

        return {
          ...offer,
          isActive,
          daysLeft: isActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        }
      })

      setOffers(enrichedOffers)
    } catch (err) {
      console.error('Error:', err)
      router.push('/agent/buyer-clients')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!messageText) return

    setSending(true)
    try {
      if (contactMode === 'sms') {
        console.log(`[SMS PLACEHOLDER] To: ${client.phone_number}`)
        console.log(`[SMS PLACEHOLDER] Message: ${messageText}`)
        alert('SMS sent!')
      } else if (contactMode === 'email') {
        console.log(`[EMAIL PLACEHOLDER] To: ${client.email}`)
        console.log(`[EMAIL PLACEHOLDER] Message: ${messageText}`)
        alert('Email sent!')
      }

      setMessageText('')
      setContactMode(null)
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

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Client not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {client.first_name} {client.last_name}
              </h1>
              <p className="text-gray-600 mt-1">Buyer Client Profile</p>
            </div>
            <BackButton href="/agent/buyer-clients">Buyer clients</BackButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Client Info & Contact */}
          <div className="lg:col-span-1">
            {/* Client Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Email</p>
                  <a href={`mailto:${client.email}`} className="text-indigo-600 hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone_number && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Phone</p>
                    <a href={`tel:${client.phone_number}`} className="text-indigo-600 hover:underline">
                      {client.phone_number}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 font-semibold">SMS Notifications</p>
                  <p className="text-gray-900 font-semibold">
                    {client.sms_opt_in ? '✅ Enabled' : '⚫ Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Offers</span>
                  <span className="font-bold text-gray-900">{offers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Offers</span>
                  <span className="font-bold text-green-600">
                    {offers.filter((o) => o.isActive).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Offer</span>
                  <span className="font-bold text-indigo-600">
                    ${Math.max(...offers.map((o) => o.amount)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total offer Value</span>
                  <span className="font-bold text-purple-600">
                    ${offers.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message</h2>

              {!contactMode ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setContactMode('email')}
                    className="w-full p-3 rounded-lg border-2 border-gray-300 hover:border-indigo-600 font-semibold text-gray-700 hover:text-indigo-600 transition"
                  >
                    📧 Send Email
                  </button>
                  {client.phone_number && client.sms_opt_in ? (
                    <button
                      onClick={() => setContactMode('sms')}
                      className="w-full p-3 rounded-lg border-2 border-gray-300 hover:border-indigo-600 font-semibold text-gray-700 hover:text-indigo-600 transition"
                    >
                      📱 Send SMS
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full p-3 rounded-lg border-2 border-gray-300 font-semibold text-gray-400 cursor-not-allowed"
                    >
                      📱 SMS (Not opted in)
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={6}
                    placeholder="Type your message..."
                  />
                  {contactMode === 'sms' && (
                    <p className="text-xs text-gray-500 mb-3">
                      {messageText.length} / 160 characters
                    </p>
                  )}
                  <div className="space-y-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
                    >
                      {sending ? 'Sending...' : `Send ${contactMode === 'sms' ? 'SMS' : 'Email'}`}
                    </button>
                    <button
                      onClick={() => {
                        setContactMode(null)
                        setMessageText('')
                      }}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-3 rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: All Offers */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Offers ({offers.length})
            </h2>

            <div className="space-y-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
                    <h3 className="text-lg font-bold">{offer.properties.address}</h3>
                    <p className="text-indigo-100">
                      {offer.properties.city}, {offer.properties.state}
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Offer Amount & Countdown */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-3xl font-bold text-indigo-600">
                          ${offer.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Submitted {new Date(offer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {offer.isActive && (
                        <div className="text-right">
                          <CountdownTimer endDate={offer.properties.offer_end_date} size="small" />
                        </div>
                      )}
                    </div>

                    {/* Status Grid */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Status</p>
                        <p className="text-sm font-bold">
                          {offer.isActive ? '🟢 Active' : '⚫ Closed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Starting</p>
                        <p className="text-sm font-bold">
                          ${offer.properties.starting_offer.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Time Left</p>
                        <p className="text-sm font-bold">
                          {offer.isActive ? `${offer.daysLeft}d` : 'Closed'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <Link
                      href={`/properties/${offer.properties.id}`}
                      className="block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

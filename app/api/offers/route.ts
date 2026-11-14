import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server-auth'
import { getSupabaseUserClient } from '@/lib/supabase-admin'

const FROM = 'HomeOffer.pro <notifications@homeoffer.pro>'
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

async function sendEmail(to: string, subject: string, html: string, idempotencyKey: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('Offer email not sent: RESEND_API_KEY is not configured')
    return false
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
      cache: 'no-store',
    })
    if (!response.ok) console.error('Resend offer notification failed', response.status, await response.text())
    return response.ok
  } catch (error) {
    console.error('Resend offer notification request failed', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  let input: { propertyId?: unknown; maximumAmount?: unknown }
  try { input = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const propertyId = input.propertyId
  const maximumAmount = input.maximumAmount
  if (typeof propertyId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(propertyId) ||
    typeof maximumAmount !== 'number' || !Number.isSafeInteger(maximumAmount) || maximumAmount <= 0 || maximumAmount % 500 !== 0) {
    return NextResponse.json({ error: 'A valid property and maximum in $500 increments are required' }, { status: 400 })
  }

  // Execute the existing database RPC with the user's JWT. This retains the
  // listing-agent approval, bid increment, closing date and private-limit checks.
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  const buyer = getSupabaseUserClient(token)
  const { data, error } = await buyer.rpc('place_max_offer', {
    p_property_id: propertyId, p_maximum_amount: maximumAmount,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const result = data?.[0]
  if (!result) return NextResponse.json({ error: 'Offer could not be confirmed' }, { status: 500 })

  const { data: property } = await auth.admin.from('properties')
    .select('address, city, state, listing_agent_id').eq('id', propertyId).maybeSingle()
  if (property) {
    const address = [property.address, property.city, property.state].filter(Boolean).join(', ')
    const escapedAddress = escapeHtml(address)
    const url = `https://homeoffer.pro/properties/${propertyId}`
    const publicAmount = money(Number(result.current_amount))
    // Never send another bidder's private maximum or a buyer's private maximum to agents.
    const { data: agent } = property.listing_agent_id
      ? await auth.admin.from('users').select('email').eq('id', property.listing_agent_id).maybeSingle()
      : { data: null }
    // The private maximum rises on this successful submission. Use it only in the
    // idempotency key so repeated requests do not send duplicate mail.
    const eventId = `${propertyId}-${auth.user.id}-${maximumAmount}`
    const emails: Promise<boolean>[] = []
    if (agent?.email) emails.push(sendEmail(
      agent.email, `Offer update: ${address}`,
      `<h2>New bidding activity</h2><p>An approved bidder updated an offer for <strong>${escapedAddress}</strong>.</p><p>Current public offer: <strong>${publicAmount}</strong>.</p><p><a href="${url}">View the property</a></p><p>Private maximum bids are not disclosed.</p>`,
      `agent-bid-${eventId}`,
    ))
    if (auth.user.email) emails.push(sendEmail(
      auth.user.email, `Your HomeOffer.pro offer was submitted: ${address}`,
      `<h2>Offer received</h2><p>Your maximum offer was saved for <strong>${escapedAddress}</strong>.</p><p>Current public offer: <strong>${publicAmount}</strong>.</p><p>${result.is_leading ? 'You currently lead.' : 'Another bidder currently leads.'}</p><p><a href="${url}">View your offer status</a></p>`,
      `bidder-bid-${eventId}`,
    ))
    await Promise.allSettled(emails)
  }

  // Successful bidding is not rolled back if notification delivery fails.
  return NextResponse.json({ success: true, offer: result })
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireUser } from '@/lib/server-auth'

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe is not configured')
  return new Stripe(key)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { propertyId } = await request.json()
    if (!propertyId) return NextResponse.json({ error: 'Property is required' }, { status: 400 })
    const origin = request.nextUrl.hostname === 'localhost' ? request.nextUrl.origin : 'https://homeoffer.pro'
    const session = await stripe().checkout.sessions.create({
      mode: 'setup', customer_email: auth.authUser.email || undefined, payment_method_types: ['card'],
      success_url: `${origin}/properties/${propertyId}?card_verification=complete&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/properties/${propertyId}?card_verification=cancelled`,
      metadata: { property_id: propertyId, user_id: auth.user.id },
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start card verification' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const id = request.nextUrl.searchParams.get('session_id')
    if (!id) return NextResponse.json({ verified: false }, { status: 400 })
    const session = await stripe().checkout.sessions.retrieve(id)
    if (session.metadata?.user_id !== auth.user.id) return NextResponse.json({ error: 'Verification does not belong to this account' }, { status: 403 })
    const verified = session.status === 'complete' && Boolean(session.setup_intent)
    const propertyId = session.metadata?.property_id || null
    if (verified && propertyId) {
      await auth.admin.from('card_verifications').upsert({
        user_id: auth.user.id, property_id: propertyId, stripe_session_id: session.id,
        stripe_setup_intent_id: String(session.setup_intent), verified_at: new Date().toISOString(),
      }, { onConflict: 'user_id,property_id' })
      const { data: property } = await auth.admin.from('properties').select('listing_agent_id').eq('id', propertyId).single()
      if (property) await auth.admin.from('agent_approvals').upsert({
        property_id: propertyId, buyer_id: auth.user.id, listing_agent_id: property.listing_agent_id,
        approved: true, approved_at: new Date().toISOString(),
      }, { onConflict: 'property_id,buyer_id' })
    }
    return NextResponse.json({ verified, propertyId })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to confirm card verification' }, { status: 500 })
  }
}

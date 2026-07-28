import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Stripe is not configured')
  return new Stripe(secretKey)
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, email } = await request.json()
    if (!propertyId) {
      return NextResponse.json({ error: 'Property is required' }, { status: 400 })
    }

    const origin = request.nextUrl.origin
    const session = await getStripe().checkout.sessions.create({
      mode: 'setup',
      customer_email: email || undefined,
      payment_method_types: ['card'],
      success_url: `${origin}/properties/${propertyId}?card_verification=complete&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/properties/${propertyId}?card_verification=cancelled`,
      metadata: { property_id: propertyId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to start card verification' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ verified: false }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const verified = session.status === 'complete' && Boolean(session.setup_intent)

    return NextResponse.json({
      verified,
      propertyId: session.metadata?.property_id || null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to confirm card verification' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// One-time delivery diagnostic for the previously saved Poppy Circle approval.
// This route has a fixed recipient and a fixed Resend idempotency key.
// Remove the route immediately after verifying the provider response.
export async function GET() {
  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ accepted: false, reason: 'Resend key missing' }, { status: 503 })
  try {
    const approvalId = '40eeb787-0a0c-43b8-a510-9166c3c9f910'
    const base = 'https://homeoffer.pro/approvals/review?id=' + encodeURIComponent(approvalId)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'poppy-approval-notification-20261114-40eeb787',
      },
      body: JSON.stringify({
        from: 'HomeOffer.pro <approvalrequest@homeoffer.pro>',
        to: ['noland.macfarlane@gmail.com'],
        subject: 'Bidding approval requested for 1642 Poppy Circle',
        html: '<h2>Bidding approval requested</h2><p>A buyer requested approval to bid on <strong>1642 Poppy Circle</strong>.</p><p><a href="' + base + '&decision=approve">Approve</a> &nbsp; <a href="' + base + '&decision=decline">Decline</a></p><p>Sign in as the listing agent to confirm your decision.</p><p>— HomeOffer.pro</p>',
      }),
      cache: 'no-store',
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) console.error('One-time Poppy notice failed', response.status, body)
    return NextResponse.json({ accepted: response.ok, status: response.status, providerId: body.id ?? null, error: response.ok ? null : body }, { status: response.ok ? 200 : 502 })
  } catch (error) {
    console.error('One-time Poppy notice exception', error)
    return NextResponse.json({ accepted: false, error: 'Resend request failed' }, { status: 502 })
  }
}

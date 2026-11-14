import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const propertyId = request.nextUrl.searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'Property is required' }, { status: 400 })
  if (request.nextUrl.searchParams.get('scope') === 'agent') {
    if (auth.user.user_type !== 'agent') return NextResponse.json({ error: 'Agent access required' }, { status: 403 })
    const { data: listing } = await auth.admin.from('properties').select('id').eq('id', propertyId).eq('listing_agent_id', auth.user.id).maybeSingle()
    if (!listing) return NextResponse.json({ error: 'Not your listing' }, { status: 403 })
    const { data: approvals, error: approvalError } = await auth.admin.from('agent_approvals')
      .select('id, buyer_id, status, approved, created_at, approved_at')
      .eq('property_id', propertyId).eq('listing_agent_id', auth.user.id)
      .order('created_at', { ascending: false })
    if (approvalError) return NextResponse.json({ error: 'Unable to load buyer approvals' }, { status: 500 })
    const ids = [...new Set((approvals || []).map(row => row.buyer_id))]
    const { data: buyers, error: buyerError } = ids.length
      ? await auth.admin.from('users').select('id, first_name, last_name, email, user_type').in('id', ids)
      : { data: [], error: null }
    if (buyerError) return NextResponse.json({ error: 'Unable to load buyer contacts' }, { status: 500 })
    const profiles = new Map((buyers || []).map(buyer => [buyer.id, buyer]))
    return NextResponse.json({ approvals: (approvals || []).map(row => ({
      ...row, buyer: profiles.get(row.buyer_id) || null,
    })) }, { headers: { 'Cache-Control': 'no-store' } })
  }
  const { data, error } = await auth.admin.from('agent_approvals').select('id, approved, approved_at, status').eq('property_id', propertyId).eq('buyer_id', auth.user.id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load approval status' }, { status: 500 })
  return NextResponse.json({ approval: data })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const body = await request.json()

    if (body.propertyId && body.approved === undefined) {
      const { data: property, error: propertyError } = await auth.admin.from('properties').select('id, address, listing_agent_id').eq('id', body.propertyId).single()
      if (propertyError || !property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      const { data: existing } = await auth.admin.from('agent_approvals')
        .select('id, approved, status')
        .eq('property_id', property.id)
        .eq('buyer_id', auth.user.id)
        .maybeSingle()
      if (existing) return NextResponse.json({ success: true, approval: existing, alreadyExists: true, notificationSent: false, message: 'You have already requested approval for this property.' })
      const { data, error } = await auth.admin.from('agent_approvals').insert({
        property_id: property.id, buyer_id: auth.user.id, listing_agent_id: property.listing_agent_id,
        approved: false, approved_at: null, status: 'pending',
      }).select('id, approved, status').single()
      if (error?.code === '23505') return NextResponse.json({ success: true, alreadyExists: true, notificationSent: false, message: 'You have already requested approval for this property.' })
      if (error || !data) return NextResponse.json({ error: 'Unable to save approval request' }, { status: 500 })
      let notificationSent = false
      let notificationError: string | null = null
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        const { data: agent } = await auth.admin.from('users').select('email, first_name').eq('id', property.listing_agent_id).single()
        const buyerName = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ')
        if (agent?.email) {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `approval-${data.id}-${Math.floor(Date.now() / 3600000)}` },
            body: JSON.stringify({
              from: 'HomeOffer.pro <approvalrequest@homeoffer.pro>',
              to: [agent.email],
              subject: `Bidding approval requested for ${property.address}`,
              html: `<h2>Bidding approval requested</h2><p>${buyerName || 'A buyer'} requested approval to bid on <strong>${property.address}</strong>.</p><p style="margin:24px 0"><a href="https://homeoffer.pro/approvals/review?id=${encodeURIComponent(data.id)}&decision=approve" style="display:inline-block;background:#166534;color:white;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px">Approve</a><a href="https://homeoffer.pro/approvals/review?id=${encodeURIComponent(data.id)}&decision=decline" style="display:inline-block;background:#b91c1c;color:white;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Decline</a></p><p>Sign in as the listing agent to confirm your decision.</p><p>— HomeOffer.pro</p>`,
            }),
          })
          notificationSent = emailResponse.ok
          if (!emailResponse.ok) {
            const details = await emailResponse.text()
            console.error('Resend approval email failed', { status: emailResponse.status, details })
            notificationError = 'Email provider rejected the notification'
          }
        } else {
          notificationError = 'Listing agent email is missing'
        }
      } else {
        notificationError = 'Email service is not configured'
      }
      return NextResponse.json({ success: true, approval: data, alreadyExists: Boolean(existing), notificationSent, notificationError })
    }

    if (!body.approvalId || typeof body.approved !== 'boolean') return NextResponse.json({ error: 'Missing approval request or status' }, { status: 400 })
    if (auth.user.user_type !== 'agent') return NextResponse.json({ error: 'Agent access required' }, { status: 403 })
    const { data: approval } = await auth.admin.from('agent_approvals').select('id, listing_agent_id').eq('id', body.approvalId).single()
    if (!approval || approval.listing_agent_id !== auth.user.id) return NextResponse.json({ error: 'You cannot manage this approval request' }, { status: 403 })
    const { data, error } = await auth.admin.from('agent_approvals').update({
      approved: body.approved,
      approved_at: body.approved ? new Date().toISOString() : null,
      status: body.approved ? 'approved' : 'denied',
    }).eq('id', body.approvalId).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

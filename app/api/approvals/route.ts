import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = await requireUser(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const propertyId = request.nextUrl.searchParams.get('propertyId')
  if (!propertyId) return NextResponse.json({ error: 'Property is required' }, { status: 400 })
  const { data, error } = await auth.admin.from('agent_approvals').select('id, approved, approved_at').eq('property_id', propertyId).eq('buyer_id', auth.user.id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load approval status' }, { status: 500 })
  return NextResponse.json({ approval: data })
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const body = await request.json()

    if (body.propertyId && body.approved === undefined) {
      const { data: property, error: propertyError } = await auth.admin.from('properties').select('id, listing_agent_id').eq('id', body.propertyId).single()
      if (propertyError || !property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      const { data, error } = await auth.admin.from('agent_approvals').upsert({
        property_id: property.id, buyer_id: auth.user.id, listing_agent_id: property.listing_agent_id,
        approved: false, approved_at: null,
      }, { onConflict: 'property_id,buyer_id' }).select('id, approved').single()
      if (error) return NextResponse.json({ error: 'Unable to send approval request' }, { status: 500 })
      return NextResponse.json({ success: true, approval: data })
    }

    if (!body.approvalId || typeof body.approved !== 'boolean') return NextResponse.json({ error: 'Missing approval request or status' }, { status: 400 })
    if (auth.user.user_type !== 'agent') return NextResponse.json({ error: 'Agent access required' }, { status: 403 })
    const { data: approval } = await auth.admin.from('agent_approvals').select('id, listing_agent_id').eq('id', body.approvalId).single()
    if (!approval || approval.listing_agent_id !== auth.user.id) return NextResponse.json({ error: 'You cannot manage this approval request' }, { status: 403 })
    const { data, error } = await auth.admin.from('agent_approvals').update({ approved: body.approved, approved_at: body.approved ? new Date().toISOString() : null }).eq('id', body.approvalId).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

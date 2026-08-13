import { NextRequest, NextResponse } from 'next/server'
import { requireAgent } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAgent(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await auth.admin
    .from('listing_drafts')
    .select('payload, updated_at')
    .eq('agent_id', auth.user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draft: data?.payload || null, updatedAt: data?.updated_at || null })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAgent(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'A valid listing draft is required' }, { status: 400 })
  }

  const { error } = await auth.admin.from('listing_drafts').upsert({
    agent_id: auth.user.id,
    payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'agent_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ saved: true })
}

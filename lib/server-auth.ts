import { getSupabaseAdmin } from './supabase-admin'

export async function requireUser(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return { error: 'Authentication required', status: 401 } as const
  }

  const admin = getSupabaseAdmin()
  const { data: authData, error: authError } = await admin.auth.getUser(token)

  if (authError || !authData.user) {
    return { error: 'Invalid or expired session', status: 401 } as const
  }

  let { data: profile } = await admin
    .from('users')
    .select('id, email, first_name, last_name, user_type')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (!profile) {
    const metadata = authData.user.user_metadata || {}
    const fullName = metadata.full_name || metadata.name || authData.user.email?.split('@')[0] || 'User'
    const [firstName, ...lastName] = String(fullName).trim().split(/\s+/)
    const { data: created, error } = await admin.from('users').upsert({
      id: authData.user.id,
      email: authData.user.email,
      first_name: metadata.first_name || firstName || 'User',
      last_name: metadata.last_name || lastName.join(' '),
      user_type: metadata.user_type || 'buyer',
    }, { onConflict: 'id' }).select('id, email, first_name, last_name, user_type').single()
    if (error || !created) return { error: 'Unable to initialize user profile', status: 500 } as const
    profile = created
  }

  return { user: profile, authUser: authData.user, admin } as const
}

export async function requireAgent(request: Request) {
  const auth = await requireUser(request)
  if ('error' in auth) return auth

  if (auth.user.user_type !== 'agent') {
    return { error: 'Agent access required', status: 403 } as const
  }

  return auth
}

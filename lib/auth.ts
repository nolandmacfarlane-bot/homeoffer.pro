import { supabase } from './supabase'

export async function signUp(email: string, password: string, userData: {
  first_name: string
  last_name: string
  user_type: 'buyer' | 'seller' | 'agent'
  phone_number?: string
  dre_license_number?: string
  broker_name?: string
  broker_dre_number?: string
  sms_opt_in?: boolean
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user?.id,
      email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      user_type: userData.user_type,
      sms_opt_in: userData.sms_opt_in ?? false,
    })

  if (profileError) throw profileError

  if (userData.user_type === 'agent') {
    const agentDetails = {
      phone_number: userData.phone_number || '',
      dre_license_number: userData.dre_license_number || '',
      broker_name: userData.broker_name || '',
      broker_dre_number: userData.broker_dre_number || '',
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: agentDetails,
    })
    if (metadataError) throw metadataError

    const { error: agentProfileError } = await supabase
      .from('users')
      .update(agentDetails)
      .eq('id', data.user?.id)

    const missingAgentColumn =
      agentProfileError?.message?.includes('schema cache') &&
      ['phone_number', 'dre_license_number', 'broker_name', 'broker_dre_number'].some(
        (field) => agentProfileError.message.includes(field)
      )

    if (agentProfileError && !missingAgentColumn) throw agentProfileError
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signInWithOAuth(provider: 'google' | 'facebook') {
  try {
    // Cast provider to any to avoid TypeScript issues with facebook provider
    const providerType = provider === 'facebook' ? ('facebook' as any) : ('google' as any)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: providerType,
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(`OAuth error: ${error.message}`)
    }

    // Supabase handles the redirect
    return data
  } catch (err: any) {
    console.error(`Sign in with ${provider} failed:`, err.message)
    throw err
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  // The browser session is persisted by Supabase. Read it first so a temporary
  // network/profile error never turns a valid login into a redirect loop.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const sessionUser = sessionData.session?.user
  if (!sessionUser) return null

  // Refresh/verify when possible, but keep the valid persisted session as a
  // fallback if Supabase's user endpoint is briefly unavailable.
  const { data: verifiedData } = await supabase.auth.getUser()
  const authUser = verifiedData.user || sessionUser

  // Profile data is optional for authentication. RLS, schema, or connectivity
  // problems here must not make the app claim the user has been signed out.
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (userProfile) {
    return {
      ...authUser,
      ...userProfile,
      user_metadata: authUser.user_metadata,
    }
  }

  return {
    ...authUser,
    first_name:
      authUser.user_metadata?.first_name ||
      authUser.user_metadata?.full_name?.split(' ')[0] ||
      authUser.email?.split('@')[0] ||
      'User',
    last_name: authUser.user_metadata?.last_name || '',
    user_type: authUser.user_metadata?.user_type || 'buyer',
  }
}

export async function requestBuyerApproval(
  buyerId: string,
  propertyId: string,
  listingAgentId: string
) {
  const { data, error } = await supabase
    .from('agent_approvals')
    .insert({
      buyer_id: buyerId,
      property_id: propertyId,
      listing_agent_id: listingAgentId,
      approved: false,
    })

  if (error) throw error
  return data
}

export async function approveBuyer(approvalId: string) {
  const { data, error } = await supabase
    .from('agent_approvals')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
    })
    .eq('id', approvalId)

  if (error) throw error
  return data
}

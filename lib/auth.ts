import { supabase } from './supabase'

export async function signUp(email: string, password: string, userData: {
  first_name: string
  last_name: string
  user_type: 'buyer' | 'seller' | 'agent'
  agent_license?: string
  agent_state?: string
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
      agent_license: userData.agent_license,
      agent_state: userData.agent_state,
      sms_opt_in: userData.sms_opt_in ?? false,
      approved: userData.user_type === 'agent',
    })

  if (profileError) throw profileError

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
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  
  if (!data.user) return null
  
  // Get full user profile from users table
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  return userProfile || data.user
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

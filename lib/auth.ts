import { supabase } from './supabase'

export async function signUp(email: string, password: string, userData: {
  first_name: string
  last_name: string
  user_type: 'buyer' | 'seller' | 'agent'
  agent_license?: string
  agent_state?: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user?.id,
      email,
      ...userData,
      approved: userData.user_type === 'agent', // Agents auto-approved
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

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Request listing agent approval for buyer
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

// Listing agent approves buyer
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

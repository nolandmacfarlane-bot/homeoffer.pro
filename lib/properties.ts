import { supabase } from './supabase'

export async function createProperty(data: {
  address: string
  city: string
  state: string
  zip: string
  bedrooms: number
  bathrooms: number
  sqft: number
  images: string[]
  starting_offer: number
  listing_agent_id: string
  offer_period_days?: number
}) {
  const offerPeriodDays = data.offer_period_days || 13
  const offerEndDate = new Date()
  offerEndDate.setDate(offerEndDate.getDate() + offerPeriodDays)

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft,
      images: data.images,
      starting_offer: data.starting_offer,
      listing_agent_id: data.listing_agent_id,
      offer_period_days: offerPeriodDays,
      offer_end_date: offerEndDate.toISOString(),
      status: 'active',
    })
    .select()

  if (error) throw error
  return property?.[0]
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getActiveProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPropertiesByAgent(agentId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('listing_agent_id', agentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updatePropertyStatus(propertyId: string, status: 'active' | 'closed' | 'sold') {
  const { data, error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', propertyId)

  if (error) throw error
  return data
}

// Check and close expired properties
export async function checkAndCloseExpiredProperties() {
  const now = new Date().toISOString()

  const { data: expiredProperties, error: fetchError } = await supabase
    .from('properties')
    .select('id')
    .eq('status', 'active')
    .lte('offer_end_date', now)

  if (fetchError) throw fetchError

  if (expiredProperties && expiredProperties.length > 0) {
    const { error: updateError } = await supabase
      .from('properties')
      .update({ status: 'closed' })
      .in('id', expiredProperties.map(p => p.id))

    if (updateError) throw updateError
  }

  return expiredProperties?.length || 0
}

export async function getPropertyWithOffers(propertyId: string) {
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (propertyError) throw propertyError

  const { data: offers, error: offersError } = await supabase
    .from('offers')
    .select(`
      *,
      users:buyer_id (first_name, last_name, email)
    `)
    .eq('property_id', propertyId)
    .order('amount', { ascending: false })

  if (offersError) throw offersError

  return {
    property,
    offers,
    highest_offer: offers?.[0] || null,
  }
}

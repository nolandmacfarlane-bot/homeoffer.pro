import { supabase } from './supabase'

// Submit an offer on a property
export async function submitOffer(
  propertyId: string,
  buyerId: string,
  amount: number
) {
  // Validate offer is a $500 increment
  if (amount % 500 !== 0) {
    throw new Error('Offers must be in $500 increments')
  }

  // Check if buyer is approved for this property
  const { data: approval, error: approvalError } = await supabase
    .from('agent_approvals')
    .select('*')
    .eq('property_id', propertyId)
    .eq('buyer_id', buyerId)
    .eq('approved', true)
    .single()

  if (approvalError || !approval) {
    throw new Error('Buyer not approved for this property')
  }

  // Get current highest offer
  const { data: highestOffer } = await supabase
    .from('offers')
    .select('amount')
    .eq('property_id', propertyId)
    .order('amount', { ascending: false })
    .limit(1)
    .single()

  // Validate new offer is higher
  if (highestOffer && amount <= highestOffer.amount) {
    throw new Error(`Offer must be higher than current highest: $${highestOffer.amount}`)
  }

  // Get property to check starting offer
  const { data: property } = await supabase
    .from('properties')
    .select('starting_offer')
    .eq('id', propertyId)
    .single()

  if (!property || amount < property.starting_offer) {
    throw new Error(`Offer must be at least starting price: $${property?.starting_offer}`)
  }

  // Mark previous highest offer as not highest
  if (highestOffer) {
    await supabase
      .from('offers')
      .update({ is_highest: false })
      .eq('property_id', propertyId)
      .eq('is_highest', true)
  }

  // Submit new offer
  const { data, error } = await supabase
    .from('offers')
    .insert({
      property_id: propertyId,
      buyer_id: buyerId,
      amount,
      is_highest: true,
    })

  if (error) throw error

  // Extend offer period if within last 15 minutes
  await extendOfferPeriodIfNeeded(propertyId)

  return data
}

// Check if offer period should be extended (within last 15 mins)
export async function extendOfferPeriodIfNeeded(propertyId: string) {
  const { data: property } = await supabase
    .from('properties')
    .select('offer_end_date')
    .eq('id', propertyId)
    .single()

  if (!property) return

  const now = new Date()
  const endDate = new Date(property.offer_end_date)
  const minutesRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60)

  // If within last 15 minutes, extend by 15 more minutes
  if (minutesRemaining > 0 && minutesRemaining <= 15) {
    const newEndDate = new Date(now.getTime() + 15 * 60 * 1000)

    await supabase
      .from('properties')
      .update({
        offer_end_date: newEndDate.toISOString(),
      })
      .eq('id', propertyId)

    return { extended: true, newEndDate }
  }

  return { extended: false }
}

// Get all offers for a property
export async function getOffersForProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      users:buyer_id (first_name, last_name, email)
    `)
    .eq('property_id', propertyId)
    .order('amount', { ascending: false })

  if (error) throw error
  return data
}

// Get highest offer for a property
export async function getHighestOffer(propertyId: string) {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_highest', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  return data || null
}

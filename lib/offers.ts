import { supabase } from './supabase'

export type PublicBidEvent = {
  sequence_number: number
  amount: number
  masked_bidder: string
  created_at: string
}

export type OfferSummary = { current_amount: number; bid_count: number }
export type MyOfferStatus = { maximum_amount: number; current_amount: number; is_leading: boolean }
export type ListingAgentBidder = {
  bidder_id: string
  full_name: string
  email: string
  phone_number: string | null
  user_type: string
  maximum_amount: number
  visible_amount: number
  is_leading: boolean
  bid_steps: number
  last_bid_at: string
}
export type ListingAgentBidEvent = PublicBidEvent & {
  bidder_id: string
  full_name: string
  email: string
  phone_number: string | null
  maximum_amount: number
}

export async function submitMaximumOffer(propertyId: string, maximumAmount: number) {
  if (!Number.isSafeInteger(maximumAmount) || maximumAmount <= 0 || maximumAmount % 500 !== 0) {
    throw new Error('Your maximum must be entered in exact $500 increments.')
  }
  const { data, error } = await supabase.rpc('place_max_offer', {
    p_property_id: propertyId,
    p_maximum_amount: maximumAmount,
  })
  if (error) throw error
  return data?.[0]
}

export async function submitOffer(propertyId: string, _buyerId: string, amount: number) {
  return submitMaximumOffer(propertyId, amount)
}

export async function getPublicOfferHistory(propertyId: string): Promise<PublicBidEvent[]> {
  const { data, error } = await supabase.rpc('get_public_offer_history', { p_property_id: propertyId })
  if (error) throw error
  return (data || []) as PublicBidEvent[]
}

export async function getPublicOfferSummary(propertyId: string): Promise<OfferSummary | null> {
  const { data, error } = await supabase.rpc('get_public_offer_summary', { p_property_id: propertyId })
  if (error) throw error
  return (data?.[0] as OfferSummary) || null
}

export async function getMyOfferStatus(propertyId: string): Promise<MyOfferStatus | null> {
  const { data, error } = await supabase.rpc('get_my_offer_status', { p_property_id: propertyId })
  if (error) throw error
  return (data?.[0] as MyOfferStatus) || null
}

export async function getListingAgentBidderDetails(propertyId: string): Promise<ListingAgentBidder[]> {
  const { data, error } = await supabase.rpc('get_listing_agent_bidder_details', { p_property_id: propertyId })
  if (error) throw error
  return (data || []) as ListingAgentBidder[]
}

export async function getListingAgentBidHistory(propertyId: string): Promise<ListingAgentBidEvent[]> {
  const { data, error } = await supabase.rpc('get_listing_agent_bid_history', { p_property_id: propertyId })
  if (error) throw error
  return (data || []) as ListingAgentBidEvent[]
}

export const getOffersForProperty = getPublicOfferHistory

export async function getHighestOffer(propertyId: string) {
  const summary = await getPublicOfferSummary(propertyId)
  return summary ? { amount: summary.current_amount, is_highest: true } : null
}

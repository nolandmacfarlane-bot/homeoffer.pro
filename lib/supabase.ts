import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Property {
  id: string
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
  created_at: string
  offer_period_days: number
  offer_end_date: string
  status: 'active' | 'closed' | 'sold'
}

export interface Offer {
  id: string
  property_id: string
  buyer_id: string
  amount: number
  created_at: string
  is_highest: boolean
}

export interface User {
  id: string
  email: string
  user_type: 'buyer' | 'seller' | 'agent'
  first_name: string
  last_name: string
  agent_license?: string
  agent_state?: string
  approved: boolean
  created_at: string
}

export interface AgentApproval {
  id: string
  property_id: string
  buyer_id: string
  listing_agent_id: string
  approved: boolean
  approved_at?: string
  created_at: string
}

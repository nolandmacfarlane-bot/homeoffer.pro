'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateListingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    beds: '',
    baths: '',
    sqft: '',
    starting_offer: '',
    description: '',
    mls_link: '',
    zillow_link: '',
    redfin_link: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (currentUser.user_type !== 'agent' && currentUser.user_type !== 'seller') {
      router.push('/buyer')
      return
    }

    setUser(currentUser)
    setLoading(false)
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (!formData.address || !formData.city || !formData.state) {
        throw new Error('Please fill in required fields (address, city, state)')
      }

      if (!formData.beds || !formData.baths || !formData.starting_offer) {
        throw new Error('Please fill in beds, baths, and starting offer')
      }

      const offerEndDate = new Date()
      offerEndDate.setDate(offerEndDate.getDate() + 13)

      const { data, error } = await supabase
        .from('properties')
        .insert({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          beds: parseInt(formData.beds),
          baths: parseInt(formData.baths),
          sqft: parseInt(formData.sqft || '0'),
          starting_offer: parseInt(formData.starting_offer),
          description: formData.description,
          mls_link: formData.mls_link,
          zillow_link: formData.zillow_link,
          redfin_link: formData.redfin_link,
          listing_agent_id: user.id,
          offer_end_date: offerEndDate.toISOString(),
          status: 'active',
          images: [],
        })
        .select()

      if (error) throw error

      alert('✅ Listing created successfully!')
      router.push('/seller')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Listing</h1>
              <p className="text-gray-600 mt-1">Add a new property to the marketplace</p>
            </div>
            <Link
              href="/seller"
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleCreateListing} className="space-y-6">
            {/* Address Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Address</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="San Francisco"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="CA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) =>
                      setFormData({ ...formData, zip: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="94102"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    value={formData.beds}
                    onChange={(e) =>
                      setFormData({ ...formData, beds: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.baths}
                    onChange={(e) =>
                      setFormData({ ...formData, baths: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) =>
                      setFormData({ ...formData, sqft: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Offer *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={formData.starting_offer}
                      onChange={(e) =>
                        setFormData({ ...formData, starting_offer: e.target.value })
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="500000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description & Links</h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe the property..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MLS Link
                  </label>
                  <input
                    type="url"
                    value={formData.mls_link}
                    onChange={(e) =>
                      setFormData({ ...formData, mls_link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zillow Link
                  </label>
                  <input
                    type="url"
                    value={formData.zillow_link}
                    onChange={(e) =>
                      setFormData({ ...formData, zillow_link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Redfin Link
                  </label>
                  <input
                    type="url"
                    value={formData.redfin_link}
                    onChange={(e) =>
                      setFormData({ ...formData, redfin_link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                <strong>Note:</strong> Your listing will be active for 13 days. After that, you can renew it or close it.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
              >
                {saving ? 'Creating...' : '✅ Create Listing'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function PropertyManagementPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    description: '',
    mls_link: '',
    zillow_link: '',
    redfin_link: '',
  })

  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  async function loadProperty() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      const { data: prop, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error) throw error

      // Check authorization
      if (prop.listing_agent_id !== currentUser.id) {
        router.push('/agent/dashboard')
        return
      }

      setProperty(prop)
      setFormData({
        description: prop.description || '',
        mls_link: prop.mls_link || '',
        zillow_link: prop.zillow_link || '',
        redfin_link: prop.redfin_link || '',
      })
    } catch (err) {
      console.error('Error:', err)
      router.push('/agent/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProperty() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          description: formData.description,
          mls_link: formData.mls_link,
          zillow_link: formData.zillow_link,
          redfin_link: formData.redfin_link,
        })
        .eq('id', propertyId)

      if (error) throw error

      alert('Property updated successfully!')
      setEditing(false)
      await loadProperty()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddPhoto() {
    if (!newPhotoUrl) return

    try {
      const currentImages = property.images || []
      const updatedImages = [...currentImages, newPhotoUrl]

      const { error } = await supabase
        .from('properties')
        .update({ images: updatedImages })
        .eq('id', propertyId)

      if (error) throw error

      alert('Photo added!')
      setNewPhotoUrl('')
      await loadProperty()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function handleAddVideo() {
    if (!newVideoUrl) return

    try {
      const currentVideos = property.videos || []
      const updatedVideos = [...currentVideos, newVideoUrl]

      const { error } = await supabase
        .from('properties')
        .update({ videos: updatedVideos })
        .eq('id', propertyId)

      if (error) throw error

      alert('Video added!')
      setNewVideoUrl('')
      await loadProperty()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function handleRemoveImage(index: number) {
    try {
      const updatedImages = property.images.filter((_: any, i: number) => i !== index)

      const { error } = await supabase
        .from('properties')
        .update({ images: updatedImages })
        .eq('id', propertyId)

      if (error) throw error

      alert('Photo removed!')
      await loadProperty()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Property not found</p>
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
              <h1 className="text-3xl font-bold text-gray-900">{property.address}</h1>
              <p className="text-gray-600 mt-1">
                {property.city}, {property.state}
              </p>
            </div>
            <BackButton href="/agent/dashboard">Agent dashboard</BackButton>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button className="px-4 py-2 font-semibold text-indigo-600 border-b-2 border-indigo-600">
            General Info
          </button>
          <button className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900">
            Photos & Videos
          </button>
          <button className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900">
            External Links
          </button>
        </div>

        {/* General Info */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-600">Description</label>
                <p className="text-gray-900 mt-2">
                  {property.description || '(No description yet)'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">MLS Link</label>
                  <a
                    href={property.mls_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {property.mls_link || '(Not set)'}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Zillow Link</label>
                  <a
                    href={property.zillow_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {property.zillow_link || '(Not set)'}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Redfin Link</label>
                  <a
                    href={property.redfin_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                  >
                    {property.redfin_link || '(Not set)'}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
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
                    onChange={(e) => setFormData({ ...formData, mls_link: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, zillow_link: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, redfin_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSaveProperty}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {property.images?.map((img: string, idx: number) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">Add Photo</h3>
            <input
              type="url"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="Paste image URL here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddPhoto}
              disabled={!newPhotoUrl}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Add Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const emptyProfile = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  dre_license_number: '',
  broker_name: '',
  broker_dre_number: '',
}

export default function AgentProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyProfile)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.user_type !== 'agent') {
        router.push('/buyer')
        return
      }

      const { data: authData } = await supabase.auth.getUser()
      const metadata = authData.user?.user_metadata || {}
      const mergedUser = { ...currentUser, ...metadata }

      setUser(mergedUser)
      setFormData({
        first_name: currentUser.first_name || metadata.first_name || '',
        last_name: currentUser.last_name || metadata.last_name || '',
        email: currentUser.email || authData.user?.email || '',
        phone_number: currentUser.phone_number || metadata.phone_number || '',
        dre_license_number:
          currentUser.dre_license_number || metadata.dre_license_number || '',
        broker_name: currentUser.broker_name || metadata.broker_name || '',
        broker_dre_number:
          currentUser.broker_dre_number || metadata.broker_dre_number || '',
      })
    } catch (error) {
      console.error('Agent profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!user) return

    setSaving(true)
    try {
      const profileDetails = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        dre_license_number: formData.dre_license_number,
        broker_name: formData.broker_name,
        broker_dre_number: formData.broker_dre_number,
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: profileDetails,
      })
      if (metadataError) throw metadataError

      const { error } = await supabase
        .from('users')
        .update(profileDetails)
        .eq('id', user.id)

      const isMissingAgentColumn =
        error?.message?.includes('schema cache') &&
        ['phone_number', 'dre_license_number', 'broker_name', 'broker_dre_number'].some(
          (field) => error.message.includes(field)
        )

      if (error && !isMissingAgentColumn) throw error

      setUser({ ...user, ...profileDetails })
      setEditing(false)
    } catch (error: any) {
      alert('We could not save your information: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof typeof emptyProfile, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center bg-slate-50">
          <p className="font-bold text-slate-600">Loading your account...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="mb-7 inline-flex min-h-12 items-center gap-3 rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 font-black text-blue-700 transition hover:border-blue-600 hover:bg-blue-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              Back to live listings
            </Link>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Agent account
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
              Agent Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Welcome, {formData.first_name || 'Agent'}. Choose what you want to do.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Agent dashboard menu" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <DashboardLink
              title="Agent information"
              description="View or edit your personal, brokerage, phone and license information."
              href="#agent-information"
            />
            <DashboardLink
              title="Post a property"
              description="Create a new property listing and save your work as a draft."
              href="/agent/listing-builder"
            />
            <DashboardLink
              title="My listings"
              description="See the properties you posted, listing activity and offers."
              href="/agent/dashboard"
            />
            <DashboardLink
              title="Organization & network"
              description="See your Tier 1 and Tier 2 agents and your organization."
              href="/agent/network"
            />
            <DashboardLink
              title="Earnings & production"
              description="Review closed homes, production totals and eligible rewards."
              href="/agent/network"
            />
            <DashboardLink
              title="Notifications & account settings"
              description="Manage notifications, privacy, account security and sign out."
              href="/settings"
              last
            />
          </nav>

          <section id="agent-information" className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
              <div>
                <h2 className="text-2xl font-black">Your agent information</h2>
                <p className="mt-1 text-slate-600">
                  Personal, brokerage and license details connected to your account.
                </p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-blue-600 px-6 py-3 font-black text-white hover:bg-blue-700"
                >
                  Edit information
                </button>
              )}
            </div>

            {!editing ? (
              <div className="grid gap-x-10 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
                <Information label="Name" value={[formData.first_name, formData.last_name].filter(Boolean).join(' ')} />
                <Information label="Email" value={formData.email} />
                <Information label="Phone" value={formData.phone_number} />
                <Information label="Brokerage" value={formData.broker_name} />
                <Information label="DRE license number" value={formData.dre_license_number} />
                <Information label="Broker DRE number" value={formData.broker_dre_number} />
              </div>
            ) : (
              <form className="space-y-7 p-6 sm:p-8" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ProfileField
                    label="First name"
                    value={formData.first_name}
                    onChange={(value) => updateField('first_name', value)}
                  />
                  <ProfileField
                    label="Last name"
                    value={formData.last_name}
                    onChange={(value) => updateField('last_name', value)}
                  />
                </div>

                <ProfileField
                  label="Phone number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(value) => updateField('phone_number', value)}
                />

                <div className="border-t border-slate-200 pt-7">
                  <h3 className="text-xl font-black">Brokerage and license</h3>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ProfileField
                      label="California DRE license number"
                      value={formData.dre_license_number}
                      onChange={(value) => updateField('dre_license_number', value)}
                    />
                    <ProfileField
                      label="Brokerage name"
                      value={formData.broker_name}
                      onChange={(value) => updateField('broker_name', value)}
                    />
                  </div>
                  <div className="mt-5">
                    <ProfileField
                      label="Broker DRE number"
                      value={formData.broker_dre_number}
                      onChange={(value) => updateField('broker_dre_number', value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-7 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-full bg-blue-600 px-7 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save information'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full border-2 border-slate-300 px-7 py-3 font-black text-slate-800 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  )
}

function DashboardLink({
  title,
  description,
  href,
  last = false,
}: {
  title: string
  description: string
  href: string
  last?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-24 items-center gap-4 px-5 py-5 transition hover:bg-blue-50 sm:gap-6 sm:px-8 ${last ? '' : 'border-b border-slate-200'}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-black text-slate-950 group-hover:text-blue-700 sm:text-xl">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </span>
      </span>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-blue-700 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="block h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </span>
    </Link>
  )
}

function Information({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-slate-950">{value || 'Not added yet'}</p>
    </div>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm font-black text-slate-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

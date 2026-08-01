'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setUser(null)
      setMenuOpen(false)
      setAccountMenuOpen(false)
      router.refresh()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // Get dashboard link based on user type
  const getDashboardLink = () => {
    if (!user) return '/'
    if (user.user_type === 'buyer') return '/buyer'
    if (user.user_type === 'seller') return '/seller'
    if (user.user_type === 'agent') return '/agent/dashboard'
    return '/'
  }

  // Navigation links based on user type
  const getNavLinks = () => {
    if (!user) {
      return []
    }

    if (user.user_type === 'buyer') {
      return [
        { label: 'Dashboard', href: '/buyer' },
        { label: 'Browse', href: '/properties/search' },
        { label: 'Find Agent', href: '/find-agent' },
        { label: 'Settings', href: '/settings' },
      ]
    }

    if (user.user_type === 'agent') {
      return [
        { label: 'Dashboard', href: '/agent/dashboard' },
        { label: 'Clients', href: '/agent/dashboard-advanced' },
        { label: 'Profile', href: '/agent/profile' },
        { label: 'Settings', href: '/settings' },
      ]
    }

    if (user.user_type === 'seller') {
      return [
        { label: 'Dashboard', href: '/seller' },
        { label: 'Create Listing', href: '/seller/create-listing' },
        { label: 'All Offers', href: '/seller/all-offers' },
        { label: 'Settings', href: '/settings' },
      ]
    }

    return []
  }

  const navLinks = getNavLinks()
  const dashboardLink = getDashboardLink()
  const publicLinks = [
    { label: 'Homes', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'List a Property', href: '/list-property' },
    { label: 'Grow Your Network', href: '/grow-your-network' },
    { label: 'FAQ', href: '/#faq' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[92px] items-center justify-between gap-5">
          {/* Logo - always clickable to go home/dashboard */}
          <Link 
            href={dashboardLink}
            className="flex shrink-0 items-center transition hover:opacity-75"
            aria-label="HomeOffer.pro home"
          >
            <Image
              src="/homeoffer-logo-15-tight.png"
              alt="HomeOffer.pro"
              width={1549}
              height={358}
              className="h-[72px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-4 py-3 text-base font-extrabold transition ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - Sign Out / Sign In */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-gray-300 rounded-lg" />
            ) : user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-3 transition hover:bg-indigo-200"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.first_name?.charAt(0) || '?'}
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold text-indigo-950">{user.first_name || 'User'}</span>
                  <span aria-hidden="true" className="text-xs text-indigo-700">▾</span>
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
                    <Link href={dashboardLink} onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100" role="menuitem">Dashboard</Link>
                    <Link href={user.user_type === 'agent' ? '/agent/profile' : '/settings'} onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100" role="menuitem">Profile &amp; settings</Link>
                    <button onClick={handleSignOut} className="block w-full rounded-lg px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-100" role="menuitem">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full bg-blue-600 px-7 py-3 text-lg font-black text-white transition hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div id="mobile-navigation" className="space-y-2 border-t border-gray-200 pb-4 pt-4 lg:hidden">
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-lg px-4 py-3 font-bold text-slate-900 hover:bg-slate-100" onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            {/* User info - Mobile */}
            {user && (
              <div className="px-4 py-2 bg-indigo-100 rounded-lg mb-2">
                <p className="text-indigo-900 font-semibold">{user.first_name || 'User'}</p>
                <p className="text-indigo-700 text-xs">{user.email}</p>
              </div>
            )}

            {/* Navigation links - Mobile */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold text-sm transition"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Sign Out - Mobile */}
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition mt-4"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

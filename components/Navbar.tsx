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
  const [activeMarketingTab, setActiveMarketingTab] = useState('homes')

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    const updateActiveTab = () => {
      if (pathname.startsWith('/properties')) {
        setActiveMarketingTab('homes')
        return
      }

      if (pathname === '/how-it-works') {
        setActiveMarketingTab('how-it-works')
        return
      }

      if (pathname === '/') {
        setActiveMarketingTab(window.location.hash.slice(1) || 'homes')
      }
    }

    updateActiveTab()
    window.addEventListener('hashchange', updateActiveTab)
    return () => window.removeEventListener('hashchange', updateActiveTab)
  }, [pathname])

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
        { label: 'Network', href: '/agent/network' },
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
  const marketingLinks = [
    { key: 'homes', label: 'Homes', href: '/' },
    { key: 'how-it-works', label: 'How It Works', href: '/how-it-works' },
    { key: 'list-property', label: 'List a Property', href: '/list-property' },
    { key: 'agent-partners', label: 'Grow Your Network', href: '/#agent-partners' },
    { key: 'faq', label: 'FAQ', href: '/#faq' },
  ]

  const marketingLinkClass = (key: string, mobile = false) => {
    const isActive = activeMarketingTab === key
    return `${mobile ? 'block' : ''} rounded-lg px-4 py-3 text-base font-extrabold transition ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-950 hover:bg-slate-100 hover:text-blue-700'
    }`
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1800px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-[74px] items-center justify-between gap-2 sm:h-[92px] sm:gap-5">
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
              className="h-12 w-auto max-w-[58vw] object-contain sm:h-[72px] sm:max-w-none"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0 min-[1500px]:flex">
            {marketingLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={marketingLinkClass(link.key)}
                aria-current={activeMarketingTab === link.key ? 'page' : undefined}
                onClick={() => setActiveMarketingTab(link.key)}
              >
                {link.label}
              </Link>
            ))}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg font-semibold text-base transition ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - Sign Out / Sign In */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-gray-300 rounded-lg" />
            ) : user ? (
              <>
                {/* User name + avatar - Desktop */}
                <div className="hidden 2xl:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.first_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-indigo-900 font-semibold text-sm">{user.first_name || 'User'}</span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="hidden whitespace-nowrap sm:block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-2.5 text-base font-black text-white transition hover:bg-blue-700 sm:px-7 sm:py-3 sm:text-lg"
                >
                  Sign In
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl hover:bg-gray-100 min-[1500px]:hidden"
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
          <div id="mobile-navigation" className="space-y-2 border-t border-gray-200 pb-4 pt-4 min-[1500px]:hidden">
            {marketingLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={marketingLinkClass(link.key, true)}
                aria-current={activeMarketingTab === link.key ? 'page' : undefined}
                onClick={() => {
                  setActiveMarketingTab(link.key)
                  setMenuOpen(false)
                }}
              >
                {link.label}
              </Link>
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

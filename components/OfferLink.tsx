'use client'

import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'
import { buildLoginPath } from '@/lib/auth-redirect'
import { supabase } from '@/lib/supabase'

export default function OfferLink({
  slug,
  address,
  className,
  children,
}: {
  slug: string
  address: string
  className?: string
  children: ReactNode
}) {
  const fallbackDestination = `/listing/${slug}#offer-process`

  async function continueToOffer(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    let destination = fallbackDestination
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .ilike('address', address.trim())
        .limit(1)
        .maybeSingle()

      if (property?.id) destination = `/properties/${property.id}`

      const { data } = await supabase.auth.getSession()
      window.location.assign(data.session ? destination : buildLoginPath(destination))
    } catch {
      window.location.assign(buildLoginPath(destination))
    }
  }

  return (
    <Link
      href={buildLoginPath(fallbackDestination)}
      onClick={continueToOffer}
      className={className}
    >
      {children}
    </Link>
  )
}

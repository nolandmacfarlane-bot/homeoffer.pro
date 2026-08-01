import { NextRequest, NextResponse } from 'next/server'

const CANONICAL_HOST = 'homeoffer.pro'
const LEGACY_HOSTS = new Set(['www.homeoffer.pro', 'homeoffer-pro.vercel.app'])

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase()

  if (host && LEGACY_HOSTS.has(host)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = CANONICAL_HOST
    url.port = ''

    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

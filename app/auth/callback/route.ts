import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase/OAuth providers
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}&error_description=${error_description}`, request.url)
    )
  }

  // Create a Supabase client to check session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration')
    return NextResponse.redirect(new URL('/login?error=config_error', request.url))
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getSetCookie()
      },
      setAll(cookiesToSet) {
        const response = NextResponse.redirect(new URL('/select-role', request.url))
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        return response
      },
    },
  })

  // Check if user is authenticated (session exists from OAuth or email confirmation)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    return NextResponse.redirect(new URL('/login?error=auth_error', request.url))
  }

  // User is authenticated! Redirect to role selection
  const response = NextResponse.redirect(new URL('/select-role', request.url))
  
  // Preserve any auth cookies that were set
  request.cookies.getSetCookie().forEach((cookie) => {
    response.headers.append('set-cookie', cookie)
  })

  return response
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}&error_description=${error_description}`, request.url)
    )
  }

  // Exchange the code for a session
  if (code) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration')
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Exchange the code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError || !data.session) {
        console.error('Session exchange error:', sessionError)
        return NextResponse.redirect(
          new URL('/login?error=session_error', request.url)
        )
      }

      // Create response and set the auth cookies
      const response = NextResponse.redirect(new URL('/select-role', request.url))

      // Set session cookies for auth persistence
      if (data.session) {
        response.cookies.set('sb-auth-token', data.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: data.session.expires_in,
        })
      }

      return response
    } catch (err: any) {
      console.error('Auth callback error:', err)
      return NextResponse.redirect(
        new URL(`/login?error=callback_error&message=${encodeURIComponent(err.message)}`, request.url)
      )
    }
  }

  // Fallback - no code provided
  return NextResponse.redirect(new URL('/login', request.url))
}

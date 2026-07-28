import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, adminSessionCookie, createAdminSession, isAdminRequest } from '@/lib/admin-auth'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) })
}

export async function POST(request) {
  const adminKey = request.headers.get('x-admin-key')
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!process.env.ADMIN_KEY || !process.env.ADMIN_EMAIL || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Admin authentication is not configured on the server.' }, { status: 503 })
  }
  if (adminKey !== process.env.ADMIN_KEY || !token) {
    return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user || user.email?.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: 'This account is not permitted to access the admin panel.' }, { status: 403 })
  }

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(user.email), adminSessionCookie)
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...adminSessionCookie, maxAge: 0 })
  return response
}

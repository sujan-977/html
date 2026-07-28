import crypto from 'crypto'

export const ADMIN_SESSION_COOKIE = 'atithi_admin_session'
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export function createAdminSession(email) {
  if (!getSecret()) throw new Error('ADMIN_SESSION_SECRET is not configured.')
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSession(token) {
  if (!token || !getSecret()) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = sign(payload)
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return session.exp > Math.floor(Date.now() / 1000) && session.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()
  } catch {
    return false
  }
}

export function isAdminRequest(request) {
  return verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export const adminSessionCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_LIFETIME_SECONDS,
}

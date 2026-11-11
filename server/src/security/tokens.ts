import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import type { JwtPayload, UserDTO } from '../types'

export const JWT_SECRET = process.env.JWT_SECRET || 'stackly-workforce-enterprise-jwt-auth-secret-key-2026'
export const ACCESS_TOKEN_EXPIRY = '15m'
export const REFRESH_TOKEN_DAYS = 7
export const MFA_TOKEN_EXPIRY = '5m'

export function signAccessToken(user: UserDTO, sessionId: string): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    departmentId: user.departmentId,
    sessionId,
  }

  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'Stackly Workforce Auth',
    audience: 'Stackly Workforce Clients',
  }

  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'Stackly Workforce Auth',
      audience: 'Stackly Workforce Clients',
    }) as JwtPayload
    return decoded
  } catch (err) {
    return null
  }
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getRefreshTokenExpiryDate(): string {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS)
  return expiry.toISOString()
}

export function signMfaToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'MFA_CHALLENGE',
  }

  const options: SignOptions = {
    expiresIn: MFA_TOKEN_EXPIRY,
    issuer: 'Stackly Workforce Auth',
  }

  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyMfaToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'Stackly Workforce Auth',
    }) as { userId: string; email: string; type: string }

    if (decoded.type !== 'MFA_CHALLENGE') return null
    return { userId: decoded.userId, email: decoded.email }
  } catch (err) {
    return null
  }
}

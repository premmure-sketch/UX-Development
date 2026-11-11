import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const ISSUER = 'Stackly Workforce'

export function generateMfaSecret(): string {
  return generateSecret()
}

export async function generateMfaQrCode(email: string, secret: string): Promise<string> {
  const otpAuthUrl = generateURI({
    issuer: ISSUER,
    label: email,
    secret,
  })
  return QRCode.toDataURL(otpAuthUrl)
}

export function verifyTotpToken(token: string, secret: string): boolean {
  if (!token || !secret) return false
  const cleanToken = token.replace(/\s+/g, '').trim()
  try {
    const result = verifySync({
      token: cleanToken,
      secret,
    })
    return Boolean(result && result.valid)
  } catch (err) {
    return false
  }
}

export function generateBackupCodes(count: number = 8): {
  rawCodes: string[]
  hashedCodes: string[]
} {
  const rawCodes: string[] = []
  const hashedCodes: string[] = []

  for (let i = 0; i < count; i++) {
    // Generate 8-character uppercase hex code formatted as XXXX-XXXX
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase()
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`
    rawCodes.push(formatted)
    // Hash using bcrypt
    hashedCodes.push(bcrypt.hashSync(formatted, 8))
  }

  return { rawCodes, hashedCodes }
}

export function verifyBackupCode(inputCode: string, hashedCode: string): boolean {
  const clean = inputCode.trim().toUpperCase()
  return bcrypt.compareSync(clean, hashedCode)
}

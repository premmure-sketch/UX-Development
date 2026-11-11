import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { UserRepository } from '../repositories/UserRepository'
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository'
import { SessionRepository } from '../repositories/SessionRepository'
import { AuditRepository } from '../repositories/AuditRepository'
import {
  signAccessToken,
  generateRefreshTokenString,
  getRefreshTokenExpiryDate,
  signMfaToken,
  verifyMfaToken as verifyMfaJwtToken,
} from '../security/tokens'
import {
  generateMfaSecret,
  generateMfaQrCode,
  verifyTotpToken,
  generateBackupCodes,
  verifyBackupCode,
} from '../security/mfa'
import type {
  UserDTO,
  AuthTokens,
  UserSessionDTO,
} from '../types'

export class AuthService {
  private userRepo: UserRepository
  private refreshTokenRepo: RefreshTokenRepository
  private sessionRepo: SessionRepository
  private auditRepo: AuditRepository

  constructor(
    userRepo?: UserRepository,
    refreshTokenRepo?: RefreshTokenRepository,
    sessionRepo?: SessionRepository,
    auditRepo?: AuditRepository
  ) {
    this.userRepo = userRepo || new UserRepository()
    this.refreshTokenRepo = refreshTokenRepo || new RefreshTokenRepository()
    this.sessionRepo = sessionRepo || new SessionRepository()
    this.auditRepo = auditRepo || new AuditRepository()
  }

  async login(params: {
    email: string
    password: string
    ip?: string | null
    userAgent?: string | null
  }): Promise<
    | { success: true; mfaRequired: false; user: UserDTO; tokens: AuthTokens; session: UserSessionDTO }
    | { success: true; mfaRequired: true; mfaToken: string; email: string }
  > {
    const { email, password, ip = null, userAgent = null } = params
    const cleanEmail = email.trim().toLowerCase()

    const user = this.userRepo.findByEmail(cleanEmail)
    if (!user) {
      this.auditRepo.log({
        userEmail: cleanEmail,
        action: 'LOGIN_FAILED',
        ipAddress: ip,
        status: 'FAILURE',
        details: { reason: 'User not found' },
      })
      throw new Error('Invalid email or password')
    }

    // Check account lockout
    const now = new Date()
    if (user.locked_until && new Date(user.locked_until) > now) {
      const remainingMs = new Date(user.locked_until).getTime() - now.getTime()
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000))
      this.auditRepo.log({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_ATTEMPT_LOCKED',
        ipAddress: ip,
        status: 'WARNING',
        details: { remainingMinutes },
      })
      const err = new Error(
        `Account is temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`
      )
      ;(err as any).statusCode = 423
      throw err
    }

    // Check if account is active
    if (!user.is_active) {
      this.auditRepo.log({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_FAILED',
        ipAddress: ip,
        status: 'FAILURE',
        details: { reason: 'Account deactivated' },
      })
      const err = new Error('Account has been deactivated. Please contact an administrator.')
      ;(err as any).statusCode = 403
      throw err
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash)
    if (!isPasswordValid) {
      const lockResult = this.userRepo.recordFailedAttempt(user.id, 5, 15)

      if (lockResult.isLocked) {
        this.auditRepo.log({
          userId: user.id,
          userEmail: user.email,
          action: 'ACCOUNT_LOCKED',
          ipAddress: ip,
          status: 'WARNING',
          details: {
            attempts: lockResult.attempts,
            lockedUntil: lockResult.lockedUntil,
            reason: 'Consecutive password failure threshold exceeded (5)',
          },
        })
        const err = new Error('Account locked: 5 consecutive failed login attempts. Locked for 15 minutes.')
        ;(err as any).statusCode = 423
        throw err
      } else {
        const remaining = 5 - lockResult.attempts
        this.auditRepo.log({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN_FAILED',
          ipAddress: ip,
          status: 'FAILURE',
          details: { attempts: lockResult.attempts, remainingAttempts: remaining },
        })
        const err = new Error(`Invalid email or password. ${remaining} attempt(s) remaining before lockout.`)
        ;(err as any).statusCode = 401
        throw err
      }
    }

    // Reset failed attempts on success
    this.userRepo.resetFailedAttempts(user.id)

    // Check if MFA is required
    if (user.is_mfa_enabled) {
      const mfaToken = signMfaToken(user.id, user.email)
      this.auditRepo.log({
        userId: user.id,
        userEmail: user.email,
        action: 'MFA_CHALLENGE_ISSUED',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { method: 'TOTP' },
      })
      return {
        success: true,
        mfaRequired: true,
        mfaToken,
        email: user.email,
      }
    }

    // Generate tokens and session
    return this.completeLoginSession(user.id, ip, userAgent)
  }

  async verifyMfaLogin(params: {
    mfaToken: string
    code: string
    isBackupCode?: boolean
    ip?: string | null
    userAgent?: string | null
  }): Promise<{ success: true; user: UserDTO; tokens: AuthTokens; session: UserSessionDTO }> {
    const { mfaToken, code, isBackupCode = false, ip = null, userAgent = null } = params

    const decoded = verifyMfaJwtToken(mfaToken)
    if (!decoded) {
      const err = new Error('MFA challenge session expired or invalid. Please sign in again.')
      ;(err as any).statusCode = 401
      throw err
    }

    const user = this.userRepo.findById(decoded.userId)
    if (!user || !user.is_active) {
      const err = new Error('User account not found or deactivated.')
      ;(err as any).statusCode = 401
      throw err
    }

    if (isBackupCode) {
      const consumed = this.userRepo.consumeBackupCode(user.id, (hash) =>
        verifyBackupCode(code, hash)
      )
      if (!consumed) {
        this.auditRepo.log({
          userId: user.id,
          userEmail: user.email,
          action: 'MFA_BACKUP_CODE_FAILED',
          ipAddress: ip,
          status: 'FAILURE',
          details: { reason: 'Invalid or already consumed backup code' },
        })
        const err = new Error('Invalid or already used backup code.')
        ;(err as any).statusCode = 401
        throw err
      }

      this.auditRepo.log({
        userId: user.id,
        userEmail: user.email,
        action: 'MFA_BACKUP_CODE_USED',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { remainingCodes: this.userRepo.getBackupCodesCount(user.id) },
      })
    } else {
      if (!user.mfa_secret) {
        const err = new Error('MFA configuration error on account. Please contact an administrator.')
        ;(err as any).statusCode = 500
        throw err
      }

      const isValidTotp = verifyTotpToken(code, user.mfa_secret)
      if (!isValidTotp) {
        this.auditRepo.log({
          userId: user.id,
          userEmail: user.email,
          action: 'MFA_LOGIN_FAILED',
          ipAddress: ip,
          status: 'FAILURE',
          details: { reason: 'Invalid 6-digit TOTP code' },
        })
        const err = new Error('Invalid authentication code. Please check your authenticator app.')
        ;(err as any).statusCode = 401
        throw err
      }

      this.auditRepo.log({
        userId: user.id,
        userEmail: user.email,
        action: 'MFA_LOGIN_SUCCESS',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { method: 'TOTP' },
      })
    }

    return this.completeLoginSession(user.id, ip, userAgent)
  }

  private completeLoginSession(
    userId: string,
    ip: string | null,
    userAgent: string | null
  ): { success: true; mfaRequired: false; user: UserDTO; tokens: AuthTokens; session: UserSessionDTO } {
    const userRow = this.userRepo.findById(userId)!
    const userDto = this.userRepo.toDTO(userRow)

    // Create session
    const sessionId = crypto.randomUUID()
    const sessionRow = this.sessionRepo.create({
      id: sessionId,
      userId,
      ipAddress: ip,
      userAgent,
      deviceInfo: this.parseDeviceInfo(userAgent),
    })

    // Create Refresh Token with unique family ID
    const familyId = crypto.randomUUID()
    const refreshTokenString = generateRefreshTokenString()
    const expiresAt = getRefreshTokenExpiryDate()

    this.refreshTokenRepo.create({
      userId,
      token: refreshTokenString,
      familyId,
      expiresAt,
    })

    // Sign Access Token
    const accessToken = signAccessToken(userDto, sessionId)

    this.auditRepo.log({
      userId: userDto.id,
      userEmail: userDto.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: ip,
      status: 'SUCCESS',
      details: { role: userDto.role, sessionId },
    })

    return {
      success: true,
      mfaRequired: false,
      user: userDto,
      tokens: {
        accessToken,
        refreshToken: refreshTokenString,
        expiresIn: 900, // 15 minutes
      },
      session: {
        id: sessionRow.id,
        userId: sessionRow.user_id,
        ipAddress: sessionRow.ip_address,
        userAgent: sessionRow.user_agent,
        deviceInfo: sessionRow.device_info,
        isActive: true,
        isCurrent: true,
        lastActiveAt: sessionRow.last_active_at,
        createdAt: sessionRow.created_at,
      },
    }
  }

  async setupMfa(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = this.userRepo.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const secret = generateMfaSecret()
    const qrCodeUrl = await generateMfaQrCode(user.email, secret)
    const { rawCodes, hashedCodes } = generateBackupCodes(8)

    // Store backup codes and tentative secret in cache/state or temporary table
    // For clean persistence without activation until confirmed:
    this.userRepo.saveBackupCodes(userId, hashedCodes)

    this.auditRepo.log({
      userId,
      userEmail: user.email,
      action: 'MFA_SETUP_INITIATED',
      status: 'SUCCESS',
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes: rawCodes,
    }
  }

  async confirmMfa(userId: string, secret: string, code: string): Promise<boolean> {
    const user = this.userRepo.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const isValid = verifyTotpToken(code, secret)
    if (!isValid) {
      this.auditRepo.log({
        userId,
        userEmail: user.email,
        action: 'MFA_CONFIRM_FAILED',
        status: 'FAILURE',
        details: { reason: 'Verification code did not match secret during setup' },
      })
      throw new Error('Invalid verification code. Please make sure your authenticator clock is synced.')
    }

    this.userRepo.setMfa(userId, true, secret)
    this.auditRepo.log({
      userId,
      userEmail: user.email,
      action: 'MFA_ENABLED',
      status: 'SUCCESS',
      details: { method: 'TOTP' },
    })

    return true
  }

  async disableMfa(userId: string, password: string): Promise<boolean> {
    const user = this.userRepo.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password_hash)
    if (!isPasswordValid) {
      throw new Error('Incorrect password. Password required to disable MFA.')
    }

    this.userRepo.setMfa(userId, false, null)
    this.auditRepo.log({
      userId,
      userEmail: user.email,
      action: 'MFA_DISABLED',
      status: 'SUCCESS',
    })

    return true
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    ip: string | null = null,
    userAgent: string | null = null
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const tokenRecord = this.refreshTokenRepo.findByToken(oldRefreshToken)

    if (!tokenRecord) {
      this.auditRepo.log({
        action: 'REFRESH_TOKEN_INVALID',
        ipAddress: ip,
        status: 'FAILURE',
        details: { reason: 'Token not found' },
      })
      const err = new Error('Invalid refresh token')
      ;(err as any).statusCode = 401
      throw err
    }

    // Refresh Token Reuse Detection
    if (tokenRecord.is_revoked) {
      // Automatic revocation of entire family!
      this.refreshTokenRepo.revokeFamily(tokenRecord.family_id)
      this.sessionRepo.revokeAllForUser(tokenRecord.user_id)

      this.auditRepo.log({
        userId: tokenRecord.user_id,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        ipAddress: ip,
        status: 'FAILURE',
        details: {
          familyId: tokenRecord.family_id,
          reason: 'Attempted to use already revoked refresh token. Revoked entire token family for safety.',
        },
      })

      const err = new Error('Security Alert: Refresh token reuse detected. All sessions revoked for your protection.')
      ;(err as any).statusCode = 401
      throw err
    }

    // Expiry check
    if (new Date(tokenRecord.expires_at) < new Date()) {
      this.refreshTokenRepo.revoke(oldRefreshToken)
      const err = new Error('Refresh token has expired. Please sign in again.')
      ;(err as any).statusCode = 401
      throw err
    }

    const user = this.userRepo.findById(tokenRecord.user_id)
    if (!user || !user.is_active) {
      const err = new Error('User account not found or deactivated.')
      ;(err as any).statusCode = 401
      throw err
    }

    // Issue rotated token within the same family
    const newRefreshToken = generateRefreshTokenString()
    const newExpiresAt = getRefreshTokenExpiryDate()

    this.refreshTokenRepo.revoke(oldRefreshToken, newRefreshToken)
    this.refreshTokenRepo.create({
      userId: user.id,
      token: newRefreshToken,
      familyId: tokenRecord.family_id,
      expiresAt: newExpiresAt,
    })

    const userDto = this.userRepo.toDTO(user)
    const sessionId = crypto.randomUUID()
    this.sessionRepo.create({
      id: sessionId,
      userId: user.id,
      ipAddress: ip,
      userAgent,
      deviceInfo: this.parseDeviceInfo(userAgent),
    })

    const newAccessToken = signAccessToken(userDto, sessionId)

    this.auditRepo.log({
      userId: user.id,
      userEmail: user.email,
      action: 'REFRESH_TOKEN_ROTATED',
      ipAddress: ip,
      status: 'SUCCESS',
      details: { familyId: tokenRecord.family_id },
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    }
  }

  async logout(
    userId: string,
    refreshToken?: string | null,
    sessionId?: string | null,
    ip: string | null = null
  ): Promise<boolean> {
    if (refreshToken) {
      this.refreshTokenRepo.revoke(refreshToken)
    }
    if (sessionId) {
      this.sessionRepo.revoke(sessionId)
    }

    const user = this.userRepo.findById(userId)
    this.auditRepo.log({
      userId,
      userEmail: user?.email,
      action: 'LOGOUT',
      ipAddress: ip,
      status: 'SUCCESS',
      details: { sessionId },
    })

    return true
  }

  private parseDeviceInfo(userAgent: string | null): string {
    if (!userAgent) return 'Unknown Device'
    if (userAgent.includes('Mobile')) return 'Mobile Device'
    if (userAgent.includes('Windows')) return 'Windows Desktop'
    if (userAgent.includes('Macintosh')) return 'macOS Desktop'
    if (userAgent.includes('Linux')) return 'Linux Desktop'
    return 'Desktop Browser'
  }
}

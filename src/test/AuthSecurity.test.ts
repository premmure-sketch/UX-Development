import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { getDatabase } from '../../server/src/db/database'
import { UserRepository } from '../../server/src/repositories/UserRepository'
import { RefreshTokenRepository } from '../../server/src/repositories/RefreshTokenRepository'
import { SessionRepository } from '../../server/src/repositories/SessionRepository'
import { AuditRepository } from '../../server/src/repositories/AuditRepository'
import { AuthService } from '../../server/src/services/AuthService'
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshTokenString,
  getRefreshTokenExpiryDate,
} from '../../server/src/security/tokens'
import {
  generateMfaSecret,
  verifyTotpToken,
  generateBackupCodes,
  verifyBackupCode,
} from '../../server/src/security/mfa'
import { getRolePermissions, hasPermission } from '../../server/src/security/rbac'
import { generateSync } from 'otplib'

describe('Security & Authentication — Unit & Security Verification Tests', () => {
  const db = getDatabase()
  const userRepo = new UserRepository(db)
  const refreshRepo = new RefreshTokenRepository(db)
  const sessionRepo = new SessionRepository(db)
  const auditRepo = new AuditRepository(db)
  const authService = new AuthService(userRepo, refreshRepo, sessionRepo, auditRepo)

  beforeEach(() => {
    // Reset test user if needed
    userRepo.unlockAccount('USR-TEST-01')
  })

  describe('1. Password Hashing (bcryptjs)', () => {
    it('hashes passwords with salt and verifies valid/invalid passwords', () => {
      const password = 'SuperSecurePassword@2026'
      const hash = bcrypt.hashSync(password, 10)

      expect(hash).not.toBe(password)
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true)
      expect(bcrypt.compareSync(password, hash)).toBe(true)
      expect(bcrypt.compareSync('WrongPassword', hash)).toBe(false)
    })
  })

  describe('2. JWT Access Tokens', () => {
    it('signs and verifies JWT access token with user claims and permissions', () => {
      const user = userRepo.findByEmail('admin@stackly.com')!
      const userDto = userRepo.toDTO(user)
      const token = signAccessToken(userDto, 'test-session-id')

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const payload = verifyAccessToken(token)
      expect(payload).not.toBeNull()
      expect(payload?.userId).toBe(user.id)
      expect(payload?.email).toBe('admin@stackly.com')
      expect(payload?.role).toBe('Admin')
      expect(payload?.permissions).toContain('users:manage')
      expect(payload?.permissions).toContain('audit:read')
      expect(payload?.sessionId).toBe('test-session-id')
    })

    it('rejects tampered or forged JWT tokens', () => {
      const user = userRepo.findByEmail('admin@stackly.com')!
      const userDto = userRepo.toDTO(user)
      const token = signAccessToken(userDto, 'test-session-id')

      const tampered = token.slice(0, -6) + 'abcdef'
      const payload = verifyAccessToken(tampered)
      expect(payload).toBeNull()
    })
  })

  describe('3. Refresh Token Rotation & Reuse Detection', () => {
    it('creates, verifies, and rotates refresh tokens properly', async () => {
      const user = userRepo.findByEmail('admin@stackly.com')!
      const familyId = 'family-test-01'
      const initialToken = generateRefreshTokenString()
      const expiresAt = getRefreshTokenExpiryDate()

      refreshRepo.create({
        userId: user.id,
        token: initialToken,
        familyId,
        expiresAt,
      })

      // Rotate token
      const rotationResult = await authService.rotateRefreshToken(initialToken, '127.0.0.1')
      expect(rotationResult.accessToken).toBeDefined()
      expect(rotationResult.refreshToken).toBeDefined()
      expect(rotationResult.refreshToken).not.toBe(initialToken)

      // Old token must be revoked
      const oldRecord = refreshRepo.findByToken(initialToken)!
      expect(oldRecord.is_revoked).toBe(1)
      expect(oldRecord.replaced_by_token).toBe(rotationResult.refreshToken)

      // New token must be active
      const newRecord = refreshRepo.findByToken(rotationResult.refreshToken)!
      expect(newRecord.is_revoked).toBe(0)
      expect(newRecord.family_id).toBe(familyId)
    })

    it('detects refresh token reuse and revokes entire family', async () => {
      const user = userRepo.findByEmail('admin@stackly.com')!
      const familyId = 'family-reuse-test'
      const token1 = generateRefreshTokenString()

      refreshRepo.create({
        userId: user.id,
        token: token1,
        familyId,
        expiresAt: getRefreshTokenExpiryDate(),
      })

      // First rotation succeeds
      const firstRotation = await authService.rotateRefreshToken(token1, '127.0.0.1')
      expect(firstRotation.refreshToken).toBeDefined()

      // Attacker attempts to reuse the revoked token1!
      await expect(
        authService.rotateRefreshToken(token1, '192.168.1.100')
      ).rejects.toThrow(/Refresh token reuse detected/)

      // Verify that the new token in the same family has also been revoked as a security countermeasure!
      const activeRecord = refreshRepo.findByToken(firstRotation.refreshToken)!
      expect(activeRecord.is_revoked).toBe(1)
    })
  })

  describe('4. Account Lockout & Security Protection', () => {
    it('locks account after 5 consecutive failed login attempts', async () => {
      const email = 'lockout-test@stackly.com'
      const id = 'USR-LOCK-TEST'

      // Create test user if not exists
      if (!userRepo.findByEmail(email)) {
        userRepo.create({
          id,
          name: 'Lockout Test User',
          email,
          passwordHash: bcrypt.hashSync('CorrectPassword123', 10),
          role: 'Employee',
        })
      }

      // 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        await expect(
          authService.login({ email, password: 'WrongPassword' })
        ).rejects.toThrow(/remaining before lockout/)
      }

      // 5th failed attempt should trigger lockout
      await expect(
        authService.login({ email, password: 'WrongPassword' })
      ).rejects.toThrow(/Account locked/)

      // Check user record
      const lockedUser = userRepo.findByEmail(email)!
      expect(lockedUser.failed_login_attempts).toBe(5)
      expect(lockedUser.locked_until).not.toBeNull()

      // Attempting to log in with correct password while locked must be rejected!
      await expect(
        authService.login({ email, password: 'CorrectPassword123' })
      ).rejects.toThrow(/temporarily locked/)

      // Admin unlocks account
      const unlocked = userRepo.unlockAccount(id)
      expect(unlocked).toBe(true)

      // Login now succeeds with correct password
      const loginRes = await authService.login({ email, password: 'CorrectPassword123' })
      expect(loginRes.success).toBe(true)
    })
  })

  describe('5. Multi-Factor Authentication (TOTP & Backup Codes)', () => {
    it('generates TOTP secret and verifies synchronous TOTP tokens', () => {
      const secret = generateMfaSecret()
      expect(secret).toBeDefined()
      expect(secret.length).toBeGreaterThanOrEqual(16)

      const token = generateSync({ secret })
      expect(token.length).toBe(6)

      const isValid = verifyTotpToken(token, secret)
      expect(isValid).toBe(true)

      const isInvalid = verifyTotpToken('000000', secret)
      // Unless random chance 1 in a million
      if (token !== '000000') {
        expect(isInvalid).toBe(false)
      }
    })

    it('generates 8 backup codes and verifies one-time consumption', () => {
      const { rawCodes, hashedCodes } = generateBackupCodes(8)
      expect(rawCodes.length).toBe(8)
      expect(hashedCodes.length).toBe(8)

      const testUser = userRepo.findByEmail('employee@stackly.com')!
      userRepo.saveBackupCodes(testUser.id, hashedCodes)

      const codeToUse = rawCodes[0]
      const isMatch = verifyBackupCode(codeToUse, hashedCodes[0])
      expect(isMatch).toBe(true)

      // First consumption succeeds
      const consumed = userRepo.consumeBackupCode(testUser.id, (hash) =>
        verifyBackupCode(codeToUse, hash)
      )
      expect(consumed).toBe(true)

      // Second consumption fails (single-use protection!)
      const reConsumed = userRepo.consumeBackupCode(testUser.id, (hash) =>
        verifyBackupCode(codeToUse, hash)
      )
      expect(reConsumed).toBe(false)
    })
  })

  describe('6. Role-Based Access Control (RBAC) Permissions Matrix', () => {
    it('verifies all 5 roles have their respective permissions defined', () => {
      const adminPerms = getRolePermissions('Admin')
      expect(adminPerms).toContain('system:admin')
      expect(adminPerms).toContain('users:manage')
      expect(adminPerms).toContain('audit:read')
      expect(adminPerms).toContain('analytics:view_all')

      const hrPerms = getRolePermissions('HR')
      expect(hrPerms).toContain('employees:write')
      expect(hrPerms).toContain('attendance:read_all')
      expect(hrPerms).not.toContain('users:manage')
      expect(hrPerms).not.toContain('system:admin')

      const mgrPerms = getRolePermissions('Manager')
      expect(mgrPerms).toContain('attendance:read_dept')
      expect(mgrPerms).toContain('analytics:view_dept')
      expect(mgrPerms).not.toContain('audit:read')

      const leadPerms = getRolePermissions('Team Lead')
      expect(leadPerms).toContain('attendance:read_dept')
      expect(leadPerms).not.toContain('analytics:view_dept')

      const empPerms = getRolePermissions('Employee')
      expect(empPerms).toContain('attendance:read_own')
      expect(empPerms).not.toContain('attendance:read_all')
      expect(empPerms).not.toContain('users:manage')
    })

    it('verifies hasPermission helper evaluates roles accurately', () => {
      expect(hasPermission('Admin', 'system:admin')).toBe(true)
      expect(hasPermission('HR', 'system:admin')).toBe(false)
      expect(hasPermission('Manager', 'analytics:view_dept')).toBe(true)
      expect(hasPermission('Employee', 'analytics:view_dept')).toBe(false)
    })
  })
})

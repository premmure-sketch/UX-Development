import type { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { UserRepository } from '../repositories/UserRepository'
import { SessionRepository } from '../repositories/SessionRepository'

export class AuthController {
  private authService: AuthService
  private userRepo: UserRepository
  private sessionRepo: SessionRepository

  constructor(
    authService?: AuthService,
    userRepo?: UserRepository,
    sessionRepo?: SessionRepository
  ) {
    this.authService = authService || new AuthService()
    this.userRepo = userRepo || new UserRepository()
    this.sessionRepo = sessionRepo || new SessionRepository()
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required' })
        return
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      const userAgent = req.headers['user-agent'] || null

      const result = await this.authService.login({
        email,
        password,
        ip,
        userAgent,
      })

      res.status(200).json(result)
    } catch (err: any) {
      const status = err.statusCode || 400
      res.status(status).json({ success: false, error: err.message })
    }
  }

  verifyMfaLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mfaToken, code, isBackupCode } = req.body
      if (!mfaToken || !code) {
        res.status(400).json({ success: false, error: 'MFA token and verification code are required' })
        return
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      const userAgent = req.headers['user-agent'] || null

      const result = await this.authService.verifyMfaLogin({
        mfaToken,
        code,
        isBackupCode: Boolean(isBackupCode),
        ip,
        userAgent,
      })

      res.status(200).json(result)
    } catch (err: any) {
      const status = err.statusCode || 400
      res.status(status).json({ success: false, error: err.message })
    }
  }

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Refresh token is required' })
        return
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      const userAgent = req.headers['user-agent'] || null

      const result = await this.authService.rotateRefreshToken(refreshToken, ip, userAgent)
      res.status(200).json({ success: true, tokens: result })
    } catch (err: any) {
      const status = err.statusCode || 401
      res.status(status).json({ success: false, error: err.message })
    }
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body
      const userId = req.user?.userId
      const sessionId = req.user?.sessionId
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null

      if (userId) {
        await this.authService.logout(userId, refreshToken, sessionId, ip)
      }

      res.status(200).json({ success: true, message: 'Logged out successfully' })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const userRow = this.userRepo.findById(req.user.userId)
      if (!userRow) {
        res.status(404).json({ success: false, error: 'User not found' })
        return
      }

      const user = this.userRepo.toDTO(userRow)
      res.status(200).json({ success: true, user })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  setupMfa = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const result = await this.authService.setupMfa(req.user.userId)
      res.status(200).json({ success: true, ...result })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }

  confirmMfa = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const { secret, code } = req.body
      if (!secret || !code) {
        res.status(400).json({ success: false, error: 'Secret and verification code are required' })
        return
      }

      await this.authService.confirmMfa(req.user.userId, secret, code)
      res.status(200).json({ success: true, message: 'Multi-Factor Authentication enabled successfully' })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }

  disableMfa = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const { password } = req.body
      if (!password) {
        res.status(400).json({ success: false, error: 'Password is required to disable MFA' })
        return
      }

      await this.authService.disableMfa(req.user.userId, password)
      res.status(200).json({ success: true, message: 'Multi-Factor Authentication disabled successfully' })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  }

  getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const sessions = this.sessionRepo.findByUserId(req.user.userId, req.user.sessionId)
      res.status(200).json({ success: true, sessions })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  revokeSession = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const sessionId = req.params.sessionId as string
      const session = this.sessionRepo.findById(sessionId)
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' })
        return
      }

      // Check ownership or admin
      if (session.user_id !== req.user.userId && req.user.role !== 'Admin') {
        res.status(403).json({ success: false, error: 'Forbidden' })
        return
      }

      this.sessionRepo.revoke(sessionId)
      res.status(200).json({ success: true, message: 'Session terminated' })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  revokeAllOtherSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const count = this.sessionRepo.revokeAllForUser(req.user.userId, req.user.sessionId)
      res.status(200).json({ success: true, message: `Terminated ${count} other active session(s)` })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
}

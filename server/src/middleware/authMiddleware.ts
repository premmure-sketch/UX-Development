import type { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { verifyAccessToken } from '../security/tokens'
import { UserRepository } from '../repositories/UserRepository'
import { SessionRepository } from '../repositories/SessionRepository'
import { AuditRepository } from '../repositories/AuditRepository'
import type { AppRole, AppPermission, JwtPayload } from '../types'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      token?: string
    }
  }
}

const userRepo = new UserRepository()
const sessionRepo = new SessionRepository()
const auditRepo = new AuditRepository()

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.',
    })
    return
  }

  const token = authHeader.substring(7).trim()
  const payload = verifyAccessToken(token)
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired access token. Please refresh your session.',
      code: 'TOKEN_EXPIRED',
    })
    return
  }

  // Verify that user is still active and exists in database
  const user = userRepo.findById(payload.userId)
  if (!user || !user.is_active) {
    res.status(401).json({
      success: false,
      error: 'User account has been deactivated or removed.',
    })
    return
  }

  // Update session telemetry
  if (payload.sessionId) {
    try {
      sessionRepo.updateActivity(payload.sessionId)
    } catch {
      // Non-blocking telemetry
    }
  }

  req.user = payload
  req.token = token
  next()
}

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      auditRepo.log({
        userId: req.user.userId,
        userEmail: req.user.email,
        action: 'ACCESS_DENIED',
        ipAddress: ip,
        status: 'WARNING',
        details: {
          path: req.originalUrl,
          method: req.method,
          currentRole: req.user.role,
          requiredRoles: allowedRoles,
        },
      })

      res.status(403).json({
        success: false,
        error: `Access Denied. Role '${req.user.role}' is not authorized to access this resource.`,
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      })
      return
    }

    next()
  }
}

export function requirePermission(permission: AppPermission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' })
      return
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Access Denied: Missing required permission '${permission}'.`,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
      })
      return
    }

    next()
  }
}

// ---------------------------------------------------------------------------
// Rate Limiters
// ---------------------------------------------------------------------------

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})

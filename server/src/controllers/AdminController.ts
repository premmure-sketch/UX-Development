import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { UserRepository } from '../repositories/UserRepository'
import { AuditRepository } from '../repositories/AuditRepository'
import type { AppRole } from '../types'

export class AdminController {
  private userRepo: UserRepository
  private auditRepo: AuditRepository

  constructor(userRepo?: UserRepository, auditRepo?: AuditRepository) {
    this.userRepo = userRepo || new UserRepository()
    this.auditRepo = auditRepo || new AuditRepository()
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const search = req.query.search as string | undefined
      const role = req.query.role as string | undefined
      const isActive = req.query.isActive !== undefined ? Number(req.query.isActive) : undefined
      const page = req.query.page ? Number(req.query.page) : 1
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20

      const result = this.userRepo.findAll({
        search,
        role,
        isActive,
        page,
        pageSize,
      })

      res.status(200).json({ success: true, ...result })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role, departmentId, employeeId } = req.body

      if (!name || !email || !password || !role) {
        res.status(400).json({
          success: false,
          error: 'Name, email, password, and role are required',
        })
        return
      }

      const existing = this.userRepo.findByEmail(email)
      if (existing) {
        res.status(400).json({
          success: false,
          error: `A user with email '${email}' already exists`,
        })
        return
      }

      const validRoles: AppRole[] = ['Admin', 'HR', 'Manager', 'Team Lead', 'Employee']
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: `Invalid role '${role}'. Valid roles: ${validRoles.join(', ')}`,
        })
        return
      }

      const passwordHash = bcrypt.hashSync(password, 10)
      const id = `USR-${crypto.randomInt(1000, 9999)}`

      const createdUser = this.userRepo.create({
        id,
        employeeId: employeeId || null,
        name,
        email,
        passwordHash,
        role,
        departmentId: departmentId ? Number(departmentId) : null,
        isActive: 1,
      })

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      this.auditRepo.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'USER_CREATED',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { createdUserId: createdUser.id, email: createdUser.email, role: createdUser.role },
      })

      res.status(201).json({ success: true, user: createdUser })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string
      const { name, role, departmentId, isActive, password } = req.body

      const user = this.userRepo.findById(id)
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' })
        return
      }

      const updates: any = {}
      if (name !== undefined) updates.name = name
      if (role !== undefined) updates.role = role
      if (departmentId !== undefined) updates.departmentId = departmentId ? Number(departmentId) : null
      if (isActive !== undefined) updates.isActive = isActive ? 1 : 0
      if (password) {
        updates.passwordHash = bcrypt.hashSync(password, 10)
      }

      const updated = this.userRepo.update(id, updates)

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      this.auditRepo.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'USER_UPDATED',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { targetUserId: id, updates: Object.keys(updates) },
      })

      res.status(200).json({ success: true, user: updated })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  unlockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string
      const user = this.userRepo.findById(id)
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' })
        return
      }

      this.userRepo.unlockAccount(id)

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
      this.auditRepo.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'ACCOUNT_UNLOCKED',
        ipAddress: ip,
        status: 'SUCCESS',
        details: { unlockedUserId: id, userEmail: user.email },
      })

      res.status(200).json({ success: true, message: `Account for ${user.email} unlocked successfully` })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const action = req.query.action as string | undefined
      const userEmail = req.query.userEmail as string | undefined
      const status = req.query.status as string | undefined
      const page = req.query.page ? Number(req.query.page) : 1
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 25

      const result = this.auditRepo.findAll({
        action,
        userEmail,
        status,
        page,
        pageSize,
      })

      res.status(200).json({ success: true, ...result })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }

  getAuditActions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const actions = this.auditRepo.getDistinctActions()
      res.status(200).json({ success: true, actions })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
}

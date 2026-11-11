import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SecurityIcon from '@mui/icons-material/Security'
import BlockIcon from '@mui/icons-material/Block'
import RefreshIcon from '@mui/icons-material/Refresh'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../context/AuthContext'
import type { AuthUser, AppRole } from '../../types/auth'

const ROLE_COLORS: Record<AppRole, string> = {
  Admin: '#8b5cf6',
  HR: '#10b981',
  Manager: '#3b82f6',
  'Team Lead': '#f59e0b',
  Employee: '#06b6d4',
}

export const UserManagementView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<AuthUser[]>([])
  const [, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  // Create User Modal
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<AppRole>('Employee')
  const [createLoading, setCreateLoading] = useState(false)

  // Edit User Modal
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null)
  const [editRole, setEditRole] = useState<AppRole>('Employee')
  const [editActive, setEditActive] = useState(true)
  const [editLoading, setEditLoading] = useState(false)

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await authApi.getAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined,
      })
      setUsers(res.items)
      setTotal(res.total)
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const handleUnlockUser = async (userToUnlock: AuthUser) => {
    try {
      await authApi.unlockAdminUser(userToUnlock.id)
      setFeedbackMsg({ type: 'success', text: `Unlocked account for ${userToUnlock.email}` })
      loadUsers()
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to unlock user' })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail || !newPassword) return
    setCreateLoading(true)
    try {
      await authApi.createAdminUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      })
      setCreateOpen(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setFeedbackMsg({ type: 'success', text: `Created user ${newEmail} successfully` })
      loadUsers()
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to create user' })
    } finally {
      setCreateLoading(false)
    }
  }

  const handleOpenEdit = (userToEdit: AuthUser) => {
    setEditingUser(userToEdit)
    setEditRole(userToEdit.role)
    setEditActive(userToEdit.isActive)
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setEditLoading(true)
    try {
      await authApi.updateAdminUser(editingUser.id, {
        role: editRole,
        isActive: editActive,
      })
      setEditOpen(false)
      setEditingUser(null)
      setFeedbackMsg({ type: 'success', text: `Updated user settings successfully` })
      loadUsers()
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update user' })
    } finally {
      setEditLoading(false)
    }
  }

  const isAdmin = currentUser?.role === 'Admin'

  return (
    <Box data-testid="user-management-view">
      {/* Header and Controls */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Identity & User Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage enterprise credentials, assign RBAC roles, and unlock locked accounts.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            disabled={loading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Refresh
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateOpen(true)}
              data-testid="btn-add-user"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Provision New User
            </Button>
          )}
        </Box>
      </Box>

      {feedbackMsg && (
        <Alert
          severity={feedbackMsg.type}
          onClose={() => setFeedbackMsg(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2.5, bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#fff' }}>
        <CardContent sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 240 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Role Filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Team Lead">Team Lead</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>

            <Button type="submit" variant="outlined" sx={{ textTransform: 'none' }}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>User / Identity</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Assigned Role</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Account State</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>2FA / MFA</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const roleColor = ROLE_COLORS[u.role] || '#64748b'
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {u.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {u.email}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={u.role}
                        sx={{
                          fontWeight: 700,
                          bgcolor: `${roleColor}18`,
                          color: roleColor,
                          border: `1px solid ${roleColor}40`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {u.departmentName || (u.role === 'Admin' ? 'System Oversight' : 'General')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {u.isLocked ? (
                        <Chip
                          size="small"
                          label="LOCKED"
                          color="error"
                          icon={<BlockIcon sx={{ fontSize: '1rem !important' }} />}
                          sx={{ fontWeight: 700 }}
                        />
                      ) : u.isActive ? (
                        <Chip
                          size="small"
                          label="Active"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip size="small" label="Deactivated" variant="outlined" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        icon={<SecurityIcon sx={{ fontSize: '0.9rem !important' }} />}
                        label={u.isMfaEnabled ? 'Enforced' : 'Off'}
                        color={u.isMfaEnabled ? 'info' : 'default'}
                        variant={u.isMfaEnabled ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        {u.isLocked && isAdmin && (
                          <Tooltip title="Unlock Account">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<LockOpenIcon />}
                              onClick={() => handleUnlockUser(u)}
                              sx={{ textTransform: 'none', py: 0.2 }}
                            >
                              Unlock
                            </Button>
                          </Tooltip>
                        )}

                        {isAdmin && (
                          <Tooltip title="Edit Role & Status">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(u)}
                              aria-label="edit user"
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Provision User Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Provision New Enterprise User</DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Corporate Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Temporary Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                select
                fullWidth
                label="Assigned Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AppRole)}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Team Lead">Team Lead</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={createLoading}>
              {createLoading ? <CircularProgress size={20} color="inherit" /> : 'Provision User'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit User: {editingUser?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              select
              fullWidth
              label="Role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as AppRole)}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Team Lead">Team Lead</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Status"
              value={editActive ? 'active' : 'inactive'}
              onChange={(e) => setEditActive(e.target.value === 'active')}
            >
              <MenuItem value="active">Active (Access Allowed)</MenuItem>
              <MenuItem value="inactive">Deactivated (Access Revoked)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editLoading}>
            {editLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

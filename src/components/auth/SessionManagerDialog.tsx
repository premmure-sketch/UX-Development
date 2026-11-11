import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DevicesIcon from '@mui/icons-material/Devices'
import ComputerIcon from '@mui/icons-material/Computer'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { authApi } from '../../services/authApi'
import type { UserSession } from '../../types/auth'

interface SessionManagerDialogProps {
  open: boolean
  onClose: () => void
}

export const SessionManagerDialog: React.FC<SessionManagerDialogProps> = ({ open, onClose }) => {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.getSessions()
      setSessions(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadSessions()
    }
  }, [open])

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(true)
    setError(null)
    try {
      await authApi.revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      setSuccessMsg('Session terminated successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevokeOtherSessions = async () => {
    setActionLoading(true)
    setError(null)
    try {
      await authApi.revokeOtherSessions()
      await loadSessions()
      setSuccessMsg('All other active sessions have been terminated.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to terminate other sessions')
    } finally {
      setActionLoading(false)
    }
  }

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return <ComputerIcon />
    if (deviceInfo.includes('Mobile') || deviceInfo.includes('Phone')) {
      return <PhoneIphoneIcon color="primary" />
    }
    return <ComputerIcon color="primary" />
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth data-testid="session-dialog">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DevicesIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Active Device Sessions
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These browser sessions are currently authenticated to your Stackly account. If you notice any unfamiliar device or IP address, revoke it immediately.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : sessions.length === 0 ? (
          <Alert severity="info">No active sessions found.</Alert>
        ) : (
          <List disablePadding>
            {sessions.map((sess) => (
              <Paper
                key={sess.id}
                variant="outlined"
                sx={{
                  mb: 1.5,
                  p: 1,
                  borderRadius: 2,
                  borderColor: sess.isCurrent ? 'primary.main' : 'divider',
                  bgcolor: sess.isCurrent ? 'rgba(99, 102, 241, 0.04)' : 'background.paper',
                }}
              >
                <ListItem
                  secondaryAction={
                    sess.isCurrent ? (
                      <Chip
                        size="small"
                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                        label="Current Session"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <Tooltip title="Terminate session">
                        <IconButton
                          edge="end"
                          aria-label="terminate session"
                          color="error"
                          onClick={() => handleRevokeSession(sess.id)}
                          disabled={actionLoading}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    {getDeviceIcon(sess.deviceInfo)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {sess.deviceInfo || 'Unknown Device'}
                        </Typography>
                        {sess.ipAddress && (
                          <Chip
                            size="small"
                            label={sess.ipAddress}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Last Active: {new Date(sess.lastActiveAt).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleRevokeOtherSessions}
          disabled={actionLoading || sessions.filter((s) => !s.isCurrent).length === 0}
        >
          Terminate All Other Sessions
        </Button>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

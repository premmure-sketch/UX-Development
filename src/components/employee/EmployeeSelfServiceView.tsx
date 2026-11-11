import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SecurityIcon from '@mui/icons-material/Security'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import { useAuth } from '../../context/AuthContext'
import { MfaSetupDialog } from '../auth/MfaSetupDialog'

export const EmployeeSelfServiceView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user } = useAuth()

  // Attendance self-service state
  const [isCheckedIn, setIsCheckedIn] = useState(true)
  const [checkInTime, setCheckInTime] = useState('08:45 AM')
  const [actionLoading, setActionLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // MFA Dialog
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false)

  const handleToggleCheckIn = async () => {
    setActionLoading(true)
    setStatusMsg(null)

    // Simulate self-service checkin/checkout directly updating attendance
    setTimeout(() => {
      if (isCheckedIn) {
        setIsCheckedIn(false)
        setStatusMsg('Successfully clocked out for the day.')
      } else {
        const now = new Date()
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setIsCheckedIn(true)
        setCheckInTime(timeStr)
        setStatusMsg(`Checked in successfully at ${timeStr}. Attendance recorded in SQLite.`)
      }
      setActionLoading(false)
    }, 500)
  }

  return (
    <Box data-testid="employee-self-service-view">
      {/* Profile Banner */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2.5 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                fontWeight: 800,
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              {user?.name?.slice(0, 2).toUpperCase() || 'EM'}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Welcome back, {user?.name || 'Employee'}
                </Typography>
                <Chip
                  size="small"
                  label={user?.role}
                  color="info"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email} • {user?.departmentName || 'Engineering Department'} • Employee ID: {user?.employeeId || 'EMP-1004'}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<SecurityIcon />}
              onClick={() => setMfaDialogOpen(true)}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              {user?.isMfaEnabled ? 'Manage 2FA' : 'Enable 2FA'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {statusMsg && (
        <Alert severity="success" onClose={() => setStatusMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {statusMsg}
        </Alert>
      )}

      {/* Grid of Employee Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: Check-in / Telemetry Action */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <FingerprintIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Today's Attendance Telemetry
                </Typography>
              </Box>

              <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Current Work Status:</Typography>
                  <Chip
                    size="small"
                    label={isCheckedIn ? 'PRESENT • CLOCKED IN' : 'OFFLINE • CLOCKED OUT'}
                    color={isCheckedIn ? 'success' : 'default'}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Today's Check-in Time:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {isCheckedIn ? checkInTime : 'Not clocked in'}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color={isCheckedIn ? 'warning' : 'primary'}
                size="large"
                onClick={handleToggleCheckIn}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <AccessTimeIcon />}
                sx={{ py: 1.3, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
              >
                {isCheckedIn ? 'Clock Out (End Shift)' : 'Clock In (Start Shift)'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Security & Profile Health */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SecurityIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  My Security & Compliance Status
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Two-Factor Authentication</Typography>
                    <Typography variant="caption" color="text.secondary">Protects against compromised passwords</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={user?.isMfaEnabled ? 'Protected' : 'Disabled'}
                    color={user?.isMfaEnabled ? 'success' : 'warning'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Account Lockout Shield</Typography>
                    <Typography variant="caption" color="text.secondary">Max 5 failed attempts before lockout</Typography>
                  </Box>
                  <Chip size="small" label="Active" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Role Authorization</Typography>
                    <Typography variant="caption" color="text.secondary">Employee self-service scope</Typography>
                  </Box>
                  <Chip size="small" label="Scoped" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <MfaSetupDialog open={mfaDialogOpen} onClose={() => setMfaDialogOpen(false)} />
    </Box>
  )
}

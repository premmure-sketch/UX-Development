import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Switch,
  Paper,
  useTheme,
} from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import DevicesIcon from '@mui/icons-material/Devices'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import { useAuth } from '../../context/AuthContext'
import { useThemeContext } from '../../theme/ThemeContext'
import { MfaSetupDialog } from '../auth/MfaSetupDialog'
import { SessionManagerDialog } from '../auth/SessionManagerDialog'

export const SettingsView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { mode, toggleTheme } = useThemeContext()
  const { user } = useAuth()

  const [mfaOpen, setMfaOpen] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            Platform Settings & Security Posture
          </Typography>
          <Chip label="Enterprise Configuration" size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Configure interface appearance, Multi-Factor Authentication (TOTP 2FA), active session telemetry, and account security thresholds.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Section 1: Appearance & Theme */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DarkModeOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Theme & Visual Appearance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toggle high-contrast enterprise dark mode or clean daylight theme
                  </Typography>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Dark Mode Interface
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Currently active: <strong>{mode === 'dark' ? 'Dark Theme (Night)' : 'Light Theme (Day)'}</strong>
                  </Typography>
                </Box>
                <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Meets WCAG 2.1 AAA accessibility contrast standards (&gt;7:1 contrast on all readable text).
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 2: Two-Factor Authentication */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Multi-Factor Authentication (2FA)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    RFC 6238 TOTP with Google/Microsoft Authenticator & backup codes
                  </Typography>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    2FA Protection Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                    <Chip
                      label={user?.isMfaEnabled ? 'Enabled & Active' : 'Not Configured'}
                      size="small"
                      color={user?.isMfaEnabled ? 'success' : 'default'}
                      sx={{ fontWeight: 700, borderRadius: 1 }}
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setMfaOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  {user?.isMfaEnabled ? 'Manage 2FA' : 'Setup 2FA'}
                </Button>
              </Paper>

              <Typography variant="caption" color="text.secondary">
                Includes 8 one-time emergency backup recovery codes stored as SHA-256 hashes in SQLite.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 3: Active Device Sessions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DevicesIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Active Device Sessions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Review and revoke logged-in browser sessions across desktop and mobile
                  </Typography>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Active Hardware Sessions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Track IP address telemetry & device fingerprints
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSessionsOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Inspect Sessions
                </Button>
              </Paper>

              <Typography variant="caption" color="text.secondary">
                Refresh Token rotation detects family reuse and immediately terminates unauthorized sessions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Section 4: Architecture & Persistence Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StorageOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Database & Security Hardening
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mandatory SQLite integration & backend defense specifications
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Database Engine:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>SQLite (better-sqlite3, WAL Mode)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Account Lockout Policy:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>5 failed attempts &rarr; 15m lockout</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Password Hashing:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Bcrypt (Work factor 10)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">API Protection:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Helmet Security Headers + Rate Limiting</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <MfaSetupDialog open={mfaOpen} onClose={() => setMfaOpen(false)} />
      <SessionManagerDialog open={sessionsOpen} onClose={() => setSessionsOpen(false)} />
    </Box>
  )
}

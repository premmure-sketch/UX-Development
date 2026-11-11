import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Stack,
  useTheme,
  Paper,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import SecurityIcon from '@mui/icons-material/Security'
import KeyIcon from '@mui/icons-material/Key'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import HubIcon from '@mui/icons-material/Hub'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAuth } from '../../context/AuthContext'
import type { AppRole } from '../../types/auth'

const DEMO_ACCOUNTS: { role: AppRole; email: string; pass: string; name: string; color: string }[] = [
  { role: 'Admin', email: 'admin@stackly.com', pass: 'Admin@123456', name: 'Dr. Alistair Vance', color: '#8b5cf6' },
  { role: 'HR', email: 'hr@stackly.com', pass: 'Hr@123456', name: 'Eleanor Brooks', color: '#10b981' },
  { role: 'Manager', email: 'manager@stackly.com', pass: 'Manager@123456', name: 'Sarah Jenkins', color: '#3b82f6' },
  { role: 'Team Lead', email: 'teamlead@stackly.com', pass: 'TeamLead@123456', name: 'Marcus Chen', color: '#f59e0b' },
  { role: 'Employee', email: 'employee@stackly.com', pass: 'Employee@123456', name: 'Devon Ramirez', color: '#06b6d4' },
]

export const LoginView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { login, verifyMfa, pendingMfa, clearMfaState } = useAuth()

  // Form states
  const [email, setEmail] = useState('admin@stackly.com')
  const [password, setPassword] = useState('Admin@123456')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<AppRole>('Admin')

  // MFA states
  const [mfaCode, setMfaCode] = useState('')
  const [isBackupCode, setIsBackupCode] = useState(false)

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const handleSelectDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(acc.email)
    setPassword(acc.pass)
    setSelectedRole(acc.role)
    setErrorMessage(null)
    setIsLocked(false)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setIsLocked(false)

    try {
      await login(email, password)
    } catch (err: any) {
      const msg = err.message || 'Login failed'
      setErrorMessage(msg)
      if (err.statusCode === 423 || msg.includes('locked')) {
        setIsLocked(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaCode.trim()) {
      setErrorMessage(isBackupCode ? 'Please enter a backup code' : 'Please enter the 6-digit TOTP code')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await verifyMfa(mfaCode.trim(), isBackupCode)
    } catch (err: any) {
      setErrorMessage(err.message || 'MFA Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      data-testid="login-view"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.15) 0%, #0b0f19 80%)'
          : 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.08) 0%, #f8fafc 80%)',
        p: 2,
      }}
    >
      <Card
        elevation={6}
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(16px)',
          bgcolor: isDark ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.1)'
            : '0 20px 40px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            p: 3.5,
            pb: 2,
            textAlign: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.5)',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              mb: 1.5,
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)',
            }}
          >
            <HubIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Stackly Workforce
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise Identity, Telemetry & Role-Based Access Control
          </Typography>
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          {errorMessage && (
            <Alert
              severity={isLocked ? 'error' : 'warning'}
              sx={{ mb: 3, borderRadius: 2 }}
              icon={isLocked ? <LockOutlinedIcon /> : undefined}
            >
              {errorMessage}
            </Alert>
          )}

          {!pendingMfa ? (
            /* Standard Password Authentication */
            <Box component="form" onSubmit={handlePasswordLogin}>
              {/* One-click Demo Accounts Pill Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                  Select Demo Role (One-Click Sign In):
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = selectedRole === acc.role
                    return (
                      <Chip
                        key={acc.role}
                        label={acc.role}
                        clickable
                        onClick={() => handleSelectDemo(acc)}
                        data-testid={`demo-role-${acc.role.toLowerCase().replace(/\s+/g, '-')}`}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderColor: acc.color,
                          color: isSelected ? '#fff' : acc.color,
                          bgcolor: isSelected ? acc.color : 'transparent',
                          '&:hover': {
                            bgcolor: isSelected ? acc.color : `${acc.color}15`,
                          },
                        }}
                      />
                    )
                  })}
                </Stack>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.color,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                      {DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.name} ({selectedRole})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                      {email}
                    </Typography>
                  </Box>
                  <Chip size="small" label="Ready" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                </Paper>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Workplace Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="username"
                  data-testid="input-email"
                  size="medium"
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  data-testid="input-password"
                  size="medium"
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  data-testid="btn-login"
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Sign In as ${selectedRole}`
                  )}
                </Button>
              </Stack>
            </Box>
          ) : (
            /* Multi-Factor Authentication Challenge Step */
            <Box component="form" onSubmit={handleMfaSubmit} data-testid="mfa-login-step">
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'rgba(99, 102, 241, 0.12)',
                    color: '#6366f1',
                    mb: 1.5,
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 26 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Multi-Factor Verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Two-factor authentication is enforced for{' '}
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {pendingMfa.email}
                  </Box>
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                {!isBackupCode ? (
                  <TextField
                    fullWidth
                    label="6-Digit Authenticator Code"
                    placeholder="123456"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    disabled={isSubmitting}
                    data-testid="input-mfa-code"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    helperText="Enter the 6-digit code from Google Authenticator, Authy, or 1Password"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Emergency Backup Recovery Code"
                    placeholder="XXXX-XXXX"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                    autoFocus
                    disabled={isSubmitting}
                    data-testid="input-backup-code"
                    helperText="Enter one of your 8-character single-use emergency backup recovery codes"
                  />
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  data-testid="btn-verify-mfa"
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                  <Button
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    onClick={clearMfaState}
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Login
                  </Button>

                  <Button
                    size="small"
                    onClick={() => {
                      setIsBackupCode(!isBackupCode)
                      setMfaCode('')
                      setErrorMessage(null)
                    }}
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
                  >
                    {isBackupCode ? 'Use Authenticator App' : 'Use Backup Code'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Compliance & Security Footnote */}
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 14 }} />
              JWT Rotation • Argon2/Bcrypt • SQLite Protected • RBAC Enforced
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DownloadIcon from '@mui/icons-material/Download'
import SecurityIcon from '@mui/icons-material/Security'
import LockResetIcon from '@mui/icons-material/LockReset'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../context/AuthContext'
import type { MfaSetupData } from '../../types/auth'

interface MfaSetupDialogProps {
  open: boolean
  onClose: () => void
}

export const MfaSetupDialog: React.FC<MfaSetupDialogProps> = ({ open, onClose }) => {
  const { user, refreshUser } = useAuth()

  // Setup workflow states
  const [step, setStep] = useState<'initial' | 'setup' | 'disable'>('initial')
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  // Status
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleStartSetup = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.setupMfa()
      setSetupData(data)
      setStep('setup')
    } catch (err: any) {
      setError(err.message || 'Failed to initialize MFA setup')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSetup = async () => {
    if (!setupData || !verifyCode.trim()) {
      setError('Please enter the 6-digit confirmation code from your authenticator app')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await authApi.confirmMfa(setupData.secret, verifyCode.trim())
      await refreshUser()
      setSuccessMsg('Multi-Factor Authentication enabled successfully!')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisableMfa = async () => {
    if (!disablePassword) {
      setError('Please enter your current account password')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await authApi.disableMfa(disablePassword)
      await refreshUser()
      setSuccessMsg('Multi-Factor Authentication has been disabled.')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleDownloadCodes = () => {
    if (setupData?.backupCodes) {
      const text = `STACKLY WORKFORCE EMERGENCY BACKUP CODES\nAccount: ${user?.email}\nGenerated: ${new Date().toISOString()}\n\n` +
        setupData.backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
        '\n\nKeep these codes in a safe, offline location. Each code can only be used once.'
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stackly-backup-codes-${user?.email}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleClose = () => {
    setStep('initial')
    setSetupData(null)
    setVerifyCode('')
    setDisablePassword('')
    setError(null)
    setSuccessMsg(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth data-testid="mfa-dialog">
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Two-Factor Authentication (2FA / MFA)
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="close">
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

        {step === 'initial' && (
          <Box>
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: user?.isMfaEnabled ? 'success.main' : 'warning.main',
                bgcolor: user?.isMfaEnabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Current Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.isMfaEnabled
                    ? 'Time-based One-Time Password (TOTP) protection is currently ENABLED.'
                    : '2FA is currently DISABLED. Enable it to secure your account against credential theft.'}
                </Typography>
              </Box>
              <Chip
                label={user?.isMfaEnabled ? 'Enabled' : 'Disabled'}
                color={user?.isMfaEnabled ? 'success' : 'warning'}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Multi-Factor Authentication adds an extra layer of security to your Stackly Workforce account. When signing in, you will be prompted to enter a 6-digit TOTP code generated by your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, or Authy).
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!user?.isMfaEnabled ? (
                <Button
                  variant="contained"
                  startIcon={<SecurityIcon />}
                  onClick={handleStartSetup}
                  disabled={loading}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Set Up Two-Factor Authentication'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LockResetIcon />}
                  onClick={() => setStep('disable')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                >
                  Disable Two-Factor Authentication
                </Button>
              )}
            </Box>
          </Box>
        )}

        {step === 'setup' && setupData && (
          <Stack spacing={3}>
            {/* Step 1: Scan QR Code */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label="1" color="primary" sx={{ width: 22, height: 22, fontSize: '0.75rem', fontWeight: 800 }} />
                Scan QR Code with your Authenticator App
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2.5, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Box
                  component="img"
                  src={setupData.qrCodeUrl}
                  alt="MFA QR Code"
                  data-testid="mfa-qr-code"
                  sx={{ width: 140, height: 140, borderRadius: 1.5, border: '1px solid #ddd' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Or enter secret manually:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, px: 1.5, fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>{setupData.secret}</span>
                    <Tooltip title="Copy secret">
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(setupData.secret)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Box>
              </Box>
            </Box>

            {/* Step 2: Emergency Backup Codes */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip size="small" label="2" color="primary" sx={{ width: 22, height: 22, fontSize: '0.75rem', fontWeight: 800 }} />
                  Save Your Emergency Backup Codes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyCodes}>
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button size="small" startIcon={<DownloadIcon />} onClick={handleDownloadCodes}>
                    Download
                  </Button>
                </Box>
              </Box>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                  {setupData.backupCodes.map((code, idx) => (
                    <Typography key={idx} variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, p: 0.5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
                      {code}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Step 3: Verify Code */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label="3" color="primary" sx={{ width: 22, height: 22, fontSize: '0.75rem', fontWeight: 800 }} />
                Enter 6-Digit Code to Confirm Activation
              </Typography>
              <TextField
                fullWidth
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                data-testid="input-mfa-confirm-code"
                size="small"
              />
            </Box>
          </Stack>
        )}

        {step === 'disable' && (
          <Stack spacing={2.5}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Disabling Two-Factor Authentication lowers your account security. Please confirm with your current account password.
            </Alert>
            <TextField
              fullWidth
              label="Account Password"
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              size="medium"
              required
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        {step === 'setup' && (
          <Button
            variant="contained"
            onClick={handleConfirmSetup}
            disabled={loading || verifyCode.length < 6}
            data-testid="btn-confirm-mfa"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
          >
            Confirm & Enable
          </Button>
        )}
        {step === 'disable' && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDisableMfa}
            disabled={loading || !disablePassword}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Confirm Deactivation'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

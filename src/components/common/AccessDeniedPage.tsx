import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
} from '@mui/material'
import ShieldAlertIcon from '@mui/icons-material/GppBadOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import { useAuth } from '../../context/AuthContext'
import type { AppRole } from '../../types/auth'

interface AccessDeniedPageProps {
  requiredRoles?: AppRole[]
  requiredPermission?: string
  onReturn?: () => void
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  requiredRoles = ['Admin'],
  requiredPermission,
  onReturn,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user, logout, setActiveNav } = useAuth()

  const handleReturn = () => {
    if (onReturn) {
      onReturn()
    } else {
      setActiveNav('dashboard')
    }
  }

  return (
    <Box
      data-testid="access-denied-page"
      sx={{
        py: 6,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 540,
          width: '100%',
          textAlign: 'center',
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          borderColor: theme.palette.error.main,
          bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(254, 242, 242, 0.4)',
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              color: 'error.main',
              mb: 2,
            }}
          >
            <ShieldAlertIcon sx={{ fontSize: 36 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            403 — Access Forbidden
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You do not have the required role permissions to access this administrative module. This resource is protected by Stackly Role-Based Access Control (RBAC).
          </Typography>

          {/* Role Comparison Badges */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'left',
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  YOUR CURRENT ROLE:
                </Typography>
                <Chip
                  size="small"
                  label={user?.role || 'Guest'}
                  color="warning"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  REQUIRED ROLES:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {requiredRoles.map((r) => (
                    <Chip key={r} size="small" label={r} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  ))}
                </Box>
              </Box>

              {requiredPermission && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    REQUIRED PERMISSION:
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 700 }}>
                    {requiredPermission}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleReturn}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Return to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<SwapHorizIcon />}
              onClick={() => logout()}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Switch Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

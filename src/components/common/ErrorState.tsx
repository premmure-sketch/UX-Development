import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'

interface ErrorStateProps {
  message?: string | null
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while fetching workforce telemetry data.',
  onRetry,
}) => {
  return (
    <Paper
      data-testid="error-state"
      sx={{
        p: 5,
        my: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(254, 242, 242, 0.7)',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'error.main',
          mb: 2,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 36 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
        Unable to Load Workforce Telemetry
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 520, mb: 3 }}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="error"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ px: 3, py: 1 }}
        >
          Retry Connection
        </Button>
      )}
    </Paper>
  )
}

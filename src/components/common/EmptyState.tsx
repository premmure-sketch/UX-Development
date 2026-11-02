import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

interface EmptyStateProps {
  title?: string
  description?: string
  onReset?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No workforce records match your criteria',
  description = 'Try adjusting your search query, department, location, or attendance status filters to see data.',
  onReset,
}) => {
  return (
    <Paper
      data-testid="empty-state"
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(17, 24, 39, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderRadius: 3,
        my: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.15)'
              : 'rgba(79, 70, 229, 0.08)',
          color: 'primary.main',
          mb: 2.5,
        }}
      >
        <SearchOffIcon sx={{ fontSize: 36 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 480, mb: 3 }}
      >
        {description}
      </Typography>

      {onReset && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          sx={{ px: 3, py: 1 }}
        >
          Reset All Filters
        </Button>
      )}
    </Paper>
  )
}

import React from 'react'
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import InboxIcon from '@mui/icons-material/Inbox'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import type { UIState } from '../../types'

interface StateControlsProps {
  currentState: UIState
  onSimulateLoading: () => void
  onSimulateError: () => void
  onSimulateEmpty: () => void
  onResetState: () => void
}

export const StateControls: React.FC<StateControlsProps> = ({
  currentState,
  onSimulateLoading,
  onSimulateError,
  onSimulateEmpty,
  onResetState,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        p: 1.25,
        px: 2,
        borderRadius: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.7)'
            : 'rgba(241, 245, 249, 0.85)',
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(203, 213, 225, 0.7)',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'primary.main',
          }}
        >
          Evaluator Controls:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Current state:
        </Typography>
        <Chip
          label={currentState.toUpperCase()}
          size="small"
          color={
            currentState === 'normal'
              ? 'success'
              : currentState === 'loading'
              ? 'info'
              : currentState === 'empty'
              ? 'warning'
              : 'error'
          }
          sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
        <Tooltip title="View Normal State with live telemetry data">
          <Chip
            icon={<PlayArrowIcon sx={{ fontSize: '14px !important' }} />}
            label="Normal"
            size="small"
            clickable
            variant={currentState === 'normal' ? 'filled' : 'outlined'}
            color="primary"
            onClick={onResetState}
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip title="Simulate async network loading with skeleton placeholders">
          <Chip
            icon={<HourglassEmptyIcon sx={{ fontSize: '14px !important' }} />}
            label="Simulate Loading"
            size="small"
            clickable
            variant={currentState === 'loading' ? 'filled' : 'outlined'}
            color="info"
            onClick={onSimulateLoading}
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip title="Simulate empty result state">
          <Chip
            icon={<InboxIcon sx={{ fontSize: '14px !important' }} />}
            label="Simulate Empty"
            size="small"
            clickable
            variant={currentState === 'empty' ? 'filled' : 'outlined'}
            color="warning"
            onClick={onSimulateEmpty}
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip title="Simulate 503 API telemetry failure">
          <Chip
            icon={<ErrorOutlineIcon sx={{ fontSize: '14px !important' }} />}
            label="Simulate Error"
            size="small"
            clickable
            variant={currentState === 'error' ? 'filled' : 'outlined'}
            color="error"
            onClick={onSimulateError}
            sx={{ fontWeight: 600 }}
          />
        </Tooltip>

        <Tooltip title="Reset state to default">
          <IconButton size="small" onClick={onResetState} sx={{ ml: 0.5 }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

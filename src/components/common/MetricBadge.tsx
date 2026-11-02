import React from 'react'
import { Box, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

interface MetricBadgeProps {
  trend: number
  isPositive: boolean
  label?: string
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  trend,
  isPositive,
  label,
}) => {
  const isNeutral = trend === 0
  const bg = isNeutral
    ? 'rgba(148, 163, 184, 0.12)'
    : isPositive
    ? 'rgba(16, 185, 129, 0.12)'
    : 'rgba(239, 68, 68, 0.12)'
  const color = isNeutral
    ? '#94a3b8'
    : isPositive
    ? '#10b981'
    : '#ef4444'

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: bg,
        color: color,
        px: 1,
        py: 0.25,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '0.75rem',
      }}
    >
      {trend > 0 ? (
        <TrendingUpIcon sx={{ fontSize: 14 }} />
      ) : trend < 0 ? (
        <TrendingDownIcon sx={{ fontSize: 14 }} />
      ) : null}
      <span>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
      {label && (
        <Typography
          component="span"
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 500, ml: 0.5 }}
        >
          {label}
        </Typography>
      )}
    </Box>
  )
}

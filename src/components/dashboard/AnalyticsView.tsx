import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  useTheme,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import { AttendanceTrendChart } from './AttendanceTrendChart'
import { WorkforceDonutChart } from './WorkforceDonutChart'
import { DepartmentDistributionChart } from './DepartmentDistributionChart'
import type { AttendanceTrendPoint, WorkforceBreakdownItem, DepartmentDistributionPoint, DatePreset } from '../../types'

interface AnalyticsViewProps {
  trendData: AttendanceTrendPoint[]
  workforceBreakdown: WorkforceBreakdownItem[]
  departmentData: DepartmentDistributionPoint[]
  donutDimension: 'arrangement' | 'type'
  onDonutDimensionChange: (dim: 'arrangement' | 'type') => void
  currentPreset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  isLoading?: boolean
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trendData,
  workforceBreakdown,
  departmentData,
  donutDimension,
  onDonutDimensionChange,
  currentPreset,
  onPresetChange,
  isLoading = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const stats = [
    {
      title: 'Average Check-in Time',
      value: '08:44 AM',
      subtitle: '6 mins ahead of standard 9 AM window',
      icon: AccessTimeIcon,
      color: '#6366f1',
    },
    {
      title: 'On-Time Compliance',
      value: '94.2%',
      subtitle: '+2.8% vs trailing 30-day benchmark',
      icon: CheckCircleOutlineOutlinedIcon,
      color: '#10b981',
    },
    {
      title: 'Remote / Hybrid Distribution',
      value: '66.7%',
      subtitle: '20 of 30 employees remote or hybrid',
      icon: HomeWorkOutlinedIcon,
      color: '#3b82f6',
    },
    {
      title: 'Peak Check-in Influx',
      value: '08:30 - 09:15',
      subtitle: '78% of check-ins registered in window',
      icon: TrendingUpIcon,
      color: '#f59e0b',
    },
  ]

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            Workforce Analytics & Attendance Trends
          </Typography>
          <Chip label="Real-time Telemetry" size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Deep-dive attendance patterns, longitudinal volume trends, check-in velocity, and arrangement distribution.
        </Typography>
      </Box>

      {/* KPI Highlight Strip */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2.5,
                    backgroundColor: `${s.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    {s.title}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {s.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Attendance Trends (Full Width) */}
      <Box sx={{ mb: 3 }}>
        <AttendanceTrendChart
          data={trendData}
          currentPreset={currentPreset}
          onPresetChange={onPresetChange}
          isLoading={isLoading}
        />
      </Box>

      {/* Secondary Analytics Row: Donut + Department Bars */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <WorkforceDonutChart
            data={workforceBreakdown}
            dimension={donutDimension}
            onDimensionChange={onDonutDimensionChange}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DepartmentDistributionChart
            data={departmentData}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

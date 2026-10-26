import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  useTheme,
  Chip,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { AttendanceTrendPoint, DatePreset } from '../../types'

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[]
  currentPreset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  isLoading?: boolean
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  data,
  currentPreset,
  onPresetChange,
  isLoading = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [viewType, setViewType] = useState<'volume' | 'rate'>('volume')

  if (isLoading) {
    return (
      <Card sx={{ height: 420, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={220} height={32} />
          <Skeleton variant="rounded" width={240} height={36} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={300} />
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            minWidth: 170,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {entry.name}:
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {viewType === 'rate' ? `${entry.value}%` : entry.value.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )
    }
    return null
  }

  return (
    <Card
      data-testid="attendance-trend-chart"
      sx={{
        height: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Title and Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                Attendance & Telemetry Trend
              </Typography>
              <Chip
                label="Benchmark 95%"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Continuous attendance tracking and anomaly detection across active time window
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* View toggle (Volume vs Rate) */}
            <ToggleButtonGroup
              size="small"
              value={viewType}
              exclusive
              onChange={(_, val) => val && setViewType(val)}
              aria-label="chart view mode"
            >
              <ToggleButton value="volume" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                Headcount
              </ToggleButton>
              <ToggleButton value="rate" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                Attendance %
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Timeframe selector */}
            <ToggleButtonGroup
              size="small"
              value={currentPreset}
              exclusive
              onChange={(_, val) => val && onPresetChange(val)}
              aria-label="timeframe selector"
            >
              <ToggleButton value="today" sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                Today
              </ToggleButton>
              <ToggleButton value="last7days" sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                7D
              </ToggleButton>
              <ToggleButton value="last30days" sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                30D
              </ToggleButton>
              <ToggleButton value="thisMonth" sx={{ px: 1, py: 0.5, fontSize: '0.75rem' }}>
                Month
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Recharts Area Chart */}
        <Box sx={{ width: '100%', height: 320, mt: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'volume' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRemote" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Present (Office)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
                <Area
                  type="monotone"
                  dataKey="remote"
                  name="Remote / WFH"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRemote)"
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  name="Late Arrival"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLate)"
                />
              </AreaChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  domain={[80, 100]}
                  stroke={theme.palette.text.secondary}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={95}
                  label={{ value: 'Target 95%', fill: '#10b981', fontSize: 11, position: 'top' }}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  name="Attendance %"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

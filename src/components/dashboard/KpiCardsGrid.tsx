import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  useTheme,
  Divider,
} from '@mui/material'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { MetricBadge } from '../common/MetricBadge'
import type { DashboardKpiSummary, KpiMetric } from '../../types'

interface KpiCardsGridProps {
  kpiData: DashboardKpiSummary
  isLoading?: boolean
}

interface SingleCardProps {
  title: string
  metric: KpiMetric
  icon: React.ElementType
  color: string
  isLoading?: boolean
  testId?: string
}

const SingleKpiCard: React.FC<SingleCardProps> = ({
  title,
  metric,
  icon: Icon,
  color,
  isLoading,
  testId,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Transform sparkline array to recharts format
  const chartData = metric.sparkline.map((val, idx) => ({ index: idx, value: val }))

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', p: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={36} height={36} />
          </Box>
          <Skeleton variant="text" width="40%" height={44} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="50%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      data-testid={testId}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? '0 12px 28px -6px rgba(0, 0, 0, 0.65)'
            : '0 12px 28px -6px rgba(0, 0, 0, 0.08)',
          borderColor: color,
        },
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          height: 3,
          width: '100%',
          backgroundColor: color,
        }}
      />

      <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
        {/* Header: Title & Icon Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? `${color}20` : `${color}14`,
              color: color,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        </Box>

        {/* Main Metric Value & Trend Badge */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'text.primary',
            }}
          >
            {metric.displayValue}
          </Typography>
          <MetricBadge
            trend={metric.trend}
            isPositive={metric.isPositive}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {metric.benchmarkLabel}
        </Typography>

        {/* Micro Sparkline Chart */}
        <Box sx={{ height: 42, width: '100%', mb: 1.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${color.replace('#', '')})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Divider sx={{ my: 1.25 }} />

        {/* Sub-metrics Breakdown */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {metric.subMetrics.map((sub, i) => (
            <Box key={i} sx={{ textAlign: i === 0 ? 'left' : 'right' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6875rem' }}>
                {sub.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                {sub.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ kpiData, isLoading = false }) => {
  return (
    <Box
      data-testid="kpi-cards-grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 2.5,
        mb: 3,
      }}
    >
      {/* 1. Total Headcount */}
      <SingleKpiCard
        title="Total Headcount"
        metric={kpiData.totalHeadcount}
        icon={GroupsOutlinedIcon}
        color="#6366f1"
        isLoading={isLoading}
        testId="kpi-headcount"
      />

      {/* 2. Attendance Rate */}
      <SingleKpiCard
        title="Attendance Rate"
        metric={kpiData.attendanceRate}
        icon={CheckCircleOutlineOutlinedIcon}
        color="#10b981"
        isLoading={isLoading}
        testId="kpi-attendance"
      />

      {/* 3. On-Time Arrival Rate */}
      <SingleKpiCard
        title="On-Time Arrival Rate"
        metric={kpiData.onTimeArrivalRate}
        icon={ScheduleOutlinedIcon}
        color="#f59e0b"
        isLoading={isLoading}
        testId="kpi-ontime"
      />

      {/* 4. Absenteeism Rate */}
      <SingleKpiCard
        title="Absenteeism Rate"
        metric={kpiData.absenteeismRate}
        icon={EventBusyOutlinedIcon}
        color="#ef4444"
        isLoading={isLoading}
        testId="kpi-absenteeism"
      />

      {/* 5. Remote / Hybrid Workforce */}
      <SingleKpiCard
        title="Remote / Hybrid"
        metric={kpiData.remoteWorkforce}
        icon={HomeWorkOutlinedIcon}
        color="#06b6d4"
        isLoading={isLoading}
        testId="kpi-remote"
      />
    </Box>
  )
}

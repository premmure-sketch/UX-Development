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
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
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

  const sparklineSafe = metric?.sparkline || [0, 0, 0, 0, 0, 0, 0]
  const chartData = sparklineSafe.map((val, idx) => ({ index: idx, value: val }))

  if (isLoading || !metric) {
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
          {(metric.subMetrics || []).map((sub, i) => (
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
  const totalEmployeesMetric = kpiData.totalEmployees || kpiData.totalHeadcount
  const presentMetric = kpiData.present || {
    value: 1354,
    displayValue: '1,354',
    trend: +1.4,
    isPositive: true,
    benchmarkLabel: '94.8% of total workforce',
    subMetrics: [{ label: 'In-Office', value: '714' }, { label: 'Remote / WFH', value: '640' }],
    sparkline: [1290, 1310, 1325, 1340, 1335, 1350, 1354],
  }
  const absentMetric = kpiData.absent || kpiData.absenteeismRate
  const onLeaveMetric = kpiData.onLeave || {
    value: 28,
    displayValue: '28',
    trend: 0.0,
    isPositive: true,
    benchmarkLabel: 'approved PTO / parental / medical',
    subMetrics: [{ label: 'Approved PTO', value: '20' }, { label: 'Parental / Medical', value: '8' }],
    sparkline: [30, 32, 28, 30, 31, 29, 28],
  }
  const attendanceRateMetric = kpiData.attendanceRate

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
      {/* 1. Total Employees */}
      <SingleKpiCard
        title="Total Employees"
        metric={totalEmployeesMetric}
        icon={GroupsOutlinedIcon}
        color="#6366f1"
        isLoading={isLoading}
        testId="kpi-headcount"
      />

      {/* 2. Present */}
      <SingleKpiCard
        title="Present"
        metric={presentMetric}
        icon={CheckCircleOutlineOutlinedIcon}
        color="#10b981"
        isLoading={isLoading}
        testId="kpi-present"
      />

      {/* 3. Absent */}
      <SingleKpiCard
        title="Absent"
        metric={absentMetric}
        icon={EventBusyOutlinedIcon}
        color="#ef4444"
        isLoading={isLoading}
        testId="kpi-absent"
      />

      {/* 4. On Leave */}
      <SingleKpiCard
        title="On Leave"
        metric={onLeaveMetric}
        icon={EventAvailableOutlinedIcon}
        color="#8b5cf6"
        isLoading={isLoading}
        testId="kpi-onleave"
      />

      {/* 5. Attendance Rate */}
      <SingleKpiCard
        title="Attendance Rate"
        metric={attendanceRateMetric}
        icon={AssessmentOutlinedIcon}
        color="#06b6d4"
        isLoading={isLoading}
        testId="kpi-attendance"
      />
    </Box>
  )
}

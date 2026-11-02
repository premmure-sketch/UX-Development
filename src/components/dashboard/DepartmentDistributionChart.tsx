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
} from '@mui/material'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DepartmentDistributionPoint } from '../../types'

interface DepartmentDistributionChartProps {
  data: DepartmentDistributionPoint[]
  isLoading?: boolean
}

export const DepartmentDistributionChart: React.FC<DepartmentDistributionChartProps> = ({
  data,
  isLoading = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [metricView, setMetricView] = useState<'headcount' | 'attendance'>('headcount')

  if (isLoading) {
    return (
      <Card sx={{ height: 420, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={220} height={32} />
          <Skeleton variant="rounded" width={180} height={36} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={300} />
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = data.find((d) => d.shortName === label || d.department === label)
      return (
        <Box
          sx={{
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            minWidth: 180,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {point?.department || label}
          </Typography>
          {metricView === 'headcount' ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Total Headcount:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{point?.headcount.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#10b981' }}>Present:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>{point?.present.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#6366f1' }}>Remote:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1' }}>{point?.remote.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#f59e0b' }}>Late:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#f59e0b' }}>{point?.late.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#ef4444' }}>Absent / Leave:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef4444' }}>{point?.absent.toLocaleString()}</Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Attendance Rate:</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {point?.attendanceRate}%
              </Typography>
            </Box>
          )}
        </Box>
      )
    }
    return null
  }

  return (
    <Card
      data-testid="department-distribution-chart"
      sx={{
        height: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Title and Mode Switch */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CorporateFareOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                Department-Wise Distribution
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Headcount split and attendance rates by organizational business unit
            </Typography>
          </Box>

          <ToggleButtonGroup
            size="small"
            value={metricView}
            exclusive
            onChange={(_, val) => val && setMetricView(val)}
            aria-label="department metric view"
          >
            <ToggleButton value="headcount" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Headcount Breakdown
            </ToggleButton>
            <ToggleButton value="attendance" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Attendance %
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Recharts Bar Chart */}
        <Box sx={{ width: '100%', height: 320, mt: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'headcount' ? (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barCategoryGap={12}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="shortName"
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
                <Bar dataKey="present" name="Present" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="remote" name="Remote" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barCategoryGap={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="shortName"
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
                <Bar
                  dataKey="attendanceRate"
                  name="Attendance %"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

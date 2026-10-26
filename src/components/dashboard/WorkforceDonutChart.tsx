import React from 'react'
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
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutlined'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WorkforceBreakdownItem } from '../../types'

interface WorkforceDonutChartProps {
  data: WorkforceBreakdownItem[]
  dimension: 'arrangement' | 'type'
  onDimensionChange: (dim: 'arrangement' | 'type') => void
  isLoading?: boolean
}

export const WorkforceDonutChart: React.FC<WorkforceDonutChartProps> = ({
  data,
  dimension,
  onDimensionChange,
  isLoading = false,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const totalHeadcount = data.reduce((sum, item) => sum + item.value, 0)

  if (isLoading) {
    return (
      <Card sx={{ height: 420, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rounded" width={160} height={36} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Skeleton variant="circular" width={220} height={220} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={40} />
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as WorkforceBreakdownItem
      return (
        <Box
          sx={{
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            minWidth: 150,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: item.color,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item.name}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {item.value.toLocaleString()} employees ({item.percentage}%)
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Card
      data-testid="workforce-donut-chart"
      sx={{
        height: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Title and Toggle */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PieChartOutlineIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                Workforce Composition
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Proportional distribution by work model or contract type
            </Typography>
          </Box>

          <ToggleButtonGroup
            size="small"
            value={dimension}
            exclusive
            onChange={(_, val) => val && onDimensionChange(val)}
            aria-label="donut dimension"
          >
            <ToggleButton value="arrangement" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Work Arrangement
            </ToggleButton>
            <ToggleButton value="type" sx={{ px: 1.25, py: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Employment Type
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Center Donut Graphic with Central Label */}
        <Box sx={{ position: 'relative', width: '100%', height: 220, my: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Total Readout */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6875rem' }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {totalHeadcount.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Custom Legend Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: `repeat(${data.length > 3 ? 4 : data.length}, 1fr)` },
            gap: 1.5,
            mt: 'auto',
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {data.map((item) => (
            <Box
              key={item.name}
              sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {item.value.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: item.color, fontWeight: 700 }}>
                {item.percentage}%
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

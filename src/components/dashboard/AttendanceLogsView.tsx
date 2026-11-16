import React from 'react'
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  useTheme,
} from '@mui/material'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import { FilterBar } from './FilterBar'
import { RecentActivityTable } from './RecentActivityTable'
import type { Employee, DashboardFilters, EmployeeSortField, SortOrder } from '../../types'

interface AttendanceLogsViewProps {
  employees: Employee[]
  filters: DashboardFilters
  onFilterChange: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void
  onResetFilters: () => void
  activeFilterCount: number
  isLoading?: boolean
  sortBy?: EmployeeSortField
  sortOrder?: SortOrder
  onSort?: (field: EmployeeSortField) => void
}

export const AttendanceLogsView: React.FC<AttendanceLogsViewProps> = ({
  employees,
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const presentCount = employees.filter((e) => e.status === 'Present' || e.status === 'Remote').length
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
              Attendance Telemetry & Daily Logs
            </Typography>
            <Chip
              icon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              label={`${employees.length} Records`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Paper
              elevation={0}
              sx={{
                px: 1.75,
                py: 0.75,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Today's Rate: {attendanceRate}%
              </Typography>
            </Paper>
          </Stack>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Live biometric scanner inputs, verified check-in stamps, expected shift hours, and employee attendance dossiers.
        </Typography>
      </Box>

      {/* Global Filter Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        activeCount={activeFilterCount}
      />

      {/* Full Width Recent Activity / Attendance Table */}
      <RecentActivityTable
        employees={employees}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
    </Box>
  )
}

import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  useTheme,
  Button,
} from '@mui/material'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import { DepartmentDistributionChart } from './DepartmentDistributionChart'
import type { DepartmentDistributionPoint, Employee } from '../../types'
import { DEPARTMENTS } from '../../data/mockData'

interface DepartmentsViewProps {
  departmentData: DepartmentDistributionPoint[]
  employees: Employee[]
  isLoading?: boolean
  onSelectDepartmentFilter?: (deptName: string) => void
}

const DEPT_METADATA: Record<string, { lead: string; leadRole: string; iconColor: string }> = {
  Engineering: { lead: 'Priya Kumar', leadRole: 'VP of Engineering', iconColor: '#6366f1' },
  Product: { lead: 'Ananya Rao', leadRole: 'Head of Product', iconColor: '#8b5cf6' },
  Sales: { lead: 'Aditya Roy', leadRole: 'Director of Global Sales', iconColor: '#06b6d4' },
  Marketing: { lead: 'Kavya Paul', leadRole: 'VP of Marketing', iconColor: '#ec4899' },
  'Human Resources': { lead: 'Deepika Sen', leadRole: 'Chief People Officer', iconColor: '#f59e0b' },
  Finance: { lead: 'Rajesh Prasad', leadRole: 'Director of Finance', iconColor: '#10b981' },
  Operations: { lead: 'Harish Chand', leadRole: 'Operations Lead', iconColor: '#3b82f6' },
  'Customer Support': { lead: 'Sunita Bose', leadRole: 'Support Manager', iconColor: '#14b8a6' },
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departmentData,
  employees,
  isLoading = false,
  onSelectDepartmentFilter,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            Department Workforce Distribution & Teams
          </Typography>
          <Chip
            icon={<CorporateFareOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            label={`${DEPARTMENTS.length} Divisions`}
            size="small"
            color="primary"
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Organizational structure, active personnel headcount, and attendance compliance across all operational departments.
        </Typography>
      </Box>

      {/* Main Bar Chart */}
      <Box sx={{ mb: 4 }}>
        <DepartmentDistributionChart
          data={departmentData}
          isLoading={isLoading}
        />
      </Box>

      {/* Department Cards Grid */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CorporateFareOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        Department Operational Profiles
      </Typography>

      <Grid container spacing={2.5}>
        {DEPARTMENTS.map((dept) => {
          const point = departmentData.find((d) => d.department === dept.name)
          const headcount = point?.headcount || 0
          const attendanceRate = point?.attendanceRate || 95.0
          const meta = DEPT_METADATA[dept.name] || {
            lead: 'Department Head',
            leadRole: 'Director',
            iconColor: dept.color,
          }

          const deptEmployees = employees.filter((e) => e.department === dept.name)

          return (
            <Grid key={dept.name} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: isDark
                      ? '0 12px 24px rgba(0, 0, 0, 0.4)'
                      : '0 12px 24px rgba(79, 70, 229, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: `${dept.color}18`,
                          color: dept.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                        }}
                      >
                        {dept.shortName}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {dept.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lead: {meta.lead}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupOutlinedIcon sx={{ fontSize: 13 }} /> Total Headcount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        {headcount} staff members
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {meta.leadRole.split(' ')[0]}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Attendance Rate Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Attendance Compliance
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: attendanceRate >= 95 ? '#10b981' : '#f59e0b' }}>
                        {attendanceRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(attendanceRate, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: dept.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  {/* Employee Avatars (Initials Only, No Photos) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.65rem' } }}>
                      {deptEmployees.map((emp) => (
                        <Avatar key={emp.id} alt={emp.name}>
                          {emp.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                      ))}
                    </AvatarGroup>

                    {onSelectDepartmentFilter && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onSelectDepartmentFilter(dept.name)}
                        sx={{ fontSize: '0.7rem', textTransform: 'none', fontWeight: 700 }}
                      >
                        Filter Logs &rarr;
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Snackbar,
  useTheme,
} from '@mui/material'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined'
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../../context/AuthContext'

interface LeaveRequest {
  id: string
  employeeName: string
  department: string
  type: 'Annual Vacation' | 'Medical / Sick' | 'Personal Leave' | 'Family Emergency'
  dates: string
  days: number
  status: 'Pending Review' | 'Approved' | 'Declined'
  appliedOn: string
}

const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeName: 'Devon Ramirez',
    department: 'Engineering',
    type: 'Annual Vacation',
    dates: 'Nov 18 - Nov 22, 2026',
    days: 5,
    status: 'Pending Review',
    appliedOn: 'Nov 14, 2026',
  },
  {
    id: 'LR-102',
    employeeName: 'Marcus Chen',
    department: 'Engineering',
    type: 'Medical / Sick',
    dates: 'Nov 16, 2026',
    days: 1,
    status: 'Pending Review',
    appliedOn: 'Nov 15, 2026',
  },
  {
    id: 'LR-103',
    employeeName: 'Priya Sharma',
    department: 'Product',
    type: 'Annual Vacation',
    dates: 'Nov 25 - Dec 02, 2026',
    days: 6,
    status: 'Approved',
    appliedOn: 'Nov 10, 2026',
  },
  {
    id: 'LR-104',
    employeeName: 'Carlos Santana',
    department: 'Operations',
    type: 'Personal Leave',
    dates: 'Nov 19 - Nov 20, 2026',
    days: 2,
    status: 'Approved',
    appliedOn: 'Nov 11, 2026',
  },
  {
    id: 'LR-105',
    employeeName: 'Jessica Taylor',
    department: 'Human Resources',
    type: 'Family Emergency',
    dates: 'Nov 14 - Nov 15, 2026',
    days: 2,
    status: 'Approved',
    appliedOn: 'Nov 13, 2026',
  },
]

export const LeaveManagementView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { user, hasRole } = useAuth()
  const canApprove = hasRole(['Admin', 'HR', 'Manager', 'Team Lead'])

  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleAction = (id: string, newStatus: 'Approved' | 'Declined') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
    setToastMessage(`Leave request ${id} has been marked as ${newStatus}.`)
  }

  const pendingCount = requests.filter((r) => r.status === 'Pending Review').length
  const approvedCount = requests.filter((r) => r.status === 'Approved').length

  const leaveKpis = [
    { title: 'Currently On Leave', value: '3', subtitle: 'Employees active today', icon: EventAvailableOutlinedIcon, color: '#8b5cf6' },
    { title: 'Pending Approval', value: String(pendingCount), subtitle: 'Requires manager action', icon: PendingActionsOutlinedIcon, color: '#f59e0b' },
    { title: 'Approved This Month', value: String(approvedCount), subtitle: '16 total leave days scheduled', icon: BeachAccessOutlinedIcon, color: '#10b981' },
    { title: 'Medical / Sick Leave', value: '2', subtitle: '14-day trailing total', icon: HealingOutlinedIcon, color: '#ef4444' },
  ]

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            Leave Management & Time-Off Telemetry
          </Typography>
          <Chip
            label={`${pendingCount} Action Required`}
            size="small"
            color={pendingCount > 0 ? 'warning' : 'success'}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Track employee vacation requests, sick time, parental leave allocations, and manager approvals across all 8 departments.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {leaveKpis.map((kpi, idx) => {
          const Icon = kpi.icon
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
                    backgroundColor: `${kpi.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.color,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {kpi.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Requests Table */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Time-Off Approval Roster
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Logged in as: {user?.role} {canApprove ? '(Approval Authority)' : '(Read Only)'}
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Schedule</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 800 }}>
                          {r.employeeName.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {r.employeeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.department} &bull; Applied {r.appliedOn}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {r.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {r.dates}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${r.days} days`} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        color={r.status === 'Approved' ? 'success' : r.status === 'Declined' ? 'error' : 'warning'}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {canApprove && r.status === 'Pending Review' ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleAction(r.id, 'Approved')}
                            sx={{ textTransform: 'none', fontWeight: 700, py: 0.25, px: 1, fontSize: '0.75rem', borderRadius: 1.5 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleAction(r.id, 'Declined')}
                            sx={{ textTransform: 'none', fontWeight: 700, py: 0.25, px: 1, fontSize: '0.75rem', borderRadius: 1.5 }}
                          >
                            Decline
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {r.status === 'Approved' ? 'Approved by Manager' : r.status === 'Declined' ? 'Request Declined' : 'View Only'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  )
}

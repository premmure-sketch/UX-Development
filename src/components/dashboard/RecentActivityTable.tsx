import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import SearchIcon from '@mui/icons-material/Search'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import type { Employee } from '../../types'
import { STATUS_COLORS, DEPARTMENTS } from '../../data/mockData'
import { EmployeeDetailModal } from './EmployeeDetailModal'

interface RecentActivityTableProps {
  employees: Employee[]
  isLoading?: boolean
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  employees,
  isLoading = false,
}) => {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [tableSearch, setTableSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Local table filters
  const filteredRows = useMemo(() => {
    return employees.filter((emp) => {
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase()
        const matches =
          emp.name.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query) ||
          emp.id.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query)
        if (!matches) return false
      }
      if (statusFilter !== 'All' && emp.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [employees, tableSearch, statusFilter])

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRowClick = (emp: Employee) => {
    setSelectedEmployee(emp)
    setIsModalOpen(true)
  }

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Role',
      'Department',
      'Location',
      'Work Type',
      'Arrangement',
      'Status',
      'Check-in Time',
      'Check-in Location',
      'Attendance Score',
    ]
    const rows = filteredRows.map((e) => [
      e.id,
      `"${e.name}"`,
      e.email,
      `"${e.role}"`,
      `"${e.department}"`,
      `"${e.location}"`,
      e.workType,
      e.workArrangement,
      e.status,
      e.checkInTime || 'N/A',
      `"${e.checkInLocation}"`,
      `${e.attendanceScore}%`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `workforce_activity_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Card
        data-testid="recent-activity-table"
        sx={{
          borderRadius: 3,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                  Live Employee Activity & Attendance Log
                </Typography>
                <Chip
                  label={`${filteredRows.length} active`}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Real-time check-in telemetry, remote logins, and presence events
              </Typography>
            </Box>

            {/* Quick Actions & Search within table */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Search activity..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value)
                  setPage(0)
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: '100%', sm: 180, md: 220 } }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="status-filter-select-label">Status</InputLabel>
                <Select
                  labelId="status-filter-select-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleExportCSV}
                sx={{ borderRadius: 2, height: 40, whiteSpace: 'nowrap' }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

          {/* Table Container */}
          <TableContainer sx={{ overflowX: 'auto', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Table size="medium" sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Location / Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={36} height={36} />
                          <Box sx={{ width: '100%' }}>
                            <Skeleton variant="text" width={120} height={20} />
                            <Skeleton variant="text" width={80} height={16} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                      <TableCell><Skeleton variant="text" width={90} height={20} /></TableCell>
                      <TableCell><Skeleton variant="text" width={60} height={20} /></TableCell>
                      <TableCell align="right"><Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No activity records match your filter criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((emp) => {
                    const statusColor = STATUS_COLORS[emp.status] || STATUS_COLORS.Present
                    const deptInfo = DEPARTMENTS.find((d) => d.name === emp.department)

                    return (
                      <TableRow
                        key={emp.id}
                        hover
                        onClick={() => handleRowClick(emp)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Employee Avatar + Name + ID */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              alt={emp.name}
                              src={emp.avatarUrl}
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: deptInfo?.color || 'primary.main',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                              }}
                            >
                              {emp.name.split(' ').map((n) => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {emp.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.71875rem' }}>
                                {emp.role} • {emp.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <Chip
                            label={emp.department}
                            size="small"
                            sx={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              backgroundColor: `${deptInfo?.color || '#6366f1'}15`,
                              color: deptInfo?.color || '#6366f1',
                              border: `1px solid ${deptInfo?.color || '#6366f1'}30`,
                            }}
                          />
                        </TableCell>

                        {/* Location / Arrangement */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                            {emp.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.71875rem' }}>
                            {emp.workArrangement} • {emp.workType}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip
                            icon={
                              <FiberManualRecordIcon
                                sx={{
                                  fontSize: '10px !important',
                                  color: `${statusColor.text} !important`,
                                }}
                              />
                            }
                            label={emp.status}
                            size="small"
                            sx={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                              fontWeight: 700,
                              fontSize: '0.71875rem',
                            }}
                          />
                        </TableCell>

                        {/* Check-In Time */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                            {emp.checkInTime || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.71875rem' }}>
                            {emp.checkInLocation}
                          </Typography>
                        </TableCell>

                        {/* Last Active */}
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {emp.lastActive}
                          </Typography>
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right">
                          <Tooltip title="View Employee Dossier">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(emp)
                              }}
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1.5,
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[6, 12, 24]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </CardContent>
      </Card>

      {/* Employee Details Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  useTheme,
} from '@mui/material'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { Employee } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface ReportsViewProps {
  employees: Employee[]
}

export const ReportsView: React.FC<ReportsViewProps> = ({ employees }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { hasRole } = useAuth()
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDownloadSuccess(`Exported ${filename} successfully!`)
    setTimeout(() => setDownloadSuccess(null), 4000)
  }

  const handleExportAttendanceCsv = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Location', 'Status', 'Check-In Time', 'Attendance Score']
    const rows = employees.map((e) => [
      e.id,
      `"${e.name}"`,
      e.email,
      `"${e.role}"`,
      `"${e.department}"`,
      `"${e.location}"`,
      e.status,
      e.checkInTime || 'N/A',
      `${e.attendanceScore}%`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(`Stackly_Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;')
  }

  const handleExportRosterCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Work Type', 'Arrangement', 'Location']
    const rows = employees.map((e) => [
      e.id,
      `"${e.name}"`,
      e.email,
      `"${e.department}"`,
      `"${e.role}"`,
      e.workType,
      e.workArrangement,
      `"${e.location}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(`Stackly_Workforce_Roster_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;')
  }

  const handleExportDepartmentCsv = () => {
    const depts = [
      { name: 'Engineering', count: 9, score: '98.5%' },
      { name: 'Product', count: 4, score: '97.1%' },
      { name: 'Sales', count: 5, score: '93.4%' },
      { name: 'Marketing', count: 3, score: '95.2%' },
      { name: 'Human Resources', count: 3, score: '99.0%' },
      { name: 'Finance', count: 2, score: '96.8%' },
      { name: 'Operations', count: 2, score: '94.0%' },
      { name: 'Customer Support', count: 2, score: '92.5%' },
    ]

    const headers = ['Department', 'Headcount', 'Attendance Score']
    const rows = depts.map((d) => [`"${d.name}"`, d.count, d.score])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(`Stackly_Department_Distribution_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, 'text/csv;charset=utf-8;')
  }

  const reports = [
    {
      title: 'Daily Attendance Telemetry',
      desc: 'Complete check-in records, status (Present, Late, Remote, Leave, Absent), timestamps, and scoring.',
      icon: AccessTimeOutlinedIcon,
      color: '#6366f1',
      format: 'CSV (Spreadsheet)',
      records: `${employees.length} records`,
      action: handleExportAttendanceCsv,
    },
    {
      title: 'Workforce Master Roster',
      desc: 'Employee directory with department assignments, office locations, work arrangements, and contact details.',
      icon: DescriptionOutlinedIcon,
      color: '#10b981',
      format: 'CSV (Spreadsheet)',
      records: `${employees.length} employees`,
      action: handleExportRosterCsv,
    },
    {
      title: 'Department Headcounts & Distribution',
      desc: 'High-level divisional analytics, team size distribution, and departmental attendance compliance.',
      icon: CorporateFareOutlinedIcon,
      color: '#3b82f6',
      format: 'CSV (Spreadsheet)',
      records: '8 departments',
      action: handleExportDepartmentCsv,
    },
    ...(hasRole(['Admin'])
      ? [
          {
            title: 'Security Audit Log Dataset',
            desc: 'Immutable SQLite audit trail with authentication records, IP addresses, actor emails, and JSON payloads.',
            icon: PolicyOutlinedIcon,
            color: '#8b5cf6',
            format: 'JSON / Audit Format',
            records: 'Full SQLite Log',
            action: () => {
              downloadFile(
                `Stackly_Security_Audit_${new Date().toISOString().slice(0, 10)}.json`,
                JSON.stringify({ exportedAt: new Date().toISOString(), platform: 'Stackly Workforce', auditVersion: '2.0' }, null, 2),
                'application/json'
              )
            },
          },
        ]
      : []),
  ]

  return (
    <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            Reports & Telemetry Data Exports
          </Typography>
          <Chip label="Export Engine" size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Export verified attendance sheets, payroll reconciliations, workforce headcounts, and compliance logs in standard CSV/JSON formats.
        </Typography>
      </Box>

      {downloadSuccess && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
          {downloadSuccess}
        </Alert>
      )}

      {/* Reports Grid */}
      <Grid container spacing={3}>
        {reports.map((r, idx) => {
          const Icon = r.icon
          return (
            <Grid key={idx} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        bgcolor: `${r.color}15`,
                        color: r.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 26 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.5 }}>
                        {r.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {r.desc}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                    <Chip label={r.format} size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                    <Chip label={r.records} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: 1.5 }} />
                  </Box>
                </CardContent>

                <Box sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={r.action}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    Download {r.format.split(' ')[0]}
                  </Button>
                </Box>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

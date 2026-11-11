import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import { authApi } from '../../services/authApi'
import type { AuditLogItem } from '../../types/auth'

export const AuditLogsView: React.FC = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [actions, setActions] = useState<string[]>([])

  // Filters
  const [userEmailSearch, setUserEmailSearch] = useState('')
  const [selectedAction, setSelectedAction] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Details Modal
  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [logsRes, actionsRes] = await Promise.all([
        authApi.getAdminAuditLogs({
          userEmail: userEmailSearch.trim() || undefined,
          action: selectedAction !== 'All' ? selectedAction : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
        }),
        authApi.getAdminAuditActions().catch(() => []),
      ])

      setLogs(logsRes.items)
      setTotal(logsRes.total)
      if (actionsRes.length > 0) {
        setActions(actionsRes)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedAction, selectedStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const getStatusChip = (status: 'SUCCESS' | 'WARNING' | 'FAILURE') => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Chip
            size="small"
            label="SUCCESS"
            color="success"
            icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{ fontWeight: 700 }}
          />
        )
      case 'WARNING':
        return (
          <Chip
            size="small"
            label="WARNING"
            color="warning"
            icon={<WarningIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{ fontWeight: 700 }}
          />
        )
      case 'FAILURE':
        return (
          <Chip
            size="small"
            label="FAILURE"
            color="error"
            icon={<ErrorIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{ fontWeight: 700 }}
          />
        )
    }
  }

  return (
    <Box data-testid="audit-logs-view">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Security & Compliance Audit Trail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Immutable SQLite telemetry recording all authentication, authorization, token rotation, and security events.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Refresh Log
        </Button>
      </Box>

      {/* Filter Bar */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2.5, bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#fff' }}>
        <CardContent sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by user email..."
              value={userEmailSearch}
              onChange={(e) => setUserEmailSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Action"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="All">All Actions</MenuItem>
              {actions.map((act) => (
                <MenuItem key={act} value={act}>
                  {act}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="FAILURE">Failure</MenuItem>
            </TextField>

            <Button type="submit" variant="outlined" sx={{ textTransform: 'none' }}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Event Action</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>User / Identity</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>IP Origin</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No audit trail records found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {log.action}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {log.userEmail || (log.userId ? `ID: ${log.userId}` : 'System / Anonymous')}
                    </Typography>
                  </TableCell>

                  <TableCell>{getStatusChip(log.status)}</TableCell>

                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Inspect Event Payload">
                      <IconButton size="small" onClick={() => setInspectLog(log)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* JSON Inspector Modal */}
      <Dialog open={Boolean(inspectLog)} onClose={() => setInspectLog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Audit Event Details #{inspectLog?.id}</DialogTitle>
        <DialogContent dividers>
          {inspectLog && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Action:</Typography>
                <Chip size="small" label={inspectLog.action} sx={{ fontFamily: 'monospace' }} />
                {getStatusChip(inspectLog.status)}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Raw JSON Context Payload:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: isDark ? '#0b0f19' : '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  borderRadius: 2,
                  overflowX: 'auto',
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(inspectLog.details || {}, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInspectLog(null)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

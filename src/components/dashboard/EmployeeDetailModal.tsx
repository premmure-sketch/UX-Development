import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import type { Employee } from '../../types'
import { STATUS_COLORS } from '../../data/mockData'

interface EmployeeDetailModalProps {
  employee: Employee | null
  open: boolean
  onClose: () => void
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  open,
  onClose,
}) => {
  const theme = useTheme()
  if (!employee) return null

  const statusStyle = STATUS_COLORS[employee.status] || STATUS_COLORS.Present

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Employee Dossier
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: theme.palette.divider }}>
        {/* Header Profile Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            alt={employee.name}
            src={employee.avatarUrl}
            sx={{
              width: 64,
              height: 64,
              fontSize: '1.5rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
            }}
          >
            {employee.name.split(' ').map((n) => n[0]).join('')}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {employee.name}
              </Typography>
              <Chip
                label={employee.status}
                size="small"
                sx={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {employee.role} • {employee.id}
            </Typography>
          </Box>
        </Box>

        {/* Detailed Grid */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                <CorporateFareOutlinedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Department</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee.department}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                <PlaceOutlinedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Assigned Location</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee.location}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                <BadgeOutlinedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Work Arrangement & Type</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee.workArrangement} ({employee.workType})
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.5 }}>
                <AccessTimeOutlinedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Today's Check-in</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {employee.checkInTime ? `${employee.checkInTime} (${employee.checkInLocation})` : 'Not Checked In'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Contact info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2">{employee.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PhoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2">{employee.phone}</Typography>
          </Box>
        </Box>

        {employee.leaveReason && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#8b5cf6', display: 'block', mb: 0.25 }}>
              Leave Telemetry Reason:
            </Typography>
            <Typography variant="body2" sx={{ color: '#8b5cf6' }}>
              {employee.leaveReason}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

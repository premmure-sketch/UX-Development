import React from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  useTheme,
  Chip,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeNav: string
  onSelectNav: (key: string) => void
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon, badge: 'Live' },
  { key: 'analytics', label: 'Analytics & Trends', icon: AssessmentOutlinedIcon },
  { key: 'attendance', label: 'Attendance Logs', icon: AccessTimeOutlinedIcon },
  { key: 'departments', label: 'Departments', icon: CorporateFareOutlinedIcon },
  { key: 'leave', label: 'Leave Management', icon: EventAvailableOutlinedIcon },
  { key: 'reports', label: 'Reports & Exports', icon: DescriptionOutlinedIcon },
  { key: 'settings', label: 'Settings', icon: TuneOutlinedIcon },
]

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  activeNav,
  onSelectNav,
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const drawerWidth = isCollapsed ? 76 : 260

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: isDark ? '#0e1422' : '#ffffff',
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden',
      }}
    >
      {/* Sidebar Header with Collapse Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : 2.5,
          py: 2,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!isCollapsed && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
              Platform Navigation
            </Typography>
          </Box>
        )}
        <Tooltip title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.key

          const button = (
            <ListItemButton
              onClick={() => {
                onSelectNav(item.key)
                onCloseMobile()
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.75,
                px: isCollapsed ? 1.5 : 2,
                py: 1.25,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive
                  ? isDark
                    ? 'rgba(99, 102, 241, 0.16)'
                    : 'rgba(79, 70, 229, 0.08)'
                  : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  backgroundColor: isActive
                    ? isDark
                      ? 'rgba(99, 102, 241, 0.24)'
                      : 'rgba(79, 70, 229, 0.12)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: isActive ? 'primary.main' : 'text.primary',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 'auto' : 36,
                  color: isActive ? 'primary.main' : 'inherit',
                  justifyContent: 'center',
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                      },
                    },
                  }}
                />
              )}
              {!isCollapsed && item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="success"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                />
              )}
            </ListItemButton>
          )

          return (
            <ListItem key={item.key} disablePadding>
              {isCollapsed ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Footer Status Widget */}
      {!isCollapsed ? (
        <Box sx={{ p: 2 }}>
          <Paper
            sx={{
              p: 1.75,
              borderRadius: 2.5,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                HRIS Sync Active
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.71875rem' }}>
              All biometric scanners, remote VPNs, and leave systems operational.
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Tooltip title="HRIS Telemetry Operational">
            <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
          </Tooltip>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 260,
          },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop Persistent / Collapsible Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 },
          display: { xs: 'none', lg: 'block' },
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            width: drawerWidth,
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {content}
        </Box>
      </Box>
    </>
  )
}

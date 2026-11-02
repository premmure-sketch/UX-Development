import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
  useTheme,
  Button,
  Chip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import HubIcon from '@mui/icons-material/Hub'
import CircleIcon from '@mui/icons-material/Circle'
import { useThemeContext } from '../../theme/ThemeContext'
import { MOCK_NOTIFICATIONS } from '../../data/mockData'

interface TopNavProps {
  onToggleSidebarMobile: () => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleSidebarMobile,
  searchValue,
  onSearchChange,
}) => {
  const theme = useTheme()
  const { mode, toggleTheme } = useThemeContext()

  // User menu state
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null)
  const isUserMenuOpen = Boolean(userAnchorEl)

  // Notification menu state
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null)
  const isNotificationOpen = Boolean(notificationAnchorEl)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: mode === 'dark' ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
        boxShadow: 'none',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 60, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
        {/* Left: Mobile hamburger & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onToggleSidebarMobile}
            sx={{ display: { lg: 'none' }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <HubIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    background:
                      mode === 'dark'
                        ? 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)'
                        : 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Stackly
                </Typography>
                <Chip
                  label="Enterprise"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.1)',
                    color: 'primary.main',
                    borderRadius: '4px',
                    display: { xs: 'none', sm: 'inline-flex' },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  mt: 0.25,
                }}
              >
                Workforce Intelligence & Attendance Platform
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center: Quick Search Bar */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            width: { md: 280, lg: 360 },
            border: `1px solid ${theme.palette.divider}`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: `0 0 0 2px ${mode === 'dark' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.15)'}`,
            },
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search employees, roles, departments..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            inputProps={{ 'aria-label': 'search workforce directory' }}
            sx={{
              width: '100%',
              fontSize: '0.875rem',
              color: 'text.primary',
            }}
          />
          {searchValue && (
            <Typography
              component="button"
              onClick={() => onSearchChange('')}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'text.secondary',
                fontSize: '0.75rem',
                p: 0,
                ml: 1,
                '&:hover': { color: 'text.primary' },
              }}
            >
              Clear
            </Typography>
          )}
        </Box>

        {/* Right: Telemetry pill, Theme toggle, Notifications, User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 } }}>
          {/* Live indicator */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 0.75,
              backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 2,
              px: 1.25,
              py: 0.5,
            }}
          >
            <CircleIcon sx={{ fontSize: 8, color: '#10b981', animation: 'pulse 2s infinite' }} />
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.71875rem' }}>
              Live Telemetry Active
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label="Toggle light/dark theme"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                width: 38,
                height: 38,
              }}
            >
              {mode === 'dark' ? (
                <LightModeOutlinedIcon sx={{ fontSize: 20, color: '#fbbf24' }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 20, color: '#475569' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
              color="inherit"
              aria-label="Open notifications"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                width: 38,
                height: 38,
              }}
            >
              <Badge badgeContent={unreadCount} color="error" variant="standard">
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notification Menu Popover */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={isNotificationOpen}
            onClose={() => setNotificationAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  width: 340,
                  maxHeight: 440,
                  mt: 1,
                  p: 0,
                  overflow: 'hidden',
                  borderRadius: 3,
                },
              },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Chip label={`${unreadCount} new`} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
                )}
              </Box>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', p: 0 }}>
                  Mark all read
                </Button>
              )}
            </Box>

            <Box sx={{ overflowY: 'auto', maxHeight: 340 }}>
              {notifications.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.75,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: item.unread
                      ? mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.08)'
                        : 'rgba(79, 70, 229, 0.04)'
                      : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="body2" sx={{ fontWeight: item.unread ? 700 : 500, fontSize: '0.8125rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.time}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Menu>

          {/* User Profile Avatar & Menu */}
          <Box
            onClick={(e) => setUserAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Avatar
              alt="Dr. Alistair Vance"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              sx={{
                width: 36,
                height: 36,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              AV
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Dr. Alistair Vance
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.71875rem' }}>
                VP of People Operations
              </Typography>
            </Box>
          </Box>

          {/* User Profile Popover */}
          <Menu
            anchorEl={userAnchorEl}
            open={isUserMenuOpen}
            onClose={() => setUserAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  width: 240,
                  mt: 1,
                  borderRadius: 3,
                  p: 0.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Dr. Alistair Vance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                alistair.vance@stackly.io
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />}
                  label="Executive Admin"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={() => setUserAnchorEl(null)}>
              <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => setUserAnchorEl(null)}>
              <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
              Platform Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setUserAnchorEl(null)} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

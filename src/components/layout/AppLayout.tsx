import React, { useState } from 'react'
import { Box, Container } from '@mui/material'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  searchValue,
  onSearchChange,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState('dashboard')

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation */}
      <TopNav
        onToggleSidebarMobile={handleDrawerToggle}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Responsive Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
        />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            minWidth: 0,
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 1 } }}>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useState } from 'react';
const nav = [{ label: 'Overview', icon: <DashboardRoundedIcon /> }, { label: 'People', icon: <PeopleAltRoundedIcon /> }, { label: 'Attendance', icon: <EventAvailableRoundedIcon /> }, { label: 'Reports & insights', icon: <BarChartRoundedIcon /> }];
export default function Sidebar() {
  const [active, setActive] = useState('Overview');
  return <Box component="aside" className="sidebar">
    <Box className="brand"><Box className="brand-mark"><PeopleAltRoundedIcon /></Box><Box><Typography fontWeight={800} fontSize={18} lineHeight={1.1}>peoplepulse</Typography><Typography variant="caption" color="text.secondary">WORKFORCE OS</Typography></Box></Box>
    <Typography className="nav-caption">WORKSPACE</Typography>
    <List disablePadding>{nav.map(item => <ListItemButton key={item.label} selected={active === item.label} onClick={() => setActive(item.label)} className="nav-item"><ListItemIcon>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}</List>
    <Divider sx={{ my: 2.5 }} /><Typography className="nav-caption">PREFERENCES</Typography>
    <List disablePadding><ListItemButton className="nav-item" onClick={() => setActive('Settings')} selected={active === 'Settings'}><ListItemIcon><SettingsRoundedIcon /></ListItemIcon><ListItemText primary="Settings" /></ListItemButton><ListItemButton className="nav-item" onClick={() => setActive('Help & support')} selected={active === 'Help & support'}><ListItemIcon><HelpOutlineRoundedIcon /></ListItemIcon><ListItemText primary="Help & support" /></ListItemButton></List>
    <Box className="sidebar-bottom"><Box className="help-card"><Typography fontWeight={700} fontSize={13}>Need a hand?</Typography><Typography variant="caption" color="text.secondary">Visit our help center for tips and guides.</Typography><Typography className="help-link">Open help center ↗</Typography></Box><Box className="profile"><Box className="avatar avatar-purple">JD</Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={700} fontSize={13}>Jordan Davis</Typography><Typography variant="caption" color="text.secondary">HR Administrator</Typography></Box><Typography color="text.secondary">•••</Typography></Box></Box>
  </Box>;
}

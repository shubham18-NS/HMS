import { AppBar, Box, Button, Container, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const drawerWidth = 280;

const navItemsByRole = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/patients', label: 'Patients', icon: <GroupsIcon /> },
    { to: '/doctors', label: 'Doctors', icon: <LocalHospitalIcon /> },
    { to: '/appointments', label: 'Appointments', icon: <EventIcon /> },
    { to: '/billing', label: 'Billing', icon: <ReceiptLongIcon /> },
  ],
  doctor: [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/patients', label: 'Patients', icon: <GroupsIcon /> },
    { to: '/doctors', label: 'My Availability', icon: <LocalHospitalIcon /> },
    { to: '/appointments', label: 'Appointments', icon: <EventIcon /> },
    { to: '/prescriptions', label: 'Prescriptions', icon: <MedicalServicesIcon /> },
  ],
  patient: [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/appointments', label: 'Appointments', icon: <EventIcon /> },
    { to: '/prescriptions', label: 'Prescriptions', icon: <MedicalServicesIcon /> },
    { to: '/billing', label: 'Billing', icon: <ReceiptLongIcon /> },
    { to: '/records', label: 'Medical Records', icon: <MedicalServicesIcon /> },
  ],
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = useMemo(() => navItemsByRole[user?.role] || navItemsByRole.patient, [user?.role]);

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #0f766e 100%)', color: 'white' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          HMS
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Hospital management platform
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            selected={location.pathname === item.to}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              color: 'rgba(255,255,255,0.9)',
              '&.active, &.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.14)',
              },
            }}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button fullWidth variant="contained" color="secondary" startIcon={<LogoutIcon />} onClick={logout} sx={{ color: 'white' }}>
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #eef7f6 0%, #f5f7fb 60%)' }}>
      <AppBar
        position="fixed"
        sx={{
          display: { md: 'none' },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={800}>
            HMS
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 0 } }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;

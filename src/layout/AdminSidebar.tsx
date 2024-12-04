import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link as RouterLink } from 'react-router-dom'; // Importa RouterLink para navegación

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  return (
    <Box
      sx={{
        width: isOpen ? '250px' : '70px',
        backgroundColor: '#37517e',
        color: '#ffffff',
        height: '100vh',
        transition: 'width 0.3s',
      }}
    >
      <List>
        {/* Dashboard */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/dashboard" // Cambia por la ruta correspondiente
            sx={{
              textDecoration: 'none',
              width: '100%',
              justifyContent: 'flex-start',
              padding: 0,
            }}
          >
            <ListItemIcon sx={{ marginLeft: 2 }}>
              <DashboardIcon sx={{ color: '#ffffff' }} />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Dashboard" sx={{ color: '#ffffff' }} />}
          </Button>
        </ListItem>

        {/* Settings */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/settings" // Cambia por la ruta correspondiente
            sx={{
              textDecoration: 'none',
              width: '100%',
              justifyContent: 'flex-start',
              padding: 0,
            }}
          >
            <ListItemIcon sx={{ marginLeft: 2 }}>
              <SettingsIcon sx={{ color: '#ffffff' }} />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Settings" sx={{ color: '#ffffff' }} />}
          </Button>
        </ListItem>

        <Divider sx={{ backgroundColor: '#ffffff' }} />

        {/* Logout */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/logout" // Cambia por la ruta correspondiente
            sx={{
              textDecoration: 'none',
              width: '100%',
              justifyContent: 'flex-start',
              padding: 0,
            }}
          >
            <ListItemIcon sx={{ marginLeft: 2 }}>
              <ExitToAppIcon sx={{ color: '#ffffff' }} />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Logout" sx={{ color: '#ffffff' }} />}
          </Button>
        </ListItem>
      </List>
    </Box>
  );
};

export default AdminSidebar;
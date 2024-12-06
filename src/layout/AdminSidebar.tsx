import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';

import { sidebarStyle } from '../styles/AdminStyles';

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const [managementOpen, setManagementOpen] = React.useState(false);

  const toggleManagementMenu = () => {
    setManagementOpen(!managementOpen);
  };

  return (
    <Box
      sx={{
        ...sidebarStyle,
        width: isOpen ? '250px' : '70px',
        transition: 'width 0.3s',
      }}
    >
      <List>
        {/* Dashboard */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/dashboard"
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

        {/* Management */}
        <ListItem disableGutters>
          <Button
            onClick={toggleManagementMenu}
            sx={{
              textDecoration: 'none',
              width: '100%',
              justifyContent: 'flex-start',
              padding: 0,
            }}
          >
            <ListItemIcon sx={{ marginLeft: 2 }}>
              <SecurityIcon sx={{ color: '#ffffff' }} />
            </ListItemIcon>
            {isOpen && <ListItemText primary="Management" sx={{ color: '#ffffff' }} />}
            {isOpen && (managementOpen ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />)}
          </Button>
        </ListItem>
        <Collapse in={managementOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/management/permissions"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                }}
              >
                <ListItemIcon sx={{ marginLeft: 4 }}>
                  <SecurityIcon sx={{ color: '#ffffff' }} />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Permissions" sx={{ color: '#ffffff' }} />}
              </Button>
            </ListItem>
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/management/roles"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                }}
              >
                <ListItemIcon sx={{ marginLeft: 4 }}>
                  <GroupIcon sx={{ color: '#ffffff' }} />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Roles" sx={{ color: '#ffffff' }} />}
              </Button>
            </ListItem>
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/management/users"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                }}
              >
                <ListItemIcon sx={{ marginLeft: 4 }}>
                  <MenuIcon sx={{ color: '#ffffff' }} />
                </ListItemIcon>
                {isOpen && <ListItemText primary="Users" sx={{ color: '#ffffff' }} />}
              </Button>
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ backgroundColor: '#ffffff' }} />

        {/* Settings */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/settings"
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

        {/* Logout */}
        <ListItem disableGutters>
          <Button
            component={RouterLink}
            to="/logout"
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

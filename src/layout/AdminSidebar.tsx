import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Collapse, } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';

import { Link as RouterLink, useLocation } from 'react-router-dom';

import { sidebarStyle } from '../styles/AdminStyles';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { fetchMenuByRole } from '../store/slices/menuSlice'; // Asegúrate de que este thunk exista

// JSON de menú dinámico
const menuItems = [
  {
    name: "Dashboard",
    icon: DashboardIcon, // Componente React
    route: "/dashboard",
    divider: false
  },
  {
    name: "Management",
    icon: SecurityIcon,
    divider: false,
    subMenu: [
      {
        name: "Permissions",
        icon: SecurityIcon,
        route: "/admin/permissions"
      },
      {
        name: "Actions",
        icon: BoltIcon,
        route: "/admin/actions"
      },
      {
        name: "Roles",
        icon: GroupIcon,
        route: "/admin/roles"
      },
      {
        name: "Menus",
        icon: MenuIcon,
        route: "/admin/menus"
      },
      {
        name: "Users",
        icon: PersonIcon,
        route: "/admin/users"
      }
    ]
  },
  {
    divider: true
  },
  {
    name: "Settings",
    icon: SettingsIcon,
    route: "/settings",
    divider: false
  },
  {
    name: "Logout",
    icon: ExitToAppIcon,
    route: "/logout",
    divider: false
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const { menus, isLoaded } = useAppSelector((state) => state.menus);
  const role = useAppSelector((state) => state.auth.userInfo?.role); // Obtén el rol del usuario
  const location = useLocation();

  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});
  

  // Cargar los menús al montar el componente
  useEffect(() => {
    if (!isLoaded && role) {
      dispatch(fetchMenuByRole(role)); // Pasa el rol al thunk
    }
  }, [dispatch, isLoaded, role]);

  const toggleSubMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path: string) => location.pathname === path;

  console.log('menus->', menus)

  return (
    <Box
      sx={{
        ...sidebarStyle,
        width: isOpen ? '250px' : '70px',
        transition: 'width 0.3s',
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <Divider sx={{ backgroundColor: '#ffffff' }} />
            ) : (
              <>
                <ListItem disableGutters>
                  <Button
                    component={RouterLink}
                    to={item.route || '#'}
                    onClick={item.subMenu ? () => toggleSubMenu(item.name) : undefined}
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: item.route && isActive(item.route) ? '#1e3a8a' : 'transparent',
                      '&:hover': { backgroundColor: '#314e8a' },
                    }}
                  >
                    <ListItemIcon sx={{ marginLeft: 2 }}>
                      {item.icon && (
                        <item.icon sx={{ color: isActive(item.route || '') ? '#ffffff' : '#b3c3df' }} />
                      )}
                    </ListItemIcon>
                    {isOpen && <ListItemText primary={item.name} sx={{ color: '#ffffff' }} />}
                    {isOpen && item.subMenu && (
                      openMenus[item.name] ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />
                    )}
                  </Button>
                </ListItem>
                {item.subMenu && (
                  <Collapse in={openMenus[item.name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disableGutters>
                          <Button
                            component={RouterLink}
                            to={subItem.route}
                            sx={{
                              textDecoration: 'none',
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: 0,
                              backgroundColor: isActive(subItem.route) ? '#1e3a8a' : 'transparent',
                              '&:hover': { backgroundColor: '#314e8a' },
                            }}
                          >
                            <ListItemIcon sx={{ marginLeft: 4 }}>
                              <subItem.icon sx={{ color: isActive(subItem.route) ? '#ffffff' : '#b3c3df' }} />
                            </ListItemIcon>
                            {isOpen && <ListItemText primary={subItem.name} sx={{ color: '#ffffff' }} />}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AdminSidebar;
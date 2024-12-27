import React, { useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Collapse,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/redux/hooks';
import { fetchMenuByRole } from '../store/slices/menuSlice'; // Asegúrate de que este thunk exista
import { sidebarStyle } from '../styles/AdminStyles';

interface MenuItem {
  _id: string; // ID único del menú
  label: string; // Etiqueta del menú
  path?: string; // Ruta asociada al menú
  icon?: string; // URL o nombre del ícono
  divider?: boolean; // Indica si es un divisor
  children?: MenuItem[]; // Submenús anidados
}

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const { menus, isLoaded } = useAppSelector((state) => state.menus);
  const location = useLocation();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});

  // Cargar los menús al montar el componente
  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchMenuByRole()); // Esto debe obtener los menús según el rol del usuario actual
    }
  }, [dispatch, isLoaded]);

  const toggleSubMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItems = (menuList: MenuItem[]) => {
    return menuList.map((menu) => (
      <React.Fragment key={menu._id}>
        {menu.divider ? (
          <Divider sx={{ backgroundColor: '#ffffff' }} />
        ) : (
          <>
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to={menu.path || '#'}
                onClick={menu.children ? () => toggleSubMenu(menu.label) : undefined}
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                  backgroundColor: menu.path && isActive(menu.path) ? '#1e3a8a' : 'transparent',
                  '&:hover': { backgroundColor: '#314e8a' },
                }}
              >
                <ListItemIcon sx={{ marginLeft: 2 }}>
                  {menu.icon && (
                    <img
                      src={menu.icon}
                      alt="icon"
                      style={{ width: 24, height: 24, color: isActive(menu.path || '') ? '#ffffff' : '#b3c3df' }}
                    />
                  )}
                </ListItemIcon>
                {isOpen && <ListItemText primary={menu.label} sx={{ color: '#ffffff' }} />}
                {isOpen && menu.children && (
                  openMenus[menu.label] ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />
                )}
              </Button>
            </ListItem>
            {menu.children && (
              <Collapse in={openMenus[menu.label]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItems(menu.children)}
                </List>
              </Collapse>
            )}
          </>
        )}
      </React.Fragment>
    ));
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
        {isLoaded ? renderMenuItems(menus) : <ListItemText primary="Loading..." sx={{ color: '#ffffff' }} />}
      </List>
    </Box>
  );
};

export default AdminSidebar;
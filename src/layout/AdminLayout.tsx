// AdminLayout.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Button,
  Collapse,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

import { Outlet, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { fetchMenus, fetchMenuByRole, fetchMenuTree } from '../store/slices/menuSlice';
import { logout, selectActiveCompanyVenue, selectCurrentRole } from '../store/slices/authSlice';
import { baseURL_MENUICONS } from '../utils/Parameters';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

interface MenuItem {
  _id?: string;
  component?: string;
  path?: string;
  icon: string | File;
  divider?: boolean;
  subMenus?: MenuItem[];
}

const filterMenuItems = (
  menuItems: MenuItem[],
  filter: { component: string; path: string }[]
): MenuItem[] => {
  return menuItems
    .map((item) => {
      if (item.divider) return item;
      const match = filter.some((f) => {
        const filterName = f.component?.toLowerCase() || '';
        const filterRoute = f.path?.toLowerCase() || '';
        const itemName = item.component?.toLowerCase() || '';
        const itemPath = item.path?.toLowerCase() || '';
        return filterName === itemName && filterRoute === itemPath;
      });
      const filteredSubMenu = item.subMenus ? filterMenuItems(item.subMenus, filter) : [];
      if (match || filteredSubMenu.length > 0) {
        return { ...item, icon: item.icon };
      }
      return null;
    })
    .filter((item): item is MenuItem => item !== null);
};

// const logoutItem: MenuItem = {
//   component: 'Logout',
//   icon: 'uploads\\menuicons\\logout.png',
//   path: '/logout',
//   divider: false,
// };

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { menusRoles, menusTrees, isMenuLoaded, isMenuByRoleLoaded, isMenuTreeLoaded } = useAppSelector((state) => state.menus);
  const { activeCompanyId, activeVenueId } = useAppSelector(selectActiveCompanyVenue);
  const role = useAppSelector(selectCurrentRole);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const expandedWidth = 240;
  const collapsedWidth = 60;
  const drawerWidth = isSidebarCollapsed ? collapsedWidth : expandedWidth;

  useEffect(() => {
    if (activeCompanyId) {
      if (!isMenuLoaded) dispatch(fetchMenus({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
      if (!isMenuByRoleLoaded && role) dispatch(fetchMenuByRole({ role, companyId: activeCompanyId, venueId: activeVenueId || undefined }));
      if (!isMenuTreeLoaded) dispatch(fetchMenuTree({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
    }
  }, [dispatch, isMenuLoaded, isMenuByRoleLoaded, isMenuTreeLoaded, role, activeCompanyId, activeVenueId]);

  const toggleSubMenu = (name: string | undefined) => {
    if (name) setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path: string) => location.pathname === path;
  const deepCopyMenuItems = JSON.parse(JSON.stringify(menusTrees));
  let filteredMenus = filterMenuItems(deepCopyMenuItems, menusRoles.map((menu) => ({ component: menu.component, path: menu.path })));
  filteredMenus = [...filteredMenus, ];

  const getIconUrl = (iconPath: string) => iconPath ? `${baseURL_MENUICONS}/${iconPath}` : '';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const drawer = (
    <Box sx={{ backgroundColor: '#37517e', height: '100%', color: '#fff' }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#ffffff',
            transition: 'opacity 0.3s',
            opacity: isSidebarCollapsed ? 0 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          STARPOS.AI
        </Typography>
      </Toolbar>
      <List>
        {filteredMenus.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <Divider sx={{ backgroundColor: '#ffffff' }} />
            ) : (
              <>
                <ListItem disableGutters>
                  <Button
                    component={RouterLink}
                    to={item.path || '#'}
                    onClick={() => {
                      if (item.component === 'Logout') {
                        dispatch(logout());
                        navigate('/login');
                        return;
                      }
                      if (item.subMenus) toggleSubMenu(item.component);
                      else if (isMobile) handleDrawerToggle();
                    }}
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: item.path && isActive(item.path) ? '#1e3a8a' : 'transparent',
                      '&:hover': { backgroundColor: '#314e8a' },
                    }}
                  >
                    <ListItemIcon sx={{ marginLeft: 2 }}>
                      {typeof item.icon === 'string' && (
                        <img
                          src={getIconUrl(item.icon)}
                          alt={`${item.component}-icon`}
                          style={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(2) contrast(1.2)', marginTop: 5 }}
                        />
                      )}
                    </ListItemIcon>
                    {!isSidebarCollapsed && <ListItemText primary={item.component} sx={{ color: '#ffffff', fontSize: '12px' }} />}
                    {!isSidebarCollapsed && item.subMenus && (openMenus[item.component ?? ''] ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />)}
                  </Button>
                </ListItem>
                {item.subMenus && (
                  <Collapse in={openMenus[item.component ?? '']} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenus.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disableGutters>
                          <Button
                            component={RouterLink}
                            to={subItem.path || '#'}
                            sx={{
                              textDecoration: 'none',
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: 0,
                              backgroundColor: isActive(subItem.path ?? '') ? '#1e3a8a' : 'transparent',
                              '&:hover': { backgroundColor: '#314e8a' },
                            }}
                            onClick={() => isMobile && handleDrawerToggle()}
                          >
                            <ListItemIcon sx={{ marginLeft: isSidebarCollapsed ? 'auto' : 2 }}>
                              {typeof subItem.icon === 'string' && (
                                <img
                                  src={getIconUrl(subItem.icon)}
                                  alt={`${subItem.component}-icon`}
                                  style={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(2) contrast(1.2)', marginTop: 5 }}
                                />
                              )}
                            </ListItemIcon>
                            {!isSidebarCollapsed && (
                              <ListItemText primary={subItem.component} sx={{ color: '#ffffff', fontSize: '11px', pl: 1 }} />
                            )}
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#ffffff',
          color: '#37517e',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={isMobile ? handleDrawerToggle : toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: '#666' }}>
            Panel de Administración
          </Typography>

          <Tooltip title="Cerrar sesión" arrow>
            <IconButton
              color="inherit"
              onClick={() => {
                if (confirm('¿Estás seguro de cerrar sesión?')) {
                  dispatch(logout());
                  navigate('/login');
                }
              }}
              sx={{ marginLeft: 'auto' }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>


        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="sidebar menu">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: 'width 0.3s ease',
              boxSizing: 'border-box',
              backgroundColor: '#37517e',
              color: '#fff',
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box 
        component="main" 
        sx={{
          flexGrow: 1,
          p: {
            xs: 1.5, // padding móvil
            sm: 2,   // padding tablet
            md: 3    // padding desktop
          },
          width: {
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)`
          },
          mt: { xs: '56px', sm: '64px' }, // corrige espacio según AppBar
          backgroundColor: '#f4f6f9',
          minHeight: '100vh',
        }}
        >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
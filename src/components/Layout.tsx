import { useState } from 'react';
import { useLocation, Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import BreadcrumbsNav from './BreadcrumbsNav';

const drawerWidth = 240;

export default function Layout() {
  const location = useLocation();
  const [openInventory, setOpenInventory] = useState(false);

  const handleInventoryClick = () => {
    setOpenInventory(!openInventory);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#333333' }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="menu" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            STARPOSAI
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1c1c1c', color: '#fff' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* Dashboard */}
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                  backgroundColor: location.pathname === '/' ? '#333333' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#555555',
                  },
                }}
              >
                <ListItemIcon sx={{ marginLeft: 2 }}>
                  <DashboardIcon sx={{ color: '#fff' }} />
                </ListItemIcon>
                <ListItemText primary="Dashboard" sx={{ color: location.pathname === '/' ? '#00ff00' : '#fff' }} />
              </Button>
            </ListItem>

            {/* Clientes */}
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/clients"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                  backgroundColor: location.pathname === '/clients' ? '#333333' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#555555',
                  },
                }}
              >
                <ListItemIcon sx={{ marginLeft: 2 }}>
                  <PeopleIcon sx={{ color: '#fff' }} />
                </ListItemIcon>
                <ListItemText primary="Clientes" sx={{ color: location.pathname === '/clients' ? '#00ff00' : '#fff' }} />
              </Button>
            </ListItem>

            {/* Inventario con Submenú */}
            <ListItem disableGutters onClick={handleInventoryClick}>
              <ListItemIcon sx={{ marginLeft: 2 }}>
                <InventoryIcon sx={{ color: '#fff' }} />
              </ListItemIcon>
              <ListItemText primary="Inventario" sx={{ color: '#fff' }} />
              {openInventory ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
            </ListItem>
            <Collapse in={openInventory} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disableGutters sx={{ pl: 4 }}>
                  <Button
                    component={RouterLink}
                    to="/inventory/products"
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: location.pathname === '/inventory/products' ? '#333333' : 'transparent',
                      '&:hover': { backgroundColor: '#555555' },
                    }}
                  >
                    <ListItemText primary="Productos" sx={{ color: location.pathname === '/inventory/products' ? '#00ff00' : '#fff' }} />
                  </Button>
                </ListItem>
                <ListItem disableGutters sx={{ pl: 4 }}>
                  <Button
                    component={RouterLink}
                    to="/inventory/categories"
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: location.pathname === '/inventory/categories' ? '#333333' : 'transparent',
                      '&:hover': { backgroundColor: '#555555' },
                    }}
                  >
                    <ListItemText primary="Categorías" sx={{ color: location.pathname === '/inventory/categories' ? '#00ff00' : '#fff' }} />
                  </Button>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f9f9f9', minHeight: '100vh' }}>
        <Toolbar />
        {/* Agregar Breadcrumbs */}
        <BreadcrumbsNav />
        {/* Cargar contenido dinámico */}        
        <Outlet />
      </Box>
    </Box>
  );
}
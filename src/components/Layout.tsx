import { useLocation, Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

export default function Layout() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra de navegación superior */}
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

      {/* Menú lateral */}
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
                  backgroundColor: location.pathname === '/dashboard' ? '#333333' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#555555',
                  },
                }}
              >
                <ListItemIcon sx={{ marginLeft: 2 }}>
                  <DashboardIcon sx={{ color: location.pathname === '/dashboard' ? '#00ff00' : '#fff' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{
                    color: location.pathname === '/' ? '#00ff00' : '#fff',
                  }}
                />
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
                  <PeopleIcon sx={{ color: location.pathname === '/clients' ? '#00ff00' : '#fff' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Clientes"
                  sx={{
                    color: location.pathname === '/clients' ? '#00ff00' : '#fff',
                  }}
                />
              </Button>
            </ListItem>

            {/* Inventario */}
            <ListItem disableGutters>
              <Button
                component={RouterLink}
                to="/inventory"
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 0,
                  backgroundColor: location.pathname === '/inventory' ? '#333333' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#555555',
                  },
                }}
              >
                <ListItemIcon sx={{ marginLeft: 2 }}>
                  <InventoryIcon sx={{ color: location.pathname === '/inventory' ? '#00ff00' : '#fff' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Inventario"
                  sx={{
                    color: location.pathname === '/inventory' ? '#00ff00' : '#fff',
                  }}
                />
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f9f9f9', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

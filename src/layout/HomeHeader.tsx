import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';

const navLinks = [
  { title: 'Home', path: '#hero' },
  { title: 'About', path: '#about' },
  { title: 'Services', path: '#services' },
  { title: 'Pricing', path: '#pricing' },
  { title: 'Contact', path: '#contact' }
];

const HomeHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#37517e', // Estilo Arsha
          boxShadow: 'none',
          fontFamily: "'Open Sans', sans-serif"
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}
          >
            STARPOS.AI
          </Typography>

          {/* Botón hamburguesa en móvil */}
          {isMobile ? (
            <IconButton
              edge="end"
              onClick={handleDrawerToggle}
              aria-label="menu"
              sx={{ color: '#fff' }}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          ) : (
            // Menú de escritorio
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {navLinks.map((item) => (
                <Button
                  key={item.title}
                  href={item.path}
                  sx={{
                    color: '#fff',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      color: '#0dcaf0'
                    }
                  }}
                >
                  {item.title}
                </Button>
              ))}
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  backgroundColor: '#0ea5e9',
                  color: '#fff',
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#0284c7'
                  }
                }}
              >
                SIGN IN
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para móviles */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: '#37517e',
            color: '#fff',
            width: '70vw',
            padding: 2
          }
        }}
      >
        <List>
          {navLinks.map((item) => (
            <ListItem key={item.title} disablePadding onClick={handleDrawerToggle}>
              <ListItemButton component="a" href={item.path}>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 500 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/login"
              sx={{
                bgcolor: '#0ea5e9',
                color: '#fff',
                borderRadius: 1,
                justifyContent: 'center',
                mt: 2,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#0284c7'
                }
              }}
            >
              SIGN IN
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default HomeHeader;
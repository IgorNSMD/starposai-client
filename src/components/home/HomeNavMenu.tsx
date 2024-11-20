import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Drawer,
  IconButton,
} from '@mui/material';
import { ExpandMore, ExpandLess, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { navMenuStyle } from '../../styles/HomeStyles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const HomeNavMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subAnchorEl, setSubAnchorEl] = useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detecta si es móvil (menos de 'md')

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSubAnchorEl(null);
  };

  const handleOpenSubMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSubAnchorEl(event.currentTarget);
  };

  const handleCloseSubMenu = () => {
    setSubAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open);
  };

  // Renderiza el menú completo
  const renderMenu = () => (
    <List sx={navMenuStyle}>
      <ListItem disablePadding>
        <ListItemButton href="#hero">
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#about">
          <ListItemText primary="About" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#services">
          <ListItemText primary="Services" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#portfolio">
          <ListItemText primary="Portfolio" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#team">
          <ListItemText primary="Team" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton href="#pricing">
          <ListItemText primary="Pricing" />
        </ListItemButton>
      </ListItem>

      {/* Dropdown */}
      <ListItem disablePadding>
        <ListItemButton onClick={handleOpenMenu}>
          <ListItemText primary="Dropdown" />
          {anchorEl ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#3d4d6a',
              color: '#ffffff',
              boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
            },
          }}
        >
          <MenuItem onClick={handleCloseMenu}>Dropdown 1</MenuItem>
          <MenuItem onClick={handleOpenSubMenu}>
            Deep Dropdown {subAnchorEl ? <ExpandLess /> : <ExpandMore />}
          </MenuItem>
          <Menu
            anchorEl={subAnchorEl}
            open={Boolean(subAnchorEl)}
            onClose={handleCloseSubMenu}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#3d4d6a',
                color: '#ffffff',
                boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
              },
            }}
            transformOrigin={{
              horizontal: 'left',
              vertical: 'top',
            }}
            anchorOrigin={{
              horizontal: 'right',
              vertical: 'top',
            }}
          >
            <MenuItem onClick={handleCloseSubMenu}>Deep Dropdown 1</MenuItem>
            <MenuItem onClick={handleCloseSubMenu}>Deep Dropdown 2</MenuItem>
          </Menu>
          <MenuItem onClick={handleCloseMenu}>Dropdown 2</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Dropdown 3</MenuItem>
        </Menu>
      </ListItem>

      <ListItem disablePadding>
        <ListItemButton href="#contact">
          <ListItemText primary="Contact" />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <Box component="nav" id="navmenu" sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {isMobile ? (
        <>
          <IconButton onClick={toggleDrawer(true)} sx={{ color: theme.palette.secondary.main, ml: 'auto' }}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
            <Box
              sx={{ width: 250, p: 2, bgcolor: theme.palette.background.default, height: '100%' }}
              role="presentation"
              onClick={toggleDrawer(false)}
            >
              <IconButton sx={{ mb: 2 }}>
                <CloseIcon />
              </IconButton>
              {renderMenu()}
            </Box>
          </Drawer>
        </>
      ) : (
        renderMenu()
      )}
    </Box>
  );
};

export default HomeNavMenu;
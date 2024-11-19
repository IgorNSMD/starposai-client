import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { navMenuStyle } from '../../styles/HomeStyles';

const HomeNavMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [subAnchorEl, setSubAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenSubMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSubAnchorEl(event.currentTarget);
  };

  const handleCloseSubMenu = () => {
    setSubAnchorEl(null);
  };

  return (
    <Box component="nav" id="navmenu" sx={{ position: 'relative', display: 'flex' }}>
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
                backgroundColor: '#3d4d6a', // Fondo del menú principal
                color: '#ffffff', // Texto blanco
                boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
                borderRadius: '6px',
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={handleCloseMenu}>Dropdown 1</MenuItem>
            <MenuItem onClick={handleOpenSubMenu}>
              Deep Dropdown {subAnchorEl ? <ExpandLess /> : <ExpandMore />}
            </MenuItem>
            {/* Sub Dropdown */}
            <Menu
              anchorEl={subAnchorEl}
              open={Boolean(subAnchorEl)}
              onClose={handleCloseSubMenu}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: '#3d4d6a',
                  color: 'black',
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
    </Box>
  );
};

export default HomeNavMenu;
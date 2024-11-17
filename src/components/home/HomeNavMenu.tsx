import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

import { navMenuStyle } from '../../styles/HomeStyles';

const HomeNavMenu: React.FC = () => {
  const [openDropdown, setOpenDropdown] = React.useState(false);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  return (
    <Box component="nav" id="navmenu" sx={navMenuStyle}>
      <List sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, padding: 0 }}>
        <ListItem disablePadding>
          <ListItemButton href="#hero" className="active">
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
          <ListItemButton onClick={toggleDropdown}>
            <ListItemText primary="Dropdown" />
            {openDropdown ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          {openDropdown && (
            <List sx={{ pl: 2 }}>
              <ListItem disablePadding>
                <ListItemButton href="#">
                  <ListItemText primary="Dropdown 1" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton href="#">
                  <ListItemText primary="Deep Dropdown" />
                </ListItemButton>
                {/* Sub-dropdown */}
                <List sx={{ pl: 2 }}>
                  <ListItem disablePadding>
                    <ListItemButton href="#">
                      <ListItemText primary="Deep Dropdown 1" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton href="#">
                      <ListItemText primary="Deep Dropdown 2" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </ListItem>
            </List>
          )}
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="#contact">
            <ListItemText primary="Contact" />
          </ListItemButton>
        </ListItem>
      </List>
      {/* Toggle for mobile view */}
      <IconButton className="mobile-nav-toggle d-xl-none">
        <i className="bi bi-list" />
      </IconButton>
    </Box>
  );
};

export default HomeNavMenu;

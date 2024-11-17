import React from 'react';
import { Box, Button, Typography } from '@mui/material';

import { headerStyle, containerStyle } from '../../styles/HomeStyles';
import HomeNavMenu from './HomeNavMenu';

const HomeHeader: React.FC = () => {
  return (
    <Box component="header" sx={headerStyle}>
      <Box sx={containerStyle}>
          {/* Logo */}
          <Box className="logo">
            {/* <img src="/logo.png" alt="Logo" /> */}
            <Typography component="h1">STARPOS.AI</Typography>
          </Box>
          <Box className="navmenu">
            {/* Contenido del menú de navegación */}
            <HomeNavMenu />
          </Box>
          <Button className="btn-getstarted">Get Started</Button>
      </Box>
    </Box>
  );
};

export default HomeHeader;

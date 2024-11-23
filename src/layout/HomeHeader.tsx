import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { headerStyle, containerStyle } from '../styles/HomeStyles';
//import HomeNavMenu from './HomeNavMenu';

const HomeHeader: React.FC = () => {
  return (
    <Box component="header" sx={headerStyle}>
      <Box sx={containerStyle}>
          {/* Logo */}
          <Box className="logo">
            <Typography component="h1">STARPOS.AI</Typography>
          </Box>

          {/* Contenido del menú de navegación */}
          {/* <Box className="navmenu">
            <HomeNavMenu />
          </Box> */}

          <Button 
            className="btn-getstarted"
            component={RouterLink}
            to="/login" // Ruta definida en tus rutas
            >Sign in</Button>
      </Box>
    </Box>
  );
};

export default HomeHeader;

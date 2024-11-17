import React from 'react';
import { Box, Typography } from '@mui/material';

import { headerStyle, containerStyle } from '../../styles/HomeStyles';

const HomeHeader: React.FC = () => {
  return (
    <Box component="header" sx={headerStyle}>
      <Box sx={containerStyle}>
          {/* Logo */}
          <Box className="logo">
            {/* <img src="/logo.png" alt="Logo" /> */}
            <Typography component="h1">STARPOS.AI</Typography>
          </Box>
      </Box>
    </Box>
  );
};

export default HomeHeader;

import React from 'react';
import { Box, Typography } from '@mui/material';
import { homeSectionStyle, heroImgStyle } from '../../styles/HomeStyles';

const HomeSection: React.FC = () => {
  return (
    <Box sx={homeSectionStyle}>
      <Box
        sx={{
          maxWidth: '1200px', // Ajusta según el diseño deseado
          width: '100%',
          padding: '16px', // Espaciado interno
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
          alignItems: 'center',
        }}
      >
        {/* Texto principal */}
        <Box>
          <Typography variant="h2">Better Solutions For Your Business</Typography>
          <Typography variant="body1">
            We are team of talented designers making websites with Bootstrap
          </Typography>
        </Box>
        {/* Imagen */}
        <Box sx={heroImgStyle}>
          <img src="assets/img/hero-img.png" alt="Hero" style={{ width: '100%' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default HomeSection;
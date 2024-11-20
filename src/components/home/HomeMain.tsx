import React from 'react';
import { Box } from '@mui/material';
import { mainStyle, sectionStyle, darkBackgroundStyle } from '../../styles/HomeStyles';

const HomeMain: React.FC = () => {
  return (
    <Box component="main" sx={mainStyle}>
       <Box
            component="section"
            id="hero"
            sx={(theme) => ({
                ...sectionStyle(theme),
                ...darkBackgroundStyle(theme),
            })}
        >
            {/* Contenido del Hero */}
        </Box>
      {/* Otras secciones */}
    </Box>
  );
};

export default HomeMain;

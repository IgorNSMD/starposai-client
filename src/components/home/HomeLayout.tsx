import React from 'react';
import { Box } from '@mui/material';

import { homeContainer } from '../../styles/HomeStyles';

import HomeHeader from './HomeHeader';
import HomeMain from './HomeMain';

const HomeLayout: React.FC = () => {
  return (
    <Box sx={homeContainer}>
      <HomeHeader/>
      <HomeMain />
      
      {/* <Typography variant="h2">Better Solutions For Your Business</Typography>
      <Typography variant="subtitle1">
        We are a team of talented designers making websites with Bootstrap
      </Typography> */}
    </Box>
  );
};

export default HomeLayout;
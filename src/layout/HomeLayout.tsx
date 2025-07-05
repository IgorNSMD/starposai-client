import React from 'react';
import { Box } from '@mui/material';

//import { homeContainer } from '../styles/HomeStyles';

import HomeHeader from './HomeHeader';
import HomeMain from './HomeMain';

const HomeLayout: React.FC = () => {
  return (
    <>
      <Box sx={{ overflowX: "hidden" }}>
        <HomeHeader/>
        <HomeMain />
      </Box>    
      
    </>


  );
};

export default HomeLayout;
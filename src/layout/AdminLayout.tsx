import React from 'react';
import { Box } from '@mui/material';
import { dashboardContainer, sidebarStyle, mainContentStyle } from '../styles/DashboardStyles';

const DashboardLayout: React.FC = () => {
  return (
    <Box sx={dashboardContainer}>
      {/* Sidebar */}
      <Box sx={sidebarStyle}>
        <h2>Dashboard</h2>
        <ul>
          <li>Overview</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>
      </Box>

      {/* Main Content */}
      <Box sx={mainContentStyle}>
        <h1>Welcome to the Dashboard</h1>
        {/* Aquí puedes añadir contenido dinámico */}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
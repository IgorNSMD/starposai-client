import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { dashboardContainer, mainContentStyle } from '../styles/AdminStyles';


const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={dashboardContainer}>
      <CssBaseline />
      <AdminSidebar isOpen={isSidebarOpen} />
      <Box sx={{ ...mainContentStyle, marginLeft: isSidebarOpen ? '250px' : '70px' }}>
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Box sx={{ padding: '20px' }}>
          <Outlet /> {/* Renderiza las rutas hijas aquí */}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

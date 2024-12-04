import React, { useState, ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { dashboardContainer, mainContentStyle } from '../styles/AdminStyles';

// Define las props que acepta AdminLayout
interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
        <Box sx={{ padding: '20px' }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

import React, { useEffect, useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { dashboardContainer, mainContentStyle } from '../styles/AdminStyles';


const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detecta si es móvil
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile); // ✅ Sidebar cerrado en móviles

  useEffect(() => {
    setSidebarOpen(!isMobile); // ✅ Ajusta la visibilidad del Sidebar cuando cambia el tamaño de pantalla
  }, [isMobile]);

  const toggleSidebar = () => {
    console.log("Toggling sidebar...");
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={dashboardContainer}>
      <CssBaseline />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Box sx={{ 
        ...mainContentStyle, 
        marginLeft: isSidebarOpen && !isMobile ? '250px' : '0px', // ✅ Ajuste más claro
        }}>
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Box sx={{ padding: '20px' }}>
          <Outlet /> {/* Renderiza las rutas hijas aquí */}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

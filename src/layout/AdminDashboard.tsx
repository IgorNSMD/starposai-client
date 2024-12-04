import React from 'react';
import { Typography, Box } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4">Bienvenido al Dashboard</Typography>
      <Typography variant="body1">Seleccione una opción del menú para comenzar.</Typography>
    </Box>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import { formContainer_v2, formTitle, inputContainer, mainContentStyle } from '../../styles/AdminStyles';
import GeneralSettings from './GeneralSettings'; // Componente para General Settings

const TabPanel: React.FC<{
  value: number;
  index: number;
  children: React.ReactNode; // Aquí definimos el tipo de `children`
}> = ({ value, index, children }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ padding: '16px' }} // Opcional: estilo para tab
    >
      {value === index && children}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={formContainer_v2}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          Settings
        </Typography>
        <Box sx={{
                  ...inputContainer,
                  flexDirection: 'column', // Forzar vertical en pantallas pequeñas
                  '@media (max-width: 600px)': {
                    padding: '10px',
                  },
                }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: '#37517e', // Azul suave para texto de pestañas inactivas
                fontWeight: '500',
                padding: '10px 20px',
                transition: 'background-color 0.3s ease, color 0.3s ease',
                borderBottom: '1px solid #ddd', // Línea sutil para separar
                borderRadius: '4px 4px 0 0',
                '&:hover': {
                  backgroundColor: '#f0f7ff', // Fondo claro al pasar el mouse
                  color: '#1e3a8a', // Azul más fuerte al pasar el mouse
                },
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#ffffff', // Texto blanco para la pestaña activa
                backgroundColor: '#37517e', // Fondo azul para la pestaña activa
                fontWeight: 'bold', // Más peso para la pestaña activa
                borderBottom: 'none', // Quitar línea inferior
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#37517e', // Indicador azul oscuro para la pestaña activa
                height: '3px',
              },
            }}
          >
            <Tab label="General" />
            {/* 
            <Tab label="Sales" />
            <Tab label="Product" />
            <Tab label="Notification" />
            <Tab label="Fiscal" /> 
            */}
            
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <GeneralSettings />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography>Sales Settings Content</Typography>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Typography>Product Settings Content</Typography>
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Typography>Notification Settings Content</Typography>
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <Typography>Fiscal Settings Content</Typography>
        </TabPanel>         
       

      </Paper>
    </Box>
  );
};

export default SettingsPage;
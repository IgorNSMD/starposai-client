import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper } from '@mui/material';
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
        <Box sx={inputContainer}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="General Settings" />
            <Tab label="Sales Settings" />
            <Tab label="Product Settings" />
            <Tab label="Notification Settings" />
            <Tab label="Fiscal Settings" />
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
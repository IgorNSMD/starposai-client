import { SxProps, Theme } from '@mui/material/styles';

export const dashboardContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  backgroundColor: '#f9f9f9',
};

export const sidebarStyle: SxProps<Theme> = {
  //width: '250px',
  backgroundColor: '#37517e',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  position: 'fixed', // Para mantener el Sidebar fijo
  top: '64px', // Altura del Header
  height: 'calc(100vh - 64px)', // Resta la altura del Header
  overflowY: 'auto',
};

export const headerStyle: SxProps<Theme> = {
  height: '64px',
  backgroundColor: '#37517e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  width: '100%',
  zIndex: 1100, // Asegura que el Header esté sobre el Sidebar
};

export const mainContentStyle: SxProps<Theme> = {
  flexGrow: 1,
  padding: '20px',
  overflow: 'auto',
};
import { SxProps, Theme } from '@mui/material/styles';

export const dashboardContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  backgroundColor: '#f9f9f9',
};

export const sidebarStyle: SxProps<Theme> = {
  width: '250px',
  backgroundColor: '#37517e',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
};

export const mainContentStyle: SxProps<Theme> = {
  flexGrow: 1,
  padding: '20px',
  overflow: 'auto',
};
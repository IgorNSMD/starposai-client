import React,{ Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import App from './App';
import homeTheme from './styles/HomeTheme';
import dashboardTheme from './styles/DashboardTheme';

const isAuthenticated = false; // Cambia según tu lógica de autenticación

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <ThemeProvider theme={isAuthenticated ? dashboardTheme : homeTheme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ':root': {
              scrollBehavior: 'smooth',
            },
          }}
        />
        <App />
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>
);
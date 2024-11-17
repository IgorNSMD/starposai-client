import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import App from './App';
import homeTheme from './styles/HomeTheme';
import dashboardTheme from './styles/DashboardTheme';

const isAuthenticated = false; // Cambia según tu lógica de autenticación

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={isAuthenticated ? dashboardTheme : homeTheme}>
      <CssBaseline />
      {!isAuthenticated && (
        <GlobalStyles
          styles={{
            ':root': {
              scrollBehavior: 'smooth',
            },
            body: {
              color: '#444444', // --default-color
              backgroundColor: '#f5f6f8', // Fondo claro por defecto
              fontFamily: '"Open Sans", sans-serif', // Fuente predeterminada
            },
            a: {
              color: '#47b2e4', // Color de enlaces
              textDecoration: 'none',
              transition: '0.3s',
            },
            'a:hover': {
              color: 'rgba(71, 178, 228, 0.75)', // Simula color-mix
              textDecoration: 'none',
            },
            'h6': {
              color: '#ffffff', // --heading-color
              fontFamily: '"Jost", sans-serif', // --heading-font
            },
            
          }}
        />
      )}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

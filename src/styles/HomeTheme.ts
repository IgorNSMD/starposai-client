import { createTheme } from '@mui/material/styles';

const homeTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#3d4d6a', // Fondo claro
      paper: '#ffffff', // Superficie clara
    },
    text: {
      primary: '#444444', // Texto principal
      secondary: '#ffffff', // Encabezados
    },
    primary: {
      main: '#47b2e4', // Color principal
    },
    secondary: {
      main: '#f5f6f8', // Color secundario
    },
    error: {
      main: '#ff5252',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: '#6b6b6b',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.14)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    grey: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#6c757d',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#121416',
    },
    common: {
      black: '#000000',
      white: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    h1: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 700,
      color: '#37517e',
    },
    body1: {
      //color: '#ffffff', // Texto del cuerpo
    },
    h6: {
      color: '#ffffff', // Usado para headers más pequeños
      fontFamily: '"Jost", sans-serif',
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#47b2e4',
          textDecoration: 'none',
          transition: '0.3s',
          '&:hover': {
            color: 'rgba(71, 178, 228, 0.75)',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#1976d2',
          '&.Mui-checked': {
            color: '#1565c0',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#1976d2',
          '&.Mui-checked': {
            color: '#1565c0',
          },
          '&:hover': {
            backgroundColor: 'rgba(21, 101, 192, 0.04)',
          },
        },
      },
    },    
  },
});

export default homeTheme;
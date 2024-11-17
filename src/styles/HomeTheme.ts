import { createTheme } from '@mui/material/styles';

const homeTheme = createTheme({
  palette: {
    mode: 'light', // Cambia a 'dark' si necesitas un tema oscuro
    background: {
      default: '#f5f6f8', // Fondo claro
      paper: '#ffffff', // Superficie clara
    },
    text: {
      primary: '#444444', // Texto principal
      secondary: '#37517e', // Encabezados
    },
    primary: {
      main: '#47b2e4', // Color principal
    },
    secondary: {
      main: '#ffffff', // Color secundario
    },
    darkBackground: {
      default: '#37517e', // Fondo oscuro
      surface: '#4668a2', // Superficie oscura
      textPrimary: '#ffffff', // Texto principal oscuro
      heading: '#ffffff', // Encabezados oscuros
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
      color: '#444444', // Texto del cuerpo
    },
  },
});

export default homeTheme;
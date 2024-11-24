import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  palette: {
    background: {
      default: '#f9f9f9', // Fondo gris claro para Dashboard
    },
    text: {
      primary: '#333333', // Texto oscuro
      secondary: '#555555', // Subtítulos
    },
    primary: {
      main: '#37517e', // Color primario del Dashboard
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Poppins", "Jost", sans-serif',
    h1: {
      fontFamily: '"Jost", sans-serif',
      fontWeight: 700,
    },
    body1: {
      fontFamily: '"Open Sans", sans-serif',
    },
  },
});

export default adminTheme;
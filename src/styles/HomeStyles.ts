import { SxProps, Theme } from '@mui/material/styles';

// Header Styles
export const headerStyle: SxProps<Theme> = {
  color: '#444444', // Color por defecto para el texto
  backgroundColor: '#3d4d6a', // Fondo del header
  padding: '15px 0', // Espaciado interno superior e inferior
  transition: 'all 0.5s', // Transición suave para cambios visuales
  zIndex: 997, // Asegura que el header esté sobre otros elementos
  position: 'fixed', // Fijado en la parte superior
  top: 0,
  left: 0,
  width: '100%', // Ocupa todo el ancho
  display: 'flex', // Diseño flexible
  alignItems: 'center', // Centrado vertical del contenido
  justifyContent: 'space-between', // Distribución horizontal con espacio entre elementos

  // Estilos contextuales
  '.logo': {
    lineHeight: 1,
    img: {
      maxHeight: '36px',
      marginRight: '8px',
    },
    h1: {
      fontSize: '30px',
      margin: 0,
      fontWeight: 500,
      color: '#ffffff', // var(--heading-color)
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
  },

  '.btn-getstarted, .btn-getstarted:focus': {
    color: '#ffffff', // var(--contrast-color)
    backgroundColor: '#47b2e4', // var(--accent-color)
    fontSize: '14px',
    padding: '8px 25px',
    margin: '0 0 0 30px',
    borderRadius: '50px',
    transition: '0.3s',
  },

  '.btn-getstarted:hover, .btn-getstarted:focus:hover': {
    color: '#ffffff', // var(--contrast-color)
    backgroundColor: 'rgba(71, 178, 228, 0.85)', // Simula color-mix
  },
};

// Button Get Started Style
export const btnGetStartedStyle: SxProps<Theme> = {
  color: '#ffffff', // --contrast-color
  backgroundColor: '#47b2e4', // --accent-color
  fontSize: '14px',
  padding: '8px 25px',
  marginLeft: '30px',
  borderRadius: '50px',
  transition: '0.3s',
  '&:hover': {
    backgroundColor: 'rgba(71, 178, 228, 0.85)', // Simula color-mix
  },
  '@media (max-width: 1200px)': {
    order: 2,
    margin: '0 15px 0 0',
    padding: '6px 15px',
  },
};

// Home Container Style
export const homeContainer: SxProps<Theme> = {
  display: 'flex', // Define el layout principal como flexbox
  flexDirection: 'column', // Los elementos se apilan verticalmente
  alignItems: 'center', // Centra los elementos horizontalmente
  justifyContent: 'center', // Centra los elementos verticalmente
  minHeight: '100vh', // Ocupa toda la altura de la ventana
  backgroundColor: '#f5f6f8', // Fondo claro
  color: '#444444', // Texto oscuro
  textAlign: 'center',
  padding: '20px', // Espaciado interno
};

// Container Style
export const containerStyle: SxProps<Theme> = {
  width: '100%', // container-fluid
  maxWidth: '1280px', // container-xl
  margin: '0 auto', // Centrado horizontal
  position: 'relative', // position-relative
  display: 'flex', // d-flex
  alignItems: 'center', // align-items-center
};
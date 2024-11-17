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
    // Media Query para .logo
    '@media (max-width: 1200px)': {
      order: 1,
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

    // Media Query para .btn-getstarted
    '@media (max-width: 1200px)': {
      order: 2,
      margin: '0 15px 0 0',
      padding: '6px 15px',
    },
  },

  '.btn-getstarted:hover, .btn-getstarted:focus:hover': {
    color: '#ffffff', // var(--contrast-color)
    backgroundColor: 'rgba(71, 178, 228, 0.85)', // Simula color-mix
  },

  '.navmenu': {
    // Media Query para .navmenu
    '@media (max-width: 1200px)': {
      order: 3,
    },

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

export const navMenuStyle: SxProps<Theme> = {
  padding: 0,
  zIndex: 9997,
  listStyle: 'none',
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'flex-start', md: 'center' },

  '& li': {
    position: 'relative',
    '&:last-child a': {
      paddingRight: 0,
    },
  },

  '& a, & a:focus': {
    color: '#ffffff', // var(--nav-color)
    padding: { xs: '10px 20px', md: '18px 15px' },
    fontSize: { xs: '17px', md: '15px' },
    fontFamily: '"Poppins", sans-serif', // var(--nav-font)
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
    transition: '0.3s',
    '&:hover': {
      color: '#47b2e4', // var(--nav-hover-color)
    },
  },

  // Dropdown styles
  '& .dropdown ul': {
    position: { xs: 'static', md: 'absolute' },
    padding: '10px 0',
    margin: { xs: '10px 20px', md: 0 },
    backgroundColor: '#ffffff', // var(--nav-dropdown-background-color)
    borderRadius: '6px',
    visibility: { xs: 'visible', md: 'hidden' },
    opacity: { xs: 1, md: 0 },
    zIndex: 99,
    transition: 'opacity 0.3s, visibility 0.3s',
    boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
  },

  '& .dropdown:hover > ul': {
    visibility: 'visible',
    opacity: 1,
  },

  '& .dropdown ul li': {
    minWidth: '200px',
  },

  '& .dropdown ul a': {
    padding: '10px 20px',
    fontSize: '15px',
    color: '#444444', // var(--nav-dropdown-color)
    '&:hover': {
      color: '#47b2e4', // var(--nav-dropdown-hover-color)
    },
  },

  '& .mobile-nav-toggle': {
    color: '#ffffff', // var(--nav-color)
    fontSize: '28px',
    lineHeight: 0,
    marginRight: '10px',
    cursor: 'pointer',
    display: { xs: 'block', md: 'none' },
    transition: 'color 0.3s',
  },
};
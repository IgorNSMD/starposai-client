import { SxProps, Theme } from '@mui/material/styles';

// Header Styles
export const headerStyle: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px', // Espaciado interno ajustado para mayor flexibilidad
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 999,
  transition: 'all 0.5s ease-in-out',
  
  // Media Query para el contenedor principal del header
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start', // Alinea los elementos al inicio en pantallas pequeñas
    padding: '10px 15px',
  },

  '.logo': {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    img: {
      maxHeight: '36px',
      marginRight: '8px',
    },
    h1: {
      fontSize: '24px', // Tamaño reducido para pantallas pequeñas
      margin: 0,
      fontWeight: 500,
      color: theme.palette.text.secondary,
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    // Media Query para la logo
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      width: '100%', // Centra el logo en pantallas muy pequeñas
      marginBottom: theme.spacing(1),
    },
  },

  '.navmenu': {
    display: 'flex',
    justifyContent: 'flex-end',
    flexGrow: 1,
    alignItems: 'center',
    marginLeft: 'auto',

    '& li': {
      marginRight: '20px',
    },
    // Media Query para el menú
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      '& li': {
        margin: theme.spacing(0.5, 0),
      },
    },
  },

  '.btn-getstarted': {
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.primary.main,
    fontSize: '14px',
    padding: '8px 25px',
    margin: '0 0 0 50px',
    borderRadius: '50px',
    transition: '0.3s',

    '&:hover': {
      backgroundColor: 'rgba(71, 178, 228, 0.85)',
    },
    // Media Query para el botón
    [theme.breakpoints.down('md')]: {
      margin: '15px 0 0 0', // Ajusta el margen para pantallas medianas
      padding: '6px 15px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%', // Botón ocupa todo el ancho en pantallas pequeñas
      textAlign: 'center',
    },
  },
});


// Button Get Started Style
export const btnGetStartedStyle: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.secondary.main, //'#ffffff', // --contrast-color
  backgroundColor: theme.palette.primary.main, //'#47b2e4', // --accent-color
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
});

// Home Container Style
export const homeContainer: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex', // Define el layout principal como flexbox
  flexDirection: 'column', // Los elementos se apilan verticalmente
  alignItems: 'center', // Centra los elementos horizontalmente
  justifyContent: 'center', // Centra los elementos verticalmente
  minHeight: '100vh', // Ocupa toda la altura de la ventana
  backgroundColor: theme.palette.secondary.main, //'#f5f6f8', // Fondo claro
  color: theme.palette.text.primary, //'#444444', // Texto oscuro
  textAlign: 'center',
  //padding: '20px', // Espaciado interno
  overflow: 'hidden', // Oculta ambos scrolls iniciales
  overflowX: 'hidden', // Previene el desplazamiento horizontal específicamente
});

// Container Style
export const containerStyle: SxProps<Theme> = {
  width: '100%', // container-fluid
  maxWidth: '1280px', // container-xl
  margin: '0 auto', // Centrado horizontal
  position: 'relative', // position-relative
  display: 'flex', // d-flex
  alignItems: 'center', // align-items-center
};

export const navMenuStyle: SxProps<Theme> = (theme: Theme) => ({
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
    color: theme.palette.text.secondary, //'#ffffff', // var(--nav-color)
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
      color: theme.palette.primary.main, //''#47b2e4', // var(--nav-hover-color)
    },
  },

  // Dropdown styles
  '& .dropdown ul': {
    position: { xs: 'static', md: 'absolute' },
    padding: '10px 0',
    margin: { xs: '10px 20px', md: 0 },
    backgroundColor: theme.palette.text.secondary, //'#ffffff', // var(--nav-dropdown-background-color)
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
    color: theme.palette.text.primary,//'#444444', // var(--nav-dropdown-color)
    '&:hover': {
      color: '#47b2e4', // var(--nav-dropdown-hover-color)
    },
  },

  '& .mobile-nav-toggle': {
    color: theme.palette.text.secondary, //'#ffffff', // var(--nav-color)
    fontSize: '28px',
    lineHeight: 0,
    marginRight: '10px',
    cursor: 'pointer',
    display: { xs: 'block', md: 'none' },
    transition: 'color 0.3s',
  },
});

export const dropdownStyle: SxProps<Theme> = (theme: Theme) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  backgroundColor: theme.palette.text.secondary, //'#ffffff',
  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
  zIndex: 99,
  visibility: 'hidden',
  opacity: 0,
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
});

export const dropdownActiveStyle: SxProps<Theme> = {
  visibility: 'visible',
  opacity: 1,
};

export const subDropdownStyle: SxProps<Theme> = (theme: Theme) => ({
  position: 'absolute',
  top: 0,
  left: '100%',
  backgroundColor: theme.palette.text.secondary, //'#ffffff',
  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.1)',
  zIndex: 99,
  visibility: 'hidden',
  opacity: 0,
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
});

export const subDropdownActiveStyle: SxProps<Theme> = {
  visibility: 'visible',
  opacity: 1,
};

export const sectionStyle = (theme: Theme): SxProps => ({
  color: theme.palette.text.primary, // Mapea a 'var(--default-color)'
  backgroundColor: theme.palette.background.default, // Mapea a 'var(--background-color)'
  padding: '60px 0',
  scrollMarginTop: '88px',
  overflow: 'clip',

  [theme.breakpoints.down('lg')]: {
    scrollMarginTop: '66px',
  },
});

export const darkBackgroundStyle = (theme: Theme): SxProps => ({
  backgroundColor: theme.typography.h1.color, //'#37517e', // Color asignado directamente
  color: theme.palette.text.secondary, //'#ffffff', // Texto blanco
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    color: theme.palette.text.secondary, //'#ffffff', // Encabezados
  },
  '& .surface': {
    backgroundColor: '#4668a2', // Superficie
    color: theme.palette.text.secondary, //'#ffffff', // Texto de la superficie
  },
});

export const mainStyle: SxProps<Theme> = (theme: Theme) => ({
  width: '100vw', // Asegura que ocupe todo el ancho de la ventana
  display: 'flex', // Flexbox para el contenido interno
  flexDirection: 'column', // Organiza las secciones verticalmente
  alignItems: 'center', // Centra el contenido horizontalmente
  justifyContent: 'flex-start', // Comienza desde la parte superior
  padding: '0', // Elimina cualquier margen interno
  margin: '0', // Elimina cualquier margen externo
  backgroundColor: theme.palette.background.default, // Fondo general basado en el tema
  color: theme.palette.text.primary, // Color del texto general
  minHeight: '100vh', // Asegura que ocupe toda la altura de la ventana
  overflow: 'hidden', // Oculta ambos scrolls iniciales
  overflowX: 'hidden', // Previene el desplazamiento horizontal específicamente
});

export const homeSectionStyle: SxProps<Theme> = (theme: Theme) => ({
  width: '100%',
  padding: '0',
  margin: '0',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh', // Ajusta para ocupar toda la altura visible si es necesario
});

export const heroImgStyle: SxProps<Theme> = () => ({
  maxWidth: '100%',
  height: 'auto',
  animation: 'fadeIn 2s ease-out',
});
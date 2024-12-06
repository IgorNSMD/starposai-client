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

// Estilo para el contenedor general del formulario
export const formContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
  margin: '0 auto',
};

// Estilo para los campos de texto (inputs y textarea)
export const inputField: SxProps<Theme> = {
  width: '100%',
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: '#47b2e4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#47b2e4',
    },
  },
};

// Estilo para el botón de enviar
export const submitButton: SxProps<Theme> = {
  backgroundColor: '#47b2e4',
  color: '#ffffff',
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#3699c9',
  },
};

// Estilo para el título del formulario
export const formTitle: SxProps<Theme> = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#333333',
  textAlign: 'center',
};

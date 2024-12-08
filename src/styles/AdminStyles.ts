import { SxProps, Theme } from '@mui/material/styles';

export const dashboardContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  backgroundColor: '#f9f9f9',
  '@media (max-width: 960px)': {
    flexDirection: 'column', // Cambia a diseño vertical
  },
};

export const sidebarStyle: SxProps<Theme> = {
  backgroundColor: '#37517e',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  position: 'fixed',
  top: '64px',
  height: 'calc(100vh - 64px)',
  overflowY: 'auto',
  '@media (max-width: 960px)': {
    position: 'relative', // Cambia a diseño no fijo
    height: 'auto',
    top: '0',
    flexDirection: 'row', // Opcional: Cambiar a diseño horizontal
    justifyContent: 'space-around',
    padding: '10px',
  },
};


export const headerStyle: SxProps<Theme> = {
  height: '64px',
  backgroundColor: '#37517e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'fixed',
  width: '100%',
  zIndex: 1100,
  '@media (max-width: 600px)': {
    height: '56px',
    padding: '0 10px',
  },
};

export const mainContentStyle: SxProps<Theme> = {
  flexGrow: 1,
  padding: '20px',
  overflow: 'auto',
  marginLeft: '250px',
  '@media (max-width: 960px)': {
    marginLeft: '0',
  },
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
  maxWidth: '800px',
  margin: '20px auto',
  width: '100%',
  '@media (max-width: 600px)': {
    padding: '10px',
  },
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
  '@media (max-width: 600px)': {
    marginBottom: '8px',
    '& .MuiOutlinedInput-root': {
      fontSize: '14px', // Reduce el tamaño del texto
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
  alignSelf: 'flex-end',
  '&:hover': {
    backgroundColor: '#3699c9',
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '8px 16px',
  },
};

// Estilo para el título del formulario
export const formTitle: SxProps<Theme> = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#333333',
  textAlign: 'center',
  '@media (max-width: 600px)': {
    fontSize: '20px',
  },
};

// Estilo para las etiquetas de los campos
export const labelStyle: SxProps<Theme> = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333333',
  marginBottom: '8px',
  alignSelf: 'flex-start',
};

// Estilo para los contenedores de los campos de texto (alineados)
export const inputContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  gap: '20px',
  width: '100%',
  '@media (max-width: 960px)': { // md breakpoint
    flexDirection: 'column',
    gap: '10px',
  },
};

// Estilo para la tabla de permisos
export const permissionsTable: SxProps<Theme> = {
  width: '100%',
  '& .MuiDataGrid-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#37517e',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  '@media (max-width: 960px)': { // md breakpoint
    '& .MuiDataGrid-root': {
      fontSize: '12px',
    },
  },
  '@media (max-width: 600px)': { // xs breakpoint
    '& .MuiDataGrid-root': {
      fontSize: '10px',
    },
    overflowX: 'auto',
  },
};

export const datagridStyle: SxProps<Theme> = {
  height: 'auto',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#37517e',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#f4f4f4',
  },
  '@media (max-width: 960px)': {
    '& .MuiDataGrid-columnHeaders': {
      fontSize: '14px',
    },
  },
  '@media (max-width: 600px)': {
    '& .MuiDataGrid-columnHeaders': {
      fontSize: '12px',
    },
    '& .MuiDataGrid-row': {
      fontSize: '10px',
    },
  },
};

export const cancelButton: SxProps<Theme> = {
  backgroundColor: '#e57373',
  color: '#ffffff',
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  alignSelf: 'flex-end',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '8px 16px',
  },
};
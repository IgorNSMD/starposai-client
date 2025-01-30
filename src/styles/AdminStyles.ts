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
  overflowY: 'auto', // Habilita el scroll vertical cuando haya muchos elementos
  overflowX: 'hidden', // Evita que aparezca un scroll horizontal innecesario
  zIndex: 1200,
  transition: 'width 0.3s ease-in-out', // Animación suave
  width: '250px', // Ancho cuando está abierto
  scrollbarWidth: 'thin', // Hace que el scroll sea más delgado (Firefox)
  scrollbarColor: '#999 #37517e', // Color del scroll (Firefox)
  '@media (max-width: 960px)': {
    width: '0', // Sidebar completamente contraído en pantallas pequeñas
  },
  '&::-webkit-scrollbar': {
    width: '6px', // Ancho del scrollbar (Chrome y Edge)
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#999', // Color del thumb (Chrome y Edge)
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#37517e', // Color de fondo del scrollbar
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
  transition: 'margin-left 0.3s ease-in-out',
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

// Estilo para el contenedor general del formulario
export const formContainer_v2: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '850px',
  margin: '20px auto',
  width: '100%',
  '@media (max-width: 960px)': {
    padding: '15px',
  },
  '@media (max-width: 600px)': {
    padding: '10px',
    maxWidth: '100%',
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
  padding: '10px',
  width: '100%',
  '@media (max-width: 960px)': {
    flexDirection: 'column', // Cambia a diseño vertical
    gap: '10px',
  },
};

export const inputContainerForm: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  padding: '10px',
  width: '100%',
  '@media (max-width: 960px)': {
    flexDirection: 'column', // Cambia a diseño vertical
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

export const generalTable: SxProps<Theme> = {
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

export const datagridStyle_v2: SxProps<Theme> = {
  height: 'auto',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#37517e',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  '& .MuiDataGrid-cell': {
    fontSize: '12px',
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#f4f4f4',
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

export const searchButton: SxProps<Theme> = {
  backgroundColor: '#4caf50', // Color verde para indicar acción de búsqueda
  color: '#ffffff', // Texto blanco
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  alignSelf: 'flex-start', // Ajuste para alineación en contenedores
  '&:hover': {
    backgroundColor: '#388e3c', // Verde más oscuro al pasar el cursor
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '8px 16px',
  },
};

// Estilo para la tablas Roles
export const rolesTable: SxProps<Theme> = {
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

// Estilo para la tablas Users
export const usersTable: SxProps<Theme> = {
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

// Estilo para la tabla de permisos
export const menusTable: SxProps<Theme> = {
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


export const formContainerTab: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'left',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '800px',
  //margin: '20px auto',
  width: '100%',
  '@media (max-width: 600px)': {
    padding: '10px',
  },
};

// Estilo para el botón guardar
export const saveButton: SxProps<Theme> = {
  backgroundColor: '#47b2e4',
  color: '#ffffff',
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  alignSelf: 'center',
  '&:hover': {
    backgroundColor: '#3699c9',
  },
  '@media (max-width: 600px)': {
    fontSize: '14px',
    padding: '8px 16px',
    alignSelf: 'flex-end',
  },
};

export const modalStyle: SxProps<Theme> = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
  padding: '20px',
  width: '80%',
  maxWidth: '500px',
  zIndex: 1300,
  '@media (max-width: 600px)': {
    width: '90%',
    padding: '15px',
  },
};


export const modalBackdropStyle: SxProps<Theme> = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1200,
};

export const modalTitleStyle: SxProps<Theme> = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#37517e', // Mismo color del tema principal
  marginBottom: '16px',
  textAlign: 'center',
};
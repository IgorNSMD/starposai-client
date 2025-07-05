import { SxProps, Theme } from '@mui/material/styles';

export const dashboardContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  backgroundColor: '#f9f9f9',
  '@media (max-width: 960px)': {
    flexDirection: 'column',
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
  overflowX: 'hidden',
  zIndex: 1200,
  transition: 'width 0.3s ease-in-out',
  width: '250px',
  scrollbarWidth: 'thin',
  scrollbarColor: '#999 #37517e',
  boxSizing: 'border-box',
  '@media (max-width: 960px)': {
    width: '0px',
  },
  '&.open': {
    width: '250px',
  },
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#999',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#37517e',
  },
  '& .MuiListItemText-primary': {
    fontSize: '12px',
    fontWeight: '500',
  },
  '& .MuiCollapse-root .MuiListItemText-primary': {
    fontSize: '11px',
    fontWeight: '400',
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
  boxSizing: 'border-box',
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
  boxSizing: 'border-box',
  '@media (max-width: 960px)': {
    marginLeft: '0px',
    padding: '15px',
  },
  '@media (max-width: 600px)': {
    padding: '10px',
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
  width: '100%',
  maxWidth: '100%',
  margin: '20px auto',
  boxSizing: 'border-box',
  '@media (min-width: 960px)': {
    maxWidth: '800px',
  },
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
  padding: '20px 30px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: 'calc(100% - 60px)', // 🔹 Resta los márgenes laterales para dejar espacio
  margin: '20px auto',
  '@media (min-width: 1280px)': {
    maxWidth: '1100px', // Para pantallas grandes
  },
  '@media (max-width: 960px)': {
    padding: '15px',
    maxWidth: '100%',
  },
  '@media (max-width: 600px)': {
    padding: '10px',
    maxWidth: '100%',
  },
};

export const formContainer_v3: SxProps<Theme> = {
  width: '100%',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  '@media (max-width:600px)': {
    padding: '4px',
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
  boxSizing: 'border-box',
  '@media (max-width: 960px)': {
    gridTemplateColumns: '1fr',
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

export const warehousesTable: SxProps<Theme> = {
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

export const kitsTable: SxProps<Theme> = {
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
  mt: 2,
  p: 2,
  borderRadius: 2,
  boxShadow: 2,
  width: '100%',
  overflowX: 'auto',
};



export const datagridStyle: SxProps<Theme> = {
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  height: 'auto',

  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#37517e',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#f4f4f4',
  },
  '& .MuiDataGrid-cell': {
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiDataGrid-row:nth-of-type(odd)': {
    backgroundColor: '#F4F6F8',
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

export const datagridStyle_v3: SxProps<Theme> = {
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  height: 'auto',
  width: '100%',
  overflowX: 'auto',

  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#37517e',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },

  '& .MuiDataGrid-footerContainer': {
    backgroundColor: '#f4f4f4',
  },

  '& .MuiDataGrid-cell': {
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },

  '& .MuiDataGrid-row:nth-of-type(odd)': {
    backgroundColor: '#F4F6F8',
  },

  // 🔹 Responsivo para pantallas pequeñas
  '@media (max-width: 768px)': {
    '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-cell': {
      fontSize: '0.75rem',
      paddingTop: '4px',
      paddingBottom: '4px',
    },
    '& .MuiDataGrid-footerContainer': {
      fontSize: '0.75rem',
    },
    '& .MuiDataGrid-root': {
      overflowX: 'auto',
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


// Estilo para la tablas Users
export const staffsTable: SxProps<Theme> = {
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
  cursor: 'move',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#37517e', // Mismo color del tema principal
  marginBottom: '16px',
  textAlign: 'center',
};
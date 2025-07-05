import { SxProps, Theme } from '@mui/system';

export const sxPaperTable: SxProps<Theme> = {
  width: '100%',
  overflowX: 'auto',
  boxShadow: 3,
  borderRadius: 2,
  mb: 2,
};

export const sxGridTable: SxProps<Theme> = {
  width: '100%',
  minWidth: 360,
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-row': {
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#ecf0f1',
    },
  },
  '& .MuiDataGrid-cell': {
    fontSize: '0.9rem',
  },
  '& .MuiDataGrid-footerContainer': {
    justifyContent: 'center',
    p: 1,
  },
  // Responsive tweak
  '@media (max-width: 600px)': {
    '& .MuiDataGrid-columnHeaders, .MuiDataGrid-cell': {
      fontSize: '0.75rem',
    },
  },
};

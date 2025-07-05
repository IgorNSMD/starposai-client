import { Box, Paper } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef } from '@mui/x-data-grid';
import { SxProps, Theme } from '@mui/system';

export interface ResponsiveDataGridProps<T extends { id: string | number }> extends Omit<DataGridProps, 'rows' | 'columns'> {
  rows: T[];
  columns: GridColDef[];
  sxPaper?: SxProps<Theme>;
  sxGrid?: SxProps<Theme>;
}

const defaultPaperStyle: SxProps<Theme> = {
  padding: 2,
  mt: 1,
  width: '100%',
  overflow: 'hidden',
  boxShadow: 2,
  borderRadius: 2,
};

const defaultGridStyle: SxProps<Theme> = {
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  '& .MuiDataGrid-cell': {
    fontSize: '0.85rem',
  },
  '& .MuiDataGrid-row:nth-of-type(odd)': {
    backgroundColor: '#f9f9f9',
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#ffffff',
  },
  '& .MuiDataGrid-virtualScroller': {
    overflowX: 'auto',
  },
  '& .MuiDataGrid-footerContainer': {
    justifyContent: 'center',
    padding: '8px',
  },
};

export const ResponsiveDataGrid = <T extends { id: string | number }>({
  rows,
  columns,
  sxPaper = {},
  sxGrid = {},
  ...dataGridProps
}: ResponsiveDataGridProps<T>) => {
  return (
    <Paper sx={{ ...defaultPaperStyle, ...sxPaper }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box>
          <DataGrid
            autoHeight
            disableRowSelectionOnClick
            rows={rows}
            columns={columns}
            sx={{ ...defaultGridStyle, ...sxGrid }}
            {...dataGridProps}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ResponsiveDataGrid;
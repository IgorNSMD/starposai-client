import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  Button,
} from '@mui/material';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon  from '@mui/icons-material/Cancel';

import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../../store/slices/warehouseSlice';

import {
  submitButton,
  inputField,
  formTitle,
  datagridStyle,
  cancelButton,
} from '../../styles/AdminStyles';
import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura

import { useToastMessages } from '../../hooks/useToastMessage';




interface FormData {
  name: string;
  location: string;
}

const Warehouse: React.FC = () => {
  const dispatch = useAppDispatch();
  const { warehouses, errorMessage, successMessage } = useAppSelector((state) => state.warehouses);

  const [formData, setFormData] = useState<FormData>({ name: '', location: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  useToastMessages(successMessage, errorMessage);

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Diálogo para eliminar
  const handleDeleteDialogOpen = (id: string) => {
        setSelectedId(id);
        setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedId(null);
    setIsDeleteDialogOpen(false);
  };  

  const handleConfirmDelete = () => {
     if (selectedId) {
       dispatch(deleteWarehouse(selectedId))
          .then(() => dispatch(fetchWarehouses())); // Actualiza la lista después de eliminar
        setSelectedId(null);
      }
      handleDeleteDialogClose();
  };

  // Función para mostrar el cuadro de diálogo
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };  

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
        setIsDialogOpen(false);
  };  

  const handleConfirmUpdate  = () => {
    if (editingId) { 
      console.log('handleConfirmUpdate editingId -> ', editingId)
      dispatch(updateWarehouse({ id: editingId, name: formData.name, location: formData.location }))
          .then(() => dispatch(fetchWarehouses())); // Actualiza la lista después de editar
      setEditingId(null);
      //setConfirmDialogOpen(false); // Cierra el diálogo
    }
    setFormData({ name: '', location: '' });
    handleDialogClose();
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location) return;

    if (editingId) {
      dispatch(updateWarehouse({ id: editingId, ...formData }))
      .then(() => dispatch(fetchWarehouses())); // Actualiza la lista después de crear
    } else {
      dispatch(createWarehouse({ ...formData }))
      .then(() => dispatch(fetchWarehouses())); // Actualiza la lista después de crear
    }
    setFormData({ name: '', location: '' });
  };

  const handleEdit = (params: GridRenderCellParams) => {
    const warehouse = warehouses.find((w) => w._id === params.row.id);
    if (warehouse) {
      setFormData({ name: warehouse.name, location: warehouse.location });
      setEditingId(warehouse._id);
    }
  };



  const handleCancel = () => {
    setFormData({ name: '', location: '' });
    setEditingId(null);
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Warehouse Name', 
      flex: 1 
    },
    { 
      field: 'location', 
      headerName: 'Location', 
      flex: 1 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error"
            onClick={() => handleDeleteDialogOpen(params.row.id)} // Abre el diálogo de confirmación
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

    // Mapear datos para DataGrid
    const rows = warehouses.filter((w) => w._id && w.name && w.location) // Filtra registros válidos
        .map((wh) => ({
            id: wh._id, // Usa `_id` como identificador único
            name: wh.name,
            location: wh.location,
        }));

  return (
    <Box   
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: { xs: 1, sm: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
      <Paper 
          sx={{
            padding: { xs: 2, sm: 3 },
            marginBottom: 2,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
        <Typography sx={formTitle}>
          {editingId ? 'Edit Warehouse' : 'Add New Warehouse'}
        </Typography>

        <Box   
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}>

          <TextField
            label="Warehouse Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={inputField}
            slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
            }}
          />
          <TextField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            sx={inputField}
            slotProps={{
                inputLabel: {
                shrink: true,
                sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                    color: '#47b2e4',
                    },
                },
                },
            }}
          />
        </Box>

        <Box 
          display="flex" 
          gap={2} 
          marginTop="16px"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2,
          }}
          >
          <Button
            onClick={editingId ? handleDialogOpen : handleSubmit} // Abrir cuadro de diálogo si es edición
            variant="contained"
            color="primary"
            sx={submitButton}
          >
            {editingId ? 'Update' : 'Save'}
          </Button>
          {editingId && (
            <Button
              variant="outlined" // Cambiado a `contained` para igualar el estilo de "Save"
              color="secondary" // O el color que prefieras
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={cancelButton}
            >
              Cancel
            </Button>
          )}          
        </Box>
      </Paper>

      <Paper   
        sx={{
          width: '100%',
          overflowX: 'auto',
          padding: { xs: 1, sm: 2 },
          boxSizing: 'border-box',
        }}>
        <Typography   variant="h6"
          sx={{
            px: { xs: 1, sm: 2 },
            py: 1,
            color: '#333333',
            fontWeight: 'bold',
          }}>
          Warehouses List
        </Typography>

        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            ...datagridStyle,
            minWidth: { xs: '100%', sm: 600 },
          }}
        />
      </Paper>
      {/* Cuadro de diálogo de confirmación */}

      <Dialog
        isOpen={isDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this permission?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmUpdate}
      />

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this permission?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />      
      
    </Box>
  );
};

export default Warehouse;

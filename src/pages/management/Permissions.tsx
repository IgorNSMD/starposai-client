import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import toast from 'react-hot-toast';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  clearMessages,
} from '../../store/slices/permissionSlice';
import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  permissionsTable,
  datagridStyle,
  cancelButton,
} from '../../styles/AdminStyles';

const Permissions: React.FC = () => {

  const dispatch = useAppDispatch();
  const { permissions, errorMessage, successMessage } = useAppSelector((state) => state.permissions);

  const [formData, setFormData] = useState({ key: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Manejar mensajes de éxito y error con notificaciones
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessages());
    }
  }, [successMessage, errorMessage, dispatch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updatePermission({ id: editingId, key: formData.key, description: formData.description }));
      setEditingId(null);
    } else {
      dispatch(createPermission({ key: formData.key, description: formData.description }));
    }
    setFormData({ key: '', description: '' });
  };

  const handleEdit = (id: string) => {
    const permission = permissions.find((perm) => perm._id === id);
    if (permission) {
      setFormData({ key: permission.key, description: permission.description });
      setEditingId(id);
      console.log('Set editingId:', id); // Debug para confirmar
    } else {
      console.log('Permission not found for id:', id); // Debug para confirmar
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deletePermission(id));
  };

  const handleCancel = () => {
    setFormData({ key: '', description: '' });
    setEditingId(null);
  };

   // Mapear datos para DataGrid
   const rows = permissions.map((permission) => ({
    id: permission._id, // Usa `_id` como `id` para DataGrid
    key: permission.key,
    description: permission.description,
  }));

  const columns = [
    { field: 'key', headerName: 'Key', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row.id)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  


  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Permission' : 'Add New Permission'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Permission Name"
            name="key"
            value={formData.key}
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
            label="Description"
            name="description"
            value={formData.description}
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
        <Box display="flex" gap={2} marginTop="16px">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
          >
            Save
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

      {/* Tabla de permisos */}
      <Paper sx={permissionsTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Permissions List
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5, // Configura el tamaño de página inicial
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]} // Opciones para cambiar el tamaño de página
          disableRowSelectionOnClick 
          sx={datagridStyle}
        />
      </Paper>
    </Box>

  );
};

export default Permissions;
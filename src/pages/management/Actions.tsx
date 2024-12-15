import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Checkbox,
} from '@mui/material';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
//import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchPermissions,
  fetchActions,
  createAction,
  updateAction,
  deleteAction,
} from '../../store/slices/actionSlice';

import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  permissionsTable,
  datagridStyle,
  cancelButton,
  rolesTable,
} from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';


const Actions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions, actions, errorMessage, successMessage } = useAppSelector((state) => state.actions);
  const [formData, setFormData] = useState({ name: '',  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchActions());
  }, [dispatch]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

  const handlePermissionToggle = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((permId) => permId !== id) : [...prev, id]
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
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
      dispatch(deleteAction(selectedId))
        .then(() => dispatch(fetchActions())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {

    const data = {
      name: formData.name,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateAction({ id: editingId, ...data })).then(() => {
        dispatch(fetchActions());
        setEditingId(null);
        setFormData({ name: '' });
        setSelectedPermissions([]);
      });
    } else {
      dispatch(createAction(data)).then(() => {
        dispatch(fetchActions());
        setFormData({ name: '' });
        setSelectedPermissions([]);
      });
    }
  };

  const handleEdit = (id: string) => {
    const action = actions.find((act) => act._id === id);
    if (action) {
      setFormData({ name: action.name });
      setSelectedPermissions(action.permissions.map((perm) => perm._id)); // Seleccionar permisos de la acción
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '' });
    setEditingId(null);
    setSelectedPermissions([]);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    const data = {
      name: formData.name,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateAction({ id: editingId, ...data })).then(() => {
        dispatch(fetchActions());
        setEditingId(null);
        setFormData({ name: '' });
        setSelectedPermissions([]);
      });
    } 
  };

  const columnsPermissions: GridColDef[] = [
    {
      field: 'select',
      headerName: 'Sel',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          color="primary"
          checked={selectedPermissions.includes(params.row.id)} // Verifica si está seleccionado
          onChange={() => handlePermissionToggle(params.row.id)} // Llama a la función al hacer clic
          sx={{
            '&.Mui-checked': {
              color: '#47b2e4',
            },
            color: '#444444',
          }}
        />
      ),
    },
    { field: 'key', headerName: 'Permission', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];

  const rowsPermissions = permissions.map((permission) => ({
    id: permission._id,
    key: permission.key,
    description: permission.description,
  }));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
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
            onClick={() => handleDeleteDialogOpen(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  

  const rows = actions.filter((act) => act._id && act.name ) // Filtra registros válidos
  .map((act) => ({
    id: act._id, // Usa `_id` como identificador único
    name: act.name
  }));

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Action' : 'Add New Action'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Action Name"
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
        </Box>
      </Paper>

      <Paper sx={permissionsTable}>
        <DataGrid
          rows={rowsPermissions}
          columns={columnsPermissions}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
        <Box display="flex" gap={2} margin ="16px" >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
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
      <Paper sx={rolesTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Actions List
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
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

      {/* Cuadro de diálogo para eliminar */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this role?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

    </Box>
  );
};

export default Actions;
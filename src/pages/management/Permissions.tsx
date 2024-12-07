import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
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
    const permission = permissions.find((perm) => perm.id === id);
    if (permission) {
      setFormData({ key: permission.key, description: permission.description });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deletePermission(id));
  };

  const handleCancel = () => {
    setFormData({ key: '', description: '' });
    setEditingId(null);
  };

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
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{ alignSelf: 'flex-end' }}
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell>{perm.key}</TableCell>
                <TableCell>{perm.description}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(perm.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(perm.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>

  );
};

export default Permissions;
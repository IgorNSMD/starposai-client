import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { formContainer, submitButton, inputField, inputContainer, formTitle, permissionsTable } from '../../styles/AdminStyles';

interface Permission {
  id: number;
  name: string;
  description: string;
}

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (editingId !== null) {
      setPermissions((prev) =>
        prev.map((perm) => (perm.id === editingId ? { ...perm, ...formData } : perm))
      );
      setEditingId(null);
    } else {
      setPermissions((prev) => [
        ...prev,
        { id: Date.now(), name: formData.name, description: formData.description },
      ]);
    }
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (id: number) => {
    const permission = permissions.find((perm) => perm.id === id);
    if (permission) {
      setFormData({ name: permission.name, description: permission.description });
      setEditingId(id);
    }
  };

  const handleDelete = (id: number) => {
    setPermissions((prev) => prev.filter((perm) => perm.id !== id));
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
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

      <Paper sx={permissionsTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Permissions List
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell>{perm.name}</TableCell>
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
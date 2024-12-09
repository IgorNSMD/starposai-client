import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { formContainer, submitButton, inputContainer, inputField, formTitle, permissionsTable, datagridStyle } from '../../styles/AdminStyles';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: { id: string; key: string; description: string }[];
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (editingId) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingId
            ? { ...role, name: formData.name, description: formData.description }
            : role
        )
      );
      setEditingId(null);
    } else {
      setRoles((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          permissions: [],
        },
      ]);
    }
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (id: string) => {
    const role = roles.find((role) => role.id === id);
    if (role) {
      setFormData({ name: role.name, description: role.description });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== id));
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Permision', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions',
      headerName: 'Sel',
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
  }));

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '10px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Role' : 'Add New Role'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Role Name"
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
            sx={submitButton}
          >
            {editingId ? 'Update' : 'Save'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={permissionsTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Permisions List
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
    </Box>
  );
};

export default Roles;
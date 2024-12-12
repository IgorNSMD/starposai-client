import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Menus: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    parentId: '',
  });
  const [menus, setMenus] = useState([]); // Aquí se cargará la lista de menús
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name as string]: value });
  };

  const handleSubmit = () => {
    // Aquí irá la lógica para guardar o actualizar
    console.log('Form Data:', formData);
    setFormData({ name: '', url: '', parentId: '' });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    // Aquí se llenará el formulario para editar
    console.log('Editing menu:', id);
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    // Aquí irá la lógica para eliminar
    console.log('Deleting menu:', id);
  };

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0.5,
      renderCell: (params) => (
        <Box>
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
        </Box>
      ),
    },
    { field: 'name', headerName: 'Menú', flex: 1 },
    { field: 'parentName', headerName: 'Padre', flex: 1 },
  ];

  const rows = menus.map(() => ({
    // label: menu.label,
    // name: menu.name,
    // parentName: menu.parentName || 'N/A',
  }));

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        MENUS
      </Typography>
      <Paper sx={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">Formulario</Typography>
        <Box display="flex" gap={2} marginTop="16px" flexDirection="column">
          <TextField
            label="Nombre del Menú"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="parent-label">Menú Padre</InputLabel>
            <Select
              labelId="parent-label"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {/* Aquí puedes mapear los menús padres */}
              {menus.map((menu) => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setFormData({ name: '', url: '', parentId: '' })}
            >
              Exit
            </Button>
          </Box>
        </Box>
      </Paper>
      <Paper sx={{ padding: '16px' }}>
        <Typography variant="h6">List Menús</Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
        />
      </Paper>
    </Box>
  );
};

export default Menus;
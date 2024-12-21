import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  Button,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';

import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchRoles,
  fetchUsers,
  updateUser,
  deleteUser,
} from '../../store/slices/userSlice';

import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  datagridStyle,
  cancelButton,
  usersTable,
} from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';


interface FormData {
  name: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, roles, errorMessage, successMessage } = useAppSelector((state) => state.users);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "", 
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

      // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
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
      dispatch(deleteUser(selectedId))
        .then(() => dispatch(fetchUsers())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    };
  
    if (editingId) {
      dispatch(updateUser({ id: editingId, ...data })).then(() => {
        dispatch(fetchUsers());
        setEditingId(null);
        setFormData({     
          name: "",
          email: "",
          role: "", // Valor inicial como string
         });
      });
    } 
  };

  const handleEdit = (id: string) => {
    const user = users.find((user) => user._id === id);
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role });
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      name: "",
      email: "",
      role: "", // Valor inicial como string
     });
    setEditingId(null);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    const data = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    };
  
    if (editingId) {
      dispatch(updateUser({ id: editingId, ...data })).then(() => {
        dispatch(fetchUsers());
        setEditingId(null);
        setFormData({     
          name: "",
          email: "",
          role: "", // Valor inicial como string
         });
      });
    } 
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'email', flex: 1 },
    { field: 'role', headerName: 'role', flex: 1 },
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
  

  const rows = users
  .filter((user) => user._id && user.name) // Filtra registros válidos
  .map((user) => {
    const roleName = roles.find((role) => role._id === user.role)?.name || "Unknown Role";
    return {
      id: user._id, // Usa `_id` como identificador único
      name: user.name,
      email: user.email,
      role: roleName, // Mapea el nombre del rol
    };
  });

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit User' : ''}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="User Name"
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
            label="Email"
            name="email"
            value={formData.email}
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
        <Box sx={inputContainer}>
          <FormControl sx={{ minWidth: 350 }}>
            <InputLabel
              id="parent-select-label"
              shrink={true} // Esto fuerza que el label permanezca visible
              sx={{
                color: "#444444",
                "&.Mui-focused": {
                  color: "#47b2e4",
                },
              }}
            >
              Role
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="role"
              value={formData.role} // Garantiza un valor seguro
              onChange={handleInputChange}
            >
              {/* <MenuItem key="-1" value="-1">
                <em>None</em>
              </MenuItem> */}
              {roles.map((r) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = r._id;
                //console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {r.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" gap={2} margin ="16px" >
          {editingId && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={submitButton}
            >
            Update
            </Button>
          )}
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

      <Paper sx={usersTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Users List
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

export default Users;
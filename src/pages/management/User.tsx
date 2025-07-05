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
  fetchUsers,
  updateUser,
  deleteUser,
  registerUser,
} from '../../store/slices/userSlice';

import { fetchRoles } from '../../store/slices/roleSlice';


import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  datagridStyle,
  cancelButton,

} from '../../styles/AdminStyles';

import { selectActiveCompanyVenue } from '../../store/slices/authSlice';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';


interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, errorMessage, successMessage } = useAppSelector((state) => state.users);

  const { roles } = useAppSelector((state) => state.roles);


  const { activeCompanyId, activeVenueId } = useAppSelector(selectActiveCompanyVenue);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "", 
    password: "", 
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    if (activeCompanyId) {
      dispatch(fetchRoles({ companyId: activeCompanyId, venueId: activeVenueId || '' }));
      dispatch(fetchUsers({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
    }

  }, [dispatch, activeCompanyId, activeVenueId]);

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
    if (selectedId && activeCompanyId) {
      dispatch(deleteUser({
        id: selectedId,
        companyId: activeCompanyId,
        venueId: activeVenueId || undefined
      }))
        .then(() => dispatch(fetchUsers({ companyId: activeCompanyId, venueId: activeVenueId || undefined }))); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    if (!activeCompanyId) return; // Protege todas las ramas
    // const data = {
    //   name: formData.name,
    //   email: formData.email,
    //   role: formData.role,
    //   position: formData.position
    // };
  
    if (editingId && activeCompanyId) {
      dispatch(updateUser({
        id: editingId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        companyId: activeCompanyId, // 🔹 Agregado
        venueId: activeVenueId || undefined, // 🔹 Agregado
      })).then(() => {
        dispatch(fetchUsers({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
        setEditingId(null);
        setFormData({
          name: "",
          email: "",
          role: "",
          password: ""
        });
      });
    } else {
      dispatch(registerUser({
        userData: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        },
        companyId: activeCompanyId,
        venueId: activeVenueId || undefined
      })).then(() => {
        dispatch(fetchUsers({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
        setEditingId(null);
        setFormData({
          name: "",
          email: "",
          role: "",
          password: ""
        });
      });
      

    }

  };

  const handleEdit = (id: string) => {
    const user = users.find((user) => user._id === id);
    if (user) {
      setFormData({ 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        password: "" });
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      name: "",
      email: "",
      role: "", // Valor inicial como string
      password: ""
     });
    setEditingId(null);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    if (!activeCompanyId) return; // Protege todas las ramas
    // const data = {
    //   name: formData.name,
    //   email: formData.email,
    //   role: formData.role,
    //   position: formData.position
    // };
  
    if (editingId) {
      dispatch(updateUser({
          id: editingId,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          companyId: activeCompanyId, // 🔹 Agregado
          venueId: activeVenueId || undefined, // 🔹 Agregado
        })).then(() => {
        dispatch(fetchUsers({ companyId: activeCompanyId, venueId: activeVenueId || undefined }));
        setEditingId(null);
        setFormData({     
          name: "",
          email: "",
          role: "", // Valor inicial como string
          password: ""
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
      flex: 0.7,
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
          {editingId ? 'Edit User' : 'Create User'}
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

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              required
              value={formData.password}
              onChange={handleChange}
              sx={{ flex: 1 }}
              slotProps={{
                input: {
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '1px',
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#47b2e4',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#47b2e4',
                    },
                  },
                },
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
            <FormControl sx={{ flex: 1 }}>
              <InputLabel
                id="parent-select-label"
                shrink={true}
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
                value={formData.role}
                onChange={handleInputChange}
              >
                {roles.map((r) => (
                  <MenuItem key={r._id} value={r._id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        </Box>

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

      <Paper 
        sx={{
          width: '100%',
          overflowX: 'auto',
          marginTop: 2,
        }}
        >

        <Box sx={{ minWidth: '600px' }}>
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
        </Box>
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
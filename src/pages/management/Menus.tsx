import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
//import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchPermissions,
  fetchMenus,
  fetchMenusRoot,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../../store/slices/menuSlice';

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

interface FormData {
  label: string;
  parentId: string;
  order: number;
  path: string;
  icon: string | File; // Ahora acepta una string o un archivo File
}


const Menus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions, menus, menusRoot, errorMessage, successMessage } = useAppSelector((state) => state.menus);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const [formData, setFormData] = useState<FormData>({
    label: "",
    parentId: "",
    order: 0, // Valor inicial como string
    path: "", // Valor inicial como string
    icon: ""
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchMenus());
    dispatch(fetchMenusRoot());

  }, [dispatch]);

  // Manejo de mensajes
  console.log('successMessage, errorMessage', successMessage, errorMessage)
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

    // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Obtén el archivo seleccionado
      setFormData((prevForm) => ({ ...prevForm, icon: file }));
    }
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
      dispatch(deleteMenu(selectedId))
        .then(() => dispatch(fetchMenus())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {

    const data = {
      label: formData.label,
      parentId: formData.parentId,
      order: formData.order,
      path: formData.path,
      icon: formData.icon,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateMenu({ id: editingId, ...data})).then(() => {
        dispatch(fetchMenus());
        setEditingId(null);
        setFormData({     
          label: "",
          parentId: "",
          order: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "" });
        setSelectedPermissions([]);
      });
    } else {
      dispatch(createMenu(data)).then(() => {
        dispatch(fetchMenus());
        setFormData({     
          label: "",
          parentId: "",
          order: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "" });
        setSelectedPermissions([]);
      });
    }
  };

  const handleEdit = (id: string) => {
    const menu = menus.find((act) => act._id === id);
    if (menu) {
      setFormData({ 
        label: menu.label,
        parentId: menu.parentId,
        order: menu.order,
        path: menu.path, 
        icon: menu.icon
      });
      setSelectedPermissions(menu.permissions.map((perm) => perm._id)); // Seleccionar permisos de la acción
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      label: "",
      parentId: "",
      order: 0, // Valor inicial como string
      path: "", // Valor inicial como string
      icon: "" });
    setEditingId(null);
    setSelectedPermissions([]);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    const data = {
      label: formData.label,
      parentId: formData.parentId,
      order: formData.order,
      path: formData.path,
      icon: formData.icon,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateMenu({ id: editingId, ...data })).then(() => {
        dispatch(fetchMenus());
        setEditingId(null);
        setFormData({     
          label: "",
          parentId: "",
          order: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "" });
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
    { field: 'label', headerName: 'label', flex: 1 },
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
  
  //console.log('actions -> ', actions)

  const rows = menus.filter((act) => act._id && act.label ) // Filtra registros válidos
  .map((act) => ({
    id: act._id, // Usa `_id` como identificador único
    name: act.label
  }));

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Menu' : 'Add New Menu'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Label"
            name="label"
            value={formData.label}
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
            label="Path"
            name="path"
            value={formData.path}
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
              Parent
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="parentId"
              value={formData.parentId}
              onChange={handleInputChange}
            >
              <MenuItem value="-1">
                <em>None</em>
              </MenuItem>
              {menusRoot.map((menu) => (
                <MenuItem key={menu._id} value={menu._id}>
                  {menu.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
      <Box sx={inputContainer}>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#47b2e4",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#1e88e5" },
            }}
            >
            Upload Icon
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </Button>
          {/* Mostrar el nombre del archivo seleccionado */}
          {formData.icon && (
            <Typography
              variant="body2"
              sx={{
                marginTop: "5px",
                color: "#444444",
                fontStyle: "italic",
              }}
            >
              {formData.icon instanceof File ? `Selected: ${formData.icon.name}` : "No file selected"}
            </Typography>
          )}
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
          Menus List
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
        message="Are you sure you want to delete this menu?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

    </Box>
  );
};

export default Menus;
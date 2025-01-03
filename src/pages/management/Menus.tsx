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

import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
import { baseURL_MENUICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable

interface FormData {
  label: string;
  component: string;
  parentId: string;
  sequence: number;
  path: string;
  icon: string | File; // Ahora acepta una string o un archivo File
  divider: boolean;
}

interface Row { // Define la interfaz Row (o usa la que ya tengas)
  id: string;
  parentId?: string; // parentId también puede ser undefined
  // ... otras propiedades
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
    component: "",
    parentId: "",
    sequence: 0, // Valor inicial como string
    path: "", // Valor inicial como string
    icon: "",
    divider: false, // Por defecto en falso
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPermissions());
    dispatch(fetchMenus());
    dispatch(fetchMenusRoot());

  }, [dispatch]);

  // Manejo de mensajes
  //console.log('successMessage, errorMessage', successMessage, errorMessage)
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
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Obtén el archivo seleccionado
      setFormData((prevForm) => ({ ...prevForm, icon: file }));
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prevForm) => ({ ...prevForm, [name]: checked }));
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
      handleCancel();
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    console.log('handleSubmit...')
    const data = {
      label: formData.label,
      component: formData.component,
      parentId: formData.parentId,
      sequence: formData.sequence,
      path: formData.path,
      icon: formData.icon,
      divider: formData.divider,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateMenu({ id: editingId, ...data})).then(() => {
        dispatch(fetchMenus());
        setEditingId(null);
        setFormData({     
          label: "",
          component: "",
          parentId: "-1",
          sequence: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "",
          divider: false,
         });
        setSelectedPermissions([]);
      });
    } else {
      console.log('createMenu...')
      dispatch(createMenu(data)).then(() => {
        dispatch(fetchMenus());
        setFormData({     
          label: "",
          component: "",
          parentId: "",
          sequence: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "",
          divider: false
         });
        setSelectedPermissions([]);
      });
    }
  };

  const handleEdit = (id: string) => {
    const menu = menus.find((act) => act._id === id);
    //console.log("id:", id);
    //console.log("menu?.parentId:", menu?.parentId);

    if (menu) {
      setFormData({ 
        label: menu.label ?? "",
        component: menu.component ?? "",
        parentId: menu.parentId ?? "", // Fallback a string vacío
        sequence: menu.sequence ?? 0,
        path: menu.path ?? "",
        icon: menu.icon ?? "", // Fallback a string vacío
        divider: menu.divider ?? false,
      });
      setSelectedPermissions(menu.permissions.map((perm) => perm._id)); // Seleccionar permisos de la acción
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      label: "",
      component: "",
      parentId: "",
      sequence: 0, // Valor inicial como string
      path: "", // Valor inicial como string
      icon: "",
      divider: false,
     });
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
      component: formData.component,
      parentId: formData.parentId,
      sequence: formData.sequence,
      path: formData.path,
      icon: formData.icon,
      divider: formData.divider,
      permissions: selectedPermissions, // Enviar permisos seleccionados
    };
  
    if (editingId) {
      dispatch(updateMenu({ id: editingId, ...data })).then(() => {
        dispatch(fetchMenus());
        setEditingId(null);
        setFormData({     
          label: "",
          component: "",
          parentId: "",
          sequence: 0, // Valor inicial como string
          path: "", // Valor inicial como string
          icon: "",
          divider: false,
         });
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

  const calculateIndentation = (rowId: string | undefined): number => {
    let level = 0;
    let current: Row | undefined = rows.find((row) => row.id === rowId); // Tipa 'current' también
    let nextParent: string | undefined; // Tipa 'nextParent' explícitamente

    while (current) {
        nextParent = current.parentId;
        if (nextParent) {
            level += 1;
            current = rows.find((row) => row.id === nextParent);
        } else {
            break;
        }
    }

    return level;
  };

  

  const columns: GridColDef[] = [
    {
      field: 'label',
      headerName: 'Label',
      flex: 1,
      renderCell: (params) => {
        const indentation = calculateIndentation(params.row.id);
        return (
          <Box sx={{ paddingLeft: `${indentation * 16}px` }}> {/* Sangría visual */}
            {params.value}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
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

  const rows = menus.map((menu) => ({
    id: menu._id,
    label: menu.label,
    parentId: menu.parentId,
  }))

  //console.log('menusRoot->',menusRoot)

  const getIconUrl = (iconPath: string) => {
    const baseUrl = baseURL_MENUICONS; // La URL base de tu servidor backend
    //console.log('baseURL, iconPath', baseUrl, iconPath)
    return iconPath ? `${baseUrl}/${iconPath}` : ""; // Combina la URL base con la ruta relativa
  };
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
            label="Component"
            name="component"
            value={formData.component || ""} // Asegura que nunca sea null o undefined
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
          <TextField
            label="Path"
            name="path"
            value={formData.path || ""} // Asegura que nunca sea null o undefined
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
            label="Sequence"
            name="sequence"
            value={formData.sequence || ""} // Asegura que nunca sea null o undefined
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
              value={formData.parentId} // Garantiza un valor seguro
              onChange={handleInputChange}
            >
              {/* <MenuItem key="-1" value="-1">
                <em>None</em>
              </MenuItem> */}
              {menusRoot.map((menuroot) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = menuroot.id;
                //console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {menuroot.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {/* Checkbox para Divider */}
          <Box display="flex" alignItems="center">
            <Checkbox
              name="divider"
              checked={formData.divider}
              onChange={handleCheckboxChange}
              sx={{
                color: "#444444",
                "&.Mui-checked": {
                  color: "#47b2e4",
                },
              }}
            />
            <Typography sx={{ color: "#444444" }}>Divider</Typography>
          </Box>
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
            <Box sx={{ marginTop: "10px" }}>
              <Typography variant="body2" sx={{ color: "#444444" }}>
                Current Icon:
              </Typography>
              <img
                src={
                  formData.icon instanceof File
                    ? URL.createObjectURL(formData.icon) // Icono temporal si es un archivo subido
                    : getIconUrl(formData.icon) // Icono desde el servidor
                }
                alt="Menu Icon"
                style={{ width: "50px", height: "50px", objectFit: "contain", marginTop: "5px" }}
              />
            </Box>
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
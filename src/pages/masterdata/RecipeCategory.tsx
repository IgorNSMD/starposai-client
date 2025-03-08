import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchRecipeCategories,
  fetchRecipeCategoriesRoot,
  createRecipeCategory,
  updateRecipeCategory,
  deleteRecipeCategory,
} from '../../store/slices/recipeCategorySlice';

import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  datagridStyle,
  cancelButton,
  rolesTable,
} from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';

interface FormData {
  name: string;
  description: string;
  parentId: string;
}

interface Row { // Define la interfaz Row (o usa la que ya tengas)
  id: string;
  parentId?: string; // parentId también puede ser undefined
  // ... otras propiedades
}

const RecipeCategory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { recipeCategories, recipeCategoriesRoot, errorMessage, successMessage } = useAppSelector((state) => state.recipeCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    parentId: "",
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchRecipeCategories());
    dispatch(fetchRecipeCategoriesRoot());

  }, [dispatch]);

  // Manejo de mensajes
  //console.log('successMessage, errorMessage', successMessage, errorMessage)
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
      dispatch(deleteRecipeCategory(selectedId))
        .then(() => dispatch(fetchRecipeCategories())); // Actualiza la lista después de eliminar
      handleCancel();
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    //console.log('handleSubmit...')
    const data = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId,
    };
  
    if (editingId) {
      //console.log('createMenu...')
      dispatch(updateRecipeCategory({ id: editingId, ...data})).then(() => {
        dispatch(fetchRecipeCategories());
        setEditingId(null);
        setFormData({     
          name: "",
          description: "",
          parentId: "-1",
         });
      });
    } else {
      console.log('createMenu...2')
      dispatch(createRecipeCategory(data)).then(() => {
        dispatch(fetchRecipeCategories());
        setFormData({     
          name: "",
          description: "",
          parentId: "",
         });
      });
    }
  };

  const handleEdit = (id: string) => {
    const recipeCategory = recipeCategories.find((rC) => rC._id === id);
    //console.log("id:", id);
    //console.log("menu?.parentId:", menu?.parentId);

    if (recipeCategory) {
      setFormData({ 
        name: recipeCategory.name ?? "",
        description: recipeCategory.description ?? "",
        parentId: recipeCategory.parentId ?? "", // Fallback a string vacío
      });
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      name: "",
      description: "",
      parentId: "",
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
      description: formData.description,
      parentId: formData.parentId,
    };
  
    if (editingId) {
      dispatch(updateRecipeCategory({ id: editingId, ...data })).then(() => {
        dispatch(fetchRecipeCategories());
        setEditingId(null);
        setFormData({     
          name: "",
          description: "",
          parentId: "",
         });
      });
    } 
  };

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
      field: 'name',
      headerName: 'name',
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

  const rows = recipeCategories.filter((rC) => rC._id && rC.name)
  .map((rC) => ({
    id: rC._id,
    name: rC.name,
    parentId: rC.parentId,
  }))

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Recipe Category' : 'Add New Recipe Category'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="name"
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
            label="description"
            name="description"
            value={formData.description || ""} // Asegura que nunca sea null o undefined
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
              {recipeCategoriesRoot.map((rC) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = rC._id;
                console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {rC.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={rolesTable}>
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
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
            Recipe Category List
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

export default RecipeCategory;
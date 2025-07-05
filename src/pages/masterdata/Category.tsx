import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchCategories,
  fetchCategoriesRoot,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../store/slices/categorySlice';


import {
  formContainer,
  submitButton,
  formTitle,
  generalTable,
  datagridStyle,
  cancelButton,
} from '../../styles/AdminStyles';
import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';

interface Row { // Define la interfaz Row (o usa la que ya tengas)
  id: string;
  parentId?: string; // parentId también puede ser undefined
  // ... otras propiedades
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  prefix: string;
  parentId?: string;
  _level?: number;
}

const generateUniquePrefix = (name: string, existingPrefixes: string[]): string => {
  const base = name.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  let prefix = base;
  let counter = 1;

  while (existingPrefixes.includes(prefix)) {
    prefix = `${base}${counter}`;
    counter++;
  }

  return prefix;
};





const Category: React.FC = () => {

  const dispatch = useAppDispatch();
  const { categories, categoriesRoot, errorMessage, successMessage } = useAppSelector((state) => state.categories);

  const [formData, setFormData] = useState({ name: '', description: '', prefix: '', parentId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

// Cargar las categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCategoriesRoot());
  }, [dispatch]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

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
      dispatch(deleteCategory(selectedId))
        .then(() => dispatch(fetchCategories())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };



  // Función para mostrar el cuadro de diálogo
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

    // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {

    const data = {
      name: formData.name,
      description: formData.description,
      prefix: generateUniquePrefix(formData.name, categories.map(cat => cat.prefix)),
      parentId: formData.parentId, // ✅ Asegura que se incluya en el payload
    };
  
    if (editingId) { 
      console.log('handleConfirmUpdate editingId -> ', editingId)
      dispatch(updateCategory({ id: editingId, ...data })).then(() => {
        dispatch(fetchCategories());
        dispatch(fetchCategoriesRoot())
        setEditingId(null);
        setFormData({ name: '', description: '', prefix: '', parentId: '' });
      });
      //setConfirmDialogOpen(false); // Cierra el diálogo
    }
    
    setFormData({ name: '', description: '', prefix: '', parentId: '' });
    handleDialogClose();
  };

  const handleSubmit = () => {

    const data = {
      name: formData.name,
      description: formData.description,
      prefix: generateUniquePrefix(formData.name, categories.map(cat => cat.prefix)),
      parentId: formData.parentId , // ⬅️ Asegura enviar `null` si no se selecciona
    };
  
    if (editingId ) {
      dispatch(updateCategory({ id: editingId, ...data }))
      .then(() => 
        dispatch(fetchCategories())); // Actualiza la lista después de editar
        setEditingId(null);
        setFormData({ name: '', description: '', prefix: '', parentId: '' });
    } else {
      dispatch(
        createCategory({ 
          name: formData.name, 
          description: 
          formData.description, 
          prefix: generateUniquePrefix(formData.name, categories.map(cat => cat.prefix)),
          parentId: formData.parentId, // Asegura enviar `null` si no se selecciona 
        }))
        .then(() => {
          dispatch(fetchCategories());
          if (!formData.parentId) {
            dispatch(fetchCategoriesRoot()); // ✅ recargar selector de padres
          }
        });
    }
    setFormData({ name: '', description: '', prefix: '', parentId: '' });
  };  

  const handleEdit = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    if (category) {
      setFormData({ 
        name: category.name, 
        description: category.description, 
        prefix: generateUniquePrefix(category.name, categories.map(cat => cat.prefix)),
        parentId: category.parentId ?? "", });
      setEditingId(id);
      //console.log('Set editingId:', id); // Debug para confirmar
    } else {
      console.log('Category not found for id:', id); // Debug para confirmar
    }
  };

    // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // const handleDelete = (id: string) => {
  //   dispatch(deletePermission(id));
  // };

  const handleCancel = () => {
    setFormData({ name: '', description: '', prefix: '', parentId: '' });
    setEditingId(null);
  };


    // Ordenar las categorías jerárquicamente (padres primero, luego hijos)
  const buildHierarchicalRows = () => {
    const idToChildren: { [key: string]: CategoryRow[] } = {};
    const idToRow: { [key: string]: CategoryRow } = {};

    // Indexamos todas las categorías
    categories.forEach(cat => {
      const row = {
        id: cat._id,
        name: cat.name,
        description: cat.description,
        prefix: cat.prefix,
        parentId: cat.parentId,
      };

      idToRow[cat._id] = row;

      const parentId = cat.parentId || "root";
      if (!idToChildren[parentId]) {
        idToChildren[parentId] = [];
      }
      idToChildren[parentId].push(row);
    });

    // Función recursiva para construir lista ordenada
    const result: CategoryRow[] = [];
    const addChildren = (parentId: string | undefined, level: number) => {
      const children = (idToChildren[parentId || "root"] || []).filter(child => !!child.name);
      children.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
      for (const child of children) {
        result.push({ ...child, _level: level });
        addChildren(child.id, level + 1);
      }
    };

    addChildren(undefined, 0);
    return result;
  };

  const rows = buildHierarchicalRows();
  //console.log('rows:', rows);

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
      flex: 0.5,
      //minWidth: 130,
      renderCell: (params) => {
        const indentation = calculateIndentation(params.row.id);
        return (
          <Box sx={{ paddingLeft: `${indentation * 16}px` }}> {/* Sangría visual */}
            {params.value}
          </Box>
        );
      },
    },
    // { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'prefix', 
      headerName: 'Prefix', 
      flex: 0.5,
      //minWidth: 100,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      //minWidth: 140,
      sortable: false,
      filterable: false,
      align: 'left',
      headerAlign: 'center',
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
            onClick={() => handleDeleteDialogOpen(params.row.id)} // Abre el diálogo de confirmación
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  


  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Category' : 'Add New Category'}
        </Typography>
        <Box 
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
          <TextField
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: '300px' },
            }}
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
          {/* <TextField
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
          /> */}
          {/* <TextField
            label="Prefix"
            name="prefix"
            value={formData.prefix}
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
          /> */}

          <FormControl 
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: '300px' },
            }}
            >
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
              {categoriesRoot.map((c) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = c._id;
                console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {c.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>



        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mt: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Button
            variant="contained"
            color="primary"
            type="button" // Asegura que no envíe un formulario por defecto
            onClick={editingId ? handleDialogOpen : handleSubmit} // Abrir cuadro de diálogo si es edición
            startIcon={<SaveIcon />}
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

      {/* Tabla de permisos */}
      <Paper sx={generalTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Categories List
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5, // Configura el tamaño de página inicial
                },
              },
            }}
            pageSizeOptions={[5, 10, 20]} // Opciones para cambiar el tamaño de página
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
        message="Are you sure you want to delete this permission?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

    </Box>

  );
};

export default Category;
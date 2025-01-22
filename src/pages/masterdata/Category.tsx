import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../store/slices/categorySlice';
import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  generalTable,
  datagridStyle,
  cancelButton,
} from '../../styles/AdminStyles';
import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';

const Categories: React.FC = () => {

  const dispatch = useAppDispatch();
  const { categories, errorMessage, successMessage } = useAppSelector((state) => state.categories);

  const [formData, setFormData] = useState({ name: '', description: '', prefix: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchCategories());
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
    if (editingId) { 
      console.log('handleConfirmUpdate editingId -> ', editingId)
      dispatch(updateCategory({ id: editingId, name: formData.name, description: formData.description, prefix: formData.prefix }))
          .then(() => dispatch(fetchCategories())); // Actualiza la lista después de editar
      setEditingId(null);
      //setConfirmDialogOpen(false); // Cierra el diálogo
    }
    setFormData({ name: '', description: '', prefix: '' });
    handleDialogClose();
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updateCategory({ id: editingId, name: formData.name, description: formData.description, prefix: formData.prefix }))
      .then(() => dispatch(fetchCategories())); // Actualiza la lista después de editar
      setEditingId(null);
      setFormData({ name: '', description: '', prefix: '' });
    } else {
      dispatch(createCategory({ name: formData.name, description: formData.description, prefix: formData.prefix }))
        .then(() => dispatch(fetchCategories())); // Actualiza la lista después de crear
    }
    setFormData({ name: '', description: '', prefix: '' });
  };  

  const handleEdit = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    if (category) {
      setFormData({ name: category.name, description: category.description, prefix: category.prefix });
      setEditingId(id);
      //console.log('Set editingId:', id); // Debug para confirmar
    } else {
      console.log('Category not found for id:', id); // Debug para confirmar
    }
  };

  // const handleDelete = (id: string) => {
  //   dispatch(deletePermission(id));
  // };

  const handleCancel = () => {
    setFormData({ name: '', description: '', prefix: '' });
    setEditingId(null);
  };

   // Mapear datos para DataGrid
   const rows = categories.filter((cat) => cat._id && cat.name && cat.description && cat.prefix) // Filtra registros válidos
   .map((category) => ({
     id: category._id, // Usa `_id` como identificador único
     name: category.name,
     description: category.description,
     prefix: category.prefix,
   }));

  //console.log('rows:', rows);

  const columns = [
    { field: 'name', headerName: 'name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'prefix', headerName: 'Prefix', flex: 1 },
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
        <Box sx={inputContainer}>
          <TextField
            label="Category Name"
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
          <TextField
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
          />
        </Box>
        <Box display="flex" gap={2} marginTop="16px">
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

export default Categories;
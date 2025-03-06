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
  fetchPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from '../../store/slices/positionSlice';
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

const Position: React.FC = () => {

  const dispatch = useAppDispatch();
  const { positions, errorMessage, successMessage } = useAppSelector((state) => state.positions);

  const [formData, setFormData] = useState({ name: '', });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPositions());
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
      dispatch(deletePosition(selectedId))
        .then(() => dispatch(fetchPositions())); // Actualiza la lista después de eliminar
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
      dispatch(updatePosition({ id: editingId, name: formData.name,  }))
          .then(() => dispatch(fetchPositions())); // Actualiza la lista después de editar
      setEditingId(null);
      //setConfirmDialogOpen(false); // Cierra el diálogo
    }
    setFormData({ name: '',  });
    handleDialogClose();
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updatePosition({ id: editingId, name: formData.name, }))
      .then(() => dispatch(fetchPositions())); // Actualiza la lista después de editar
      setEditingId(null);
      setFormData({ name: '', });
    } else {
      dispatch(createPosition({ name: formData.name, }))
        .then(() => dispatch(fetchPositions())); // Actualiza la lista después de crear
    }
    setFormData({ name: '', });
  };  

  const handleEdit = (id: string) => {
    const position = positions.find((cat) => cat._id === id);
    if (position) {
      setFormData({ name: position.name, });
      setEditingId(id);
      //console.log('Set editingId:', id); // Debug para confirmar
    } else {
      console.log('Position not found for id:', id); // Debug para confirmar
    }
  };

  // const handleDelete = (id: string) => {
  //   dispatch(deletePermission(id));
  // };

  const handleCancel = () => {
    setFormData({ name: '',  });
    setEditingId(null);
  };

   // Mapear datos para DataGrid
   const rows = positions.filter((cat) => cat._id && cat.name ) // Filtra registros válidos
   .map((cat) => ({
     id: cat._id, // Usa `_id` como identificador único
     name: cat.name,
   }));

  //console.log('rows:', rows);

  const columns = [
    { field: 'name', headerName: 'name', flex: 1 },
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
          {editingId ? 'Edit Position' : 'Add New Position'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Position Name"
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
          Positions List
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

export default Position;
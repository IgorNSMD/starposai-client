import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';


import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  cancelButton,
} from '../../styles/AdminStyles';
import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura

const Settings: React.FC = () => {


  const [formData, setFormData] = useState({ key: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleDeleteDialogClose = () => {
      setIsDeleteDialogOpen(false);
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
      setEditingId(null);
      //setConfirmDialogOpen(false); // Cierra el diálogo
    }
    setFormData({ key: '', description: '' });
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
      if (selectedId) {
        setSelectedId(null);
      }
      handleDeleteDialogClose();
    };

  const handleSubmit = () => {
    if (editingId) {
      setEditingId(null);
      setFormData({ key: '', description: '' });
    } else {
      setEditingId(null);
    }
    setFormData({ key: '', description: '' });
  };  

  const handleCancel = () => {
    setFormData({ key: '', description: '' });
    setEditingId(null);
  };



  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Setting' : 'Add New Setting'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Permission Name"
            name="key"
            value={formData.key}
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

export default Settings;
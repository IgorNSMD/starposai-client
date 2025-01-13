import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem } from '@mui/material';

import { inputContainer, inputField, saveButton } from '../../styles/AdminStyles';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { fetchParameters } from '../../store/slices/parameterSlice';
import { fetchGeneralSettings, updateGeneralSettings } from '../../store/slices/generalSettingSlice'
import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';

interface FormData {
  companyName: string;
  currency: string; // Para manejar la moneda seleccionada
  language: string; // Para manejar el idioma seleccionado
}

const GeneralSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { parameters } = useAppSelector((state) => state.parameters);
  const { settings, successMessage, errorMessage, isLoaded } = useAppSelector((state) => state.generalSettings);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    currency: '',
    language: '',
  });

  useEffect(() => {
    dispatch(fetchParameters());
    dispatch(fetchGeneralSettings());    
  }, [dispatch]);

  useEffect(() => {
    if (isLoaded && settings) {
      setFormData({
        companyName: settings.companyName || '',
        currency: settings.currency || '',
        language: settings.language || '',
      });
    }
  }, [isLoaded, settings]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

  // Filtrar parámetros por categoría
  const currencyParameters = parameters.filter((param) => param.category === 'Currency');
  const languageParameters = parameters.filter((param) => param.category === 'Language');

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

  // Función para mostrar el cuadro de diálogo
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };
  
  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
      setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    //console.log('handleConfirmUpdate... ')
    dispatch(updateGeneralSettings(formData))
        .then(() => dispatch(fetchGeneralSettings())); // Actualiza la lista después de editar
    //setConfirmDialogOpen(false); // Cierra el diálogo    
    handleDialogClose();
  };

  // const handleSave = () => {
  //   dispatch(updateGeneralSettings(formData));
  // };

  return (
    <>
      <Box sx={inputContainer}>
        <TextField 
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            variant="outlined" 
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
      <Box sx={{ ...inputContainer, flexDirection: 'column' }}>
          <FormControl sx={{ width: '100%' }}>
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
              Currency
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              {currencyParameters.map((r) => {
                const uniqueKey = r._id;
                //console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={r.key}>
                    {r.key}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>          
          <FormControl sx={{ width: '100%', marginTop: '10px' }}>
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
              Language
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
            >
              {languageParameters.map((r) => {
                const uniqueKey = r._id;
                return (
                  <MenuItem key={uniqueKey} value={r.key}>
                    {r.key}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>             
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '5px' }}> {/* Contenedor flex */}
        <Button 
          variant="contained" 
          sx={saveButton} 
          onClick={handleDialogOpen}
          >
            Save
        </Button>      
      </Box>

      {/* Cuadro de diálogo de confirmación */}
      <Dialog
        isOpen={isDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this setting?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmUpdate}
      />      

    </>

  );
};

export default GeneralSettings;

import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem } from '@mui/material';

import { inputContainer, inputField, saveButton } from '../../styles/AdminStyles';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { fetchParameters } from '../../store/slices/parameterSlice';

interface FormData {
  companyName: string;
  currency: string; // Para manejar la moneda seleccionada
  language: string; // Para manejar el idioma seleccionado
}

const GeneralSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { parameters } = useAppSelector((state) => state.parameters);

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    currency: '',
    language: '',
  });

  // Filtrar parámetros por categoría
  const currencyParameters = parameters.filter((param) => param.category === 'Currency');
  const languageParameters = parameters.filter((param) => param.category === 'Language');

  useEffect(() => {
    dispatch(fetchParameters());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchParameters());
  }, [dispatch]);

  console.log('parameters ->', parameters)

        // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  return (
    <>
      <Box sx={inputContainer}>
        <TextField 
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={r.value}>
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
                  <MenuItem key={uniqueKey} value={r.value}>
                    {r.key}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>             
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '5px' }}> {/* Contenedor flex */}
        <Button variant="contained" sx={saveButton}>
            Save
        </Button>      
      </Box>

    </>

  );
};

export default GeneralSettings;

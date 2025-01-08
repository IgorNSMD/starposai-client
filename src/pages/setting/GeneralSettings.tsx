import React from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import { inputContainer, inputField, saveButton } from '../../styles/AdminStyles';

const GeneralSettings: React.FC = () => {
  return (
    <>
      <Box sx={inputContainer}>
        <TextField 
            label="Company Name" 
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
      <Box sx={inputContainer}>
        <TextField 
            label="Currency" 
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
        <TextField 
            label="Languaje" 
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}> {/* Contenedor flex */}
        <Button variant="contained" sx={saveButton}>
            Save
        </Button>      
      </Box>

    </>

  );
};

export default GeneralSettings;

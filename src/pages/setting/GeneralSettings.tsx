import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { inputContainer, inputField, submitButton } from '../../styles/AdminStyles';

const GeneralSettings: React.FC = () => {
  return (
    <Box sx={inputContainer}>
      <TextField label="Company Name" variant="outlined" sx={inputField} />
      <TextField label="Currency" variant="outlined" sx={inputField} />
      <TextField label="Tax Rate (%)" variant="outlined" sx={inputField} />
    </Box>
  );
};

export default GeneralSettings;

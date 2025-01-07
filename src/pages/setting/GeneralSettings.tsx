import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { formContainerTab, inputField, submitButton } from '../../styles/AdminStyles';

const GeneralSettings: React.FC = () => {
  return (
    <Box sx={formContainerTab}>
      <TextField label="Company Name" variant="outlined" sx={inputField} />
      <TextField label="Currency" variant="outlined" sx={inputField} />
      <TextField label="Tax Rate (%)" variant="outlined" sx={inputField} />
      <Button variant="contained" sx={submitButton}>
        Save
      </Button>
    </Box>
  );
};

export default GeneralSettings;

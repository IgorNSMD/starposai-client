import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, title, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        textAlign: 'center',        
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: '16px', color: "#666" }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '24px' }}>
        {message}
      </Typography>
      <Box display="flex" justifyContent="center" gap={2}>
        <Button variant="outlined" color="error" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Box>
    </Box>
  );
};

export default Dialog;
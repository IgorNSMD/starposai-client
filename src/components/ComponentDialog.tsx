import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ComponentDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ComponentDialog: React.FC<ComponentDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#333' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={onClose} variant="outlined" color="error">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentDialog;

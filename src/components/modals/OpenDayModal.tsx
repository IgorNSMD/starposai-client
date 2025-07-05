// src/components/modals/OpenDayModal.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

interface OpenDayModalProps {
  open: boolean;
  onConfirm: () => void;
}

const OpenDayModal: React.FC<OpenDayModalProps> = ({ open, onConfirm }) => {
  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>Abrir Día</DialogTitle>
      <DialogContent>
        <Typography>
          Para comenzar a operar en el punto de venta, debes abrir el día de caja.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Abrir Día
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenDayModal;

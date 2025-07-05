import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { closeDaySales } from "../../store/slices/saleSlice";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CloseDayModal = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { dayCloseSummary, loading } = useAppSelector((state) => state.sales);
  const [submitted, setSubmitted] = useState(false);

  const handleCloseDay = async () => {
    setSubmitted(true);
    await dispatch(closeDaySales());
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "bold", color: "#666" }}>Cerrar Día</DialogTitle>
      <DialogContent dividers>
        {!submitted ? (
          <Typography>
            ¿Estás seguro que deseas cerrar el día? Esta acción calculará los
            totales de ventas del día actual.
          </Typography>
        ) : loading ? (
          <CircularProgress />
        ) : dayCloseSummary ? (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resumen del Día
            </Typography>
            <Typography>
              Fecha: {new Date(dayCloseSummary.date).toLocaleDateString()}
            </Typography>
            <Typography>
              Total efectivo: {formatCurrency(dayCloseSummary.cashTotal)}
            </Typography>
            <Typography>
              Total tarjeta: {formatCurrency(dayCloseSummary.cardTotal)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cerrado por: {dayCloseSummary.closedBy}
            </Typography>
          </>
        ) : (
          <Typography color="error">Error al cerrar el día.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        {!submitted && (
          <Button onClick={handleCloseDay} variant="contained" color="primary">
            Confirmar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CloseDayModal;

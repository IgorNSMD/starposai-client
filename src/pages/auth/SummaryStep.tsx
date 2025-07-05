// 📂 src/pages/auth/SummaryStep.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🔍 Importar useNavigate
import { Box, Button, Typography, CircularProgress } from "@mui/material";

import { useAppSelector, useAppDispatch } from "../../store/redux/hooks";
import { resetRegistration, submitRegistration } from "../../store/slices/registrationSlice";

const SummaryStep: React.FC<{ handleBack: () => void }> = ({handleBack}) => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // 🔍 Inicializar useNavigate

  const { company, venue, selectedRole, status, error } = useAppSelector((state) => state.registration);

  const handleSubmit = () => {
    dispatch(submitRegistration());
  };

  // 🔍 Detectar cuando el registro se completa exitosamente
  useEffect(() => {
    if (status === "success") {
      dispatch(resetRegistration()); // Limpiar el estado para futuros registros
      navigate("/login"); // Redirigir al login
    }
  }, [status, dispatch, navigate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography>📌 Nombre de la Empresa: {company.name}</Typography>
      <Typography>📌 Nombre del Local: {venue.name}</Typography>
      <Typography>📌 Usuario: {venue.email}</Typography>
      <Typography>📌 Dirección: {venue.address}</Typography>
      <Typography>📌 Moneda: {venue.currency}</Typography>
      <Typography>📌 Rol seleccionado: {selectedRole}</Typography>      

      {status === "loading" && <CircularProgress />}
      {status === "error" && <Typography color="error">{error}</Typography>}
      {status === "success" && <Typography color="success">✅ ¡Registro completado!</Typography>}      
      
      {/* Agrega el botón de retroceso */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={handleBack} variant="outlined">
          Atrás
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={status === "loading"}>
          {status === "loading" ? "Registrando..." : "Finalizar"}
        </Button>
      </Box>      
    </Box>
  );
};

export default SummaryStep;

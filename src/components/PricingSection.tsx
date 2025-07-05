import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";

import PricingCard from "./PricingCard";

import { setSelectedRole, setSelectedPlanCode, resetRegistration } from "../store/slices/registrationSlice";
import { useAppDispatch } from "../store/redux/hooks";

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  excludedFeatures?: string[];
  highlight?: boolean;
  buttonText: string;       // ✅ Añadido
  buttonCode: string;        // ✅ Añadido
  allowedRole: string;     // ✅ Añadido
}

const PricingSection: React.FC = () => {
  const [pricingData, setPricingData] = useState<{ title: string; description: string; plans: PricingPlan[] } | null>(null);
  const dispatch = useAppDispatch();

  // 📌 Se ejecuta solo al entrar al formulario
  useEffect(() => {
    dispatch(resetRegistration());
  }, [dispatch]);

  useEffect(() => {
    if (!pricingData) {  // Solo cargar si aún no se ha cargado
      import("../data/homeContent.json")
        .then((data) => {
          //console.log("✅ JSON cargado correctamente.");
          setPricingData(data.pricing);
        })
        .catch((error) => console.error("Error loading content:", error));
    }
  }, [pricingData]); // 👈 Se asegura de no cargar el JSON nuevamente

  const handleSelectPlan = (buttonCode: string, allowedRole: string) => {
    //console.log("🚀 Se seleccionó el role: ", allowedRole); // 👈 Prueba con un console.log    
    //console.log("📌 Iniciando dispatch para setSelectedRole...");
    dispatch(setSelectedPlanCode(buttonCode));
    dispatch(setSelectedRole(allowedRole)); // 👈 Guardar el rol seleccionado en Redux
    //console.log("✅ Dispatch completado para setSelectedRole.");

    // Guardar en localStorage
    //localStorage.setItem("STARPOSAIPlanCode", buttonCode);
    //localStorage.setItem("STARPOSAIRole", allowedRole);

  };

  if (!pricingData) return null;

  return (
    <Box
      id="pricing"
      sx={{
        py: 10,
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        paddingTop: "100px",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          {pricingData.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {pricingData.description}
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {pricingData.plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <PricingCard 
                  {...plan} 
                  onSelect={handleSelectPlan} // 👈 Añadido para manejar la selección
                />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingSection;

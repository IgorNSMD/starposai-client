// 📂 src/pages/auth/StepperNavigation.tsx
import React from "react";
import { Box, Button } from "@mui/material";

interface Props {
  activeStep: number;
  handleBack: () => void;
  onNext: () => void; // ✅ Cambiamos handleNext por onNext para permitir control en los formularios
  steps: string[];
}

const StepperNavigation: React.FC<Props> = ({ activeStep, handleBack, onNext, steps }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
      <Button disabled={activeStep === 0} onClick={handleBack}>
        Atrás
      </Button>
      <Button variant="contained" onClick={onNext}>
        {activeStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
      </Button>
    </Box>
  );
};

export default StepperNavigation;

// 📂 src/pages/auth/RegisterCompany.tsx
import React, { useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";

//import { useAppSelector } from "../../store/redux/hooks";
import CompanyForm from "./CompanyForm";
import VenueForm from "./VenueForm";
//import UserForm from "./UserForm";
import PaymentMethodStep from "./PaymentMethodStep";
import SummaryStep from "./SummaryStep";
//import StepperNavigation from "./StepperNavigation";


//const steps = ["Empresa", "Local", "Usuario", "Resumen"];
const steps = ["Empresa", "Local", "Pago", "Resumen"];

const RegisterCompany: React.FC = () => {


  const [activeStep, setActiveStep] = useState(0);



  // useEffect(() => {
  //   // Recuperar datos desde localStorage
  //   const storedRole = localStorage.getItem("STARPOSAIRole");
  //   const storedPlanCode = localStorage.getItem("STARPOSAIPlanCode");

  //   if (storedRole) {
  //     dispatch(setSelectedRole(storedRole));
  //     console.log("📥 Recuperado de localStorage - selectedRole:", storedRole);
  //   }
    
  //   if (storedPlanCode) {
  //     dispatch(setSelectedPlanCode(storedPlanCode));
  //     console.log("📥 Recuperado de localStorage - selectedPlanCode:", storedPlanCode);
  //   }
  // }, [dispatch]);



  // 📌 Manejo del cambio de paso
  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, bgcolor: "white", borderRadius: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Registro de Empresa
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
      {activeStep === 0 && <CompanyForm handleNext={handleNext} />}
        {activeStep === 1 && <VenueForm handleNext={handleNext} handleBack={handleBack} />}
        {/* {activeStep === 2 && <UserForm handleNext={handleNext} handleBack={handleBack} />} */}
        {activeStep === 2 && <PaymentMethodStep handleNext={handleNext} handleBack={handleBack} />}
        {activeStep === 3 && <SummaryStep handleBack={handleBack} />}
        {/* <StepperNavigation activeStep={activeStep} handleBack={handleBack} handleNext={handleNext} steps={steps} /> */}
      </Box>
    </Box>
  );
};

export default RegisterCompany;
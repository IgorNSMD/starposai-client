import React, { useEffect, useState } from "react";
import { Box, Card, CardActionArea, CardContent, Typography, Grid, Button } from "@mui/material";
//import PaymentIcon from "@mui/icons-material/Payment";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchParametersByCategory } from "../../store/slices/parameterSlice";
import { setSelectedPaymentMethod } from "../../store/slices/registrationSlice";

import { baseURL_PAYMENTICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable
import { Parameter } from "../../types/types"; // Ajusta la ruta según corresponda

const PaymentMethodStep: React.FC<{ handleNext: () => void; handleBack: () => void }> = ({ handleNext, handleBack }) => {
  const dispatch = useAppDispatch();
  const paymentMethods = useAppSelector(
    //(state) => state.parameters.parametersByCategory["PaymentMethod"] || []
    (state): Parameter[] => state.parameters.parametersByCategory["PaymentMethod"] || []
  );
  const selected = useAppSelector((state) => state.registration.selectedPaymentMethod);
  

  const [selectedKey, setSelectedKey] = useState(selected);

  useEffect(() => {
    if (paymentMethods.length === 0) {
      dispatch(fetchParametersByCategory("PaymentMethod"));
    }
  }, [dispatch, paymentMethods]);

  const handleSelect = (methodKey: string) => {
    setSelectedKey(methodKey);
    dispatch(setSelectedPaymentMethod(methodKey));
    //setTimeout(() => handleNext(), 300); // Pequeño delay para feedback visual
  };

  const getIconUrl = (iconPath: string) => {
      return iconPath && !iconPath.startsWith('http')
        ? `${baseURL_PAYMENTICONS}/${iconPath}`
        : iconPath;
    };

  

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Selecciona tu método de pago
      </Typography>
      <Grid container spacing={2}>
        {paymentMethods
          .filter((m) => m.isActive)
          .map((method) => (
            <Grid item xs={12} sm={4} key={method.key}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: selectedKey === method.key ? "primary.main" : "grey.300",
                  boxShadow: selectedKey === method.key ? 4 : 1,
                }}
              >
                <CardActionArea onClick={() => handleSelect(method.key)}>
                  <CardContent>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      flexDirection="column"
                    >
                    <img
                      src={getIconUrl(method.icon || "")}
                      alt={method.value}
                      style={{
                        width: "128px",   // 🔼 Subido desde 48px
                        height: "128px",
                        objectFit: "contain", // Mantiene proporción
                        marginBottom: "8px",
                      }}
                    />
                      {/* <Typography variant="subtitle1">{method.value}</Typography> */}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" onClick={handleBack}>
          Atrás
        </Button>
        <Button 
          variant="contained" 
          onClick={() => selectedKey && handleNext()} 
          disabled={!selectedKey}
        >
          Siguiente
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentMethodStep;
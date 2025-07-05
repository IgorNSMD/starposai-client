// Paso 1: Adaptar el selector de tipo de pedido a vista móvil

import React from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, useMediaQuery, Stack } from "@mui/material";

interface OrderTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ value, onChange }) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <FormControl component="fieldset" fullWidth>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Tipo de Pedido
      </Typography>
      <RadioGroup
        row={!isMobile} // Si es móvil, se muestra en columna
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={isMobile ? 1 : 3}
          sx={{ pl: 1 }}
        >
          <FormControlLabel
            value="quick"
            control={<Radio color="primary" />}
            label="Pedido Rápido"
          />
          <FormControlLabel
            value="table"
            control={<Radio color="primary" />}
            label="Pedido en Mesa"
          />
        </Stack>
      </RadioGroup>
    </FormControl>
  );
};

export default OrderTypeSelector;
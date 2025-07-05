import React from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importa useNavigate

import { Box, Button, Typography, List, ListItem, ListItemIcon } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  excludedFeatures?: string[];
  highlight?: boolean;
  buttonText: string;
  buttonCode: string;
  allowedRole: string;
  onSelect: (buttonCode: string, allowedRole: string) => void; // 👈 Nuevo Prop
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  name, price, features, excludedFeatures, highlight, buttonText, buttonCode, allowedRole, onSelect 
}) => {



  const navigate = useNavigate(); // 👈 Hook para la navegación

  // Función condicional para manejar el onClick
  const handleClick = () => {
    
    if (buttonCode === "1") {
      //console.log('PricingCard -- allowedRole', allowedRole)
      onSelect(buttonCode, allowedRole); // 👈 Pasar los valores seleccionados al handler
      navigate("/registerCompany"); // Redirige a la página de registro
    }
  };
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "12px",
        boxShadow: 3,
        backgroundColor: "white",
        textAlign: "center",
        transition: "0.3s",
        transform: highlight ? "scale(1.05)" : "scale(1)",
        borderTop: highlight ? "4px solid #47b2e4" : "none",
        "&:hover": {
          boxShadow: 6,
          transform: "scale(1.08)",
        }
      }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ color: highlight ? "#47b2e4" : "inherit" }}>
        {name}
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: "#47b2e4" }}>
        ${price} <Typography component="span" variant="body2">/ month</Typography>
      </Typography>

      <List sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <ListItem key={index} sx={{ display: "flex", alignItems: "center" }}>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            {feature}
          </ListItem>
        ))}
        {excludedFeatures &&
          excludedFeatures.map((feature, index) => (
            <ListItem key={index} sx={{ display: "flex", alignItems: "center", color: "gray", textDecoration: "line-through" }}>
              <ListItemIcon>
                <CancelIcon color="disabled" />
              </ListItemIcon>
              {feature}
            </ListItem>
          ))}

          <Button 
            variant="contained"
            sx={{ mt: 2, backgroundColor: "primary.main", "&:hover": { backgroundColor: "primary.dark" } }}
            onClick={handleClick} // 👈 Evento condicional
          >
            {buttonText}
          </Button>
      </List>
    </Box>
  );
};

export default PricingCard;

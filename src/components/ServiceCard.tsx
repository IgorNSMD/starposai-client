import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GridOnIcon from "@mui/icons-material/GridOn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import WifiIcon from "@mui/icons-material/Wifi";

// Mapa de iconos para los servicios
const iconMap = [TrendingUpIcon, GridOnIcon, EventNoteIcon, WifiIcon];

interface ServiceCardProps {
  title: string;
  description: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, index }) => {
  const IconComponent = iconMap[index] || TrendingUpIcon; // ✅ Usa un ícono por defecto si el índice no existe

  return (
    <Card
      sx={{
        textAlign: "center",
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        transition: "0.3s",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        {/* ✅ Icono dinámico */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <IconComponent sx={{ fontSize: 40, color: "#47b2e4" }} />
        </Box>

        {/* ✅ Título y descripción */}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;

import React, { useEffect, useState } from "react";
import { 
    Box, Container, Grid, Typography, 
    //Paper 
} from "@mui/material";

// import ShowChartIcon from "@mui/icons-material/ShowChart";
// import GridOnIcon from "@mui/icons-material/GridOn";
// import EventIcon from "@mui/icons-material/Event";
// import WifiTetheringIcon from "@mui/icons-material/WifiTethering";

import ServiceCard from "./ServiceCard"; // Importa el componente de cada servicio

// Mapear los íconos a cada servicio
// const iconMap: Record<number, JSX.Element> = {
//     0: <ShowChartIcon sx={{ fontSize: 40, color: "primary.main" }} />,
//     1: <GridOnIcon sx={{ fontSize: 40, color: "primary.main" }} />,
//     2: <EventIcon sx={{ fontSize: 40, color: "primary.main" }} />,
//     3: <WifiTetheringIcon sx={{ fontSize: 40, color: "primary.main" }} />
//   };

const ServicesSection: React.FC = () => {

    const [servicesData, setServicesData] = useState<{
        title: string;
        description: string;
        items: { title: string; description: string }[];
    } | null>(null);

    useEffect(() => {
        import("../data/homeContent.json")
          .then((data) => setServicesData(data.services))
          .catch((error) => console.error("Error loading content:", error));
      }, []);
    
      if (!servicesData) return null;

  return (
<Box
      id="services"
      sx={{
        bgcolor: "#f4f4f4",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingY: 10,
        position: "relative",
        paddingTop: "200px",
      }}
    >
      <Container maxWidth="lg">
        {/* ✅ Título y descripción dinámicos */}
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom sx={{ textAlign: "center" }}>
          {servicesData.title}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", mb: 4 }}>
          {servicesData.description}
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {servicesData.items.map((service, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <ServiceCard title={service.title} description={service.description} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServicesSection;

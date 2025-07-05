import React, { useEffect, useState } from "react";
import { Box, Container, Grid, Typography, List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface AboutContent {
  title: string;
  description1: string;
  description2: string;
  list: string[];
  buttonText: string;
}

const AboutSection: React.FC = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    import("../data/homeContent.json")
      .then((data) => setAboutContent(data.about as AboutContent)) // Cast explícito a AboutContent
      .catch((error) => console.error("Error loading content:", error));
  }, []);

  if (!aboutContent) return null; // Evita mostrar contenido vacío mientras carga

  return (
    <Box
      id="about"
      sx={{
        py: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f4f4",
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        paddingTop: "200px",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          {aboutContent.title}
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>{aboutContent.description1}</Typography>
            <List>
              {aboutContent.list.map((item: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>{aboutContent.description2}</Typography>
            <Button variant="contained" color="primary">{aboutContent.buttonText}</Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutSection;

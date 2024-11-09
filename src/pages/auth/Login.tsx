import React from "react";
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import starposaiLogo from "../../assets/starposai-logo.png"; // Puedes usar un logo similar al de Toast

const Login: React.FC = () => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Aquí iría la lógica para autenticar al usuario
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <img src={starposaiLogo} alt="Logo" style={{ width: "150px", marginBottom: "20px" }} />
        <Typography component="h1" variant="h5">
          Inicia Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar Sesión
          </Button>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link to="/register" style={{ textDecoration: "none", color: "#3f51b5" }}>
                ¿No tienes cuenta? Regístrate
              </Link>
            </Grid>
            <Grid item>
              <Link to="/forgotpassword" style={{ textDecoration: "none", color: "#3f51b5" }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
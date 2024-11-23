import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const Login: React.FC = () => {
    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Login submitted');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center', // Centrado horizontal
                alignItems: 'center', // Centrado vertical
                minHeight: '100vh', // Asegura que ocupe el espacio de la ventana
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: 400, // Define el ancho máximo del contenedor
                    backgroundColor: '#ffffff', // Fondo blanco para contraste
                }}
            >
                <Typography variant="h4" gutterBottom align="center">
                    Login
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;

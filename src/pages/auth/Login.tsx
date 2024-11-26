import React from 'react';
import { Box, TextField, Button, Typography, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Login submitted');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'transparent', // Mantiene el fondo visible
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: '#ffffff',
                }}
            >
                <Typography variant="h4" gutterBottom align="center">
                    Login
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                    <TextField
                      label="Email address"
                      type="email"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      required
                      slotProps={{
                        input: {
                          sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '1px', // Asegura un borde consistente
                              borderColor: 'rgba(0, 0, 0, 0.23)', // Color estándar para el borde
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#47b2e4', // Color del borde al pasar el mouse
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#47b2e4', // Color del borde al enfocarse
                            },
                          },
                        },
                        inputLabel: {
                          shrink: true, // Mantén el comportamiento de la etiqueta siempre visible
                          sx: {
                            color: '#444444', // Ajusta el color de la etiqueta inicial
                            '&.Mui-focused': {
                              color: '#47b2e4', // Color de la etiqueta al enfocarse
                            },
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      required
                      slotProps={{
                        input: {
                          sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderWidth: '1px', // Consistencia del borde
                              borderColor: 'rgba(0, 0, 0, 0.23)', // Color inicial del borde
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#47b2e4', // Color al pasar el mouse
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#47b2e4', // Color al enfocar
                            },
                          },
                        },
                        inputLabel: {
                          shrink: true, // Mantén la etiqueta visible en todo momento
                          sx: {
                            color: '#444444', // Color inicial de la etiqueta
                            '&.Mui-focused': {
                              color: '#47b2e4', // Color de la etiqueta al enfocarse
                            },
                          },
                        },
                      }}
                    />

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Sign In
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 2,
                    }}
                >
                    <Link href="/register" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Create an Account
                    </Link>
                    <Link href="/forgot-password" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Forgot Password?
                    </Link>
                </Box>
                <Button
                    onClick={() => navigate('/')}
                    variant="text"
                    fullWidth
                    sx={{ mt: 2, textTransform: 'none', color: 'primary.main' }}
                >
                    Back to Home
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
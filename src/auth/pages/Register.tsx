import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const navigate = useNavigate();

    const handleRegister = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Register submitted');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'transparent',
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
                    Register
                </Typography>
                <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                    <TextField
                        label="Name"
                        type="Name"
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
                        Register
                    </Button>
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

export default Register;
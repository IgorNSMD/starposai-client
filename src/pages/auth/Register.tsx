import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { registerUser, clearMessages } from '../../store/slices/authSlice';

const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { successMessage, errorMessage } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
        ...formData,
        [event.target.name]: event.target.value,
    });
  };

  const handleRegister = async (event: React.FormEvent) => {
    console.log('handledRegister..')
    event.preventDefault();
    console.log('preventDefault..')
    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
        navigate('/login'); // Redirige al login tras el registro exitoso
    }
  };

  useEffect(() => {

    if (successMessage) {
        toast.success(successMessage)
        dispatch(clearMessages())  
        navigate('/')
    }
    if (errorMessage) {
        toast.error(errorMessage)
        dispatch(clearMessages())
    }
    

  },[successMessage,errorMessage, dispatch, navigate])

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
                        name="name" // Agregado para que coincida con la propiedad en formData
                        label="Name"
                        type="text"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                        value={formData.name}
                        onChange={handleChange}                        
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
                      name="email" // Agregado para que coincida con la propiedad en formData
                      label="Email address"
                      type="email"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      required
                      value={formData.email}
                      onChange={handleChange}                      
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
                      name="password" // Agregado para que coincida con la propiedad en formData
                      label="Password"
                      type="password"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      required
                      value={formData.password}
                      onChange={handleChange}                      
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
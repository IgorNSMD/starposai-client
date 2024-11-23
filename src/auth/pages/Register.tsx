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
                        type="text"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                    />
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
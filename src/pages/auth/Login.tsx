import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { loginUser, clearErrorMessage } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { errorMessage } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearErrorMessage());
  }, [dispatch]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/admin');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `
          linear-gradient(rgba(55, 81, 126, 0.75), rgba(44, 62, 80, 0.85)),
          url('/background-login.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Open Sans', sans-serif",
        padding: 2, // 👈 mejora márgenes en móviles pequeños
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography variant="h5" fontWeight="bold" align="center" mb={3}>
          Login
        </Typography>

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Email address"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: {
                  color: '#444444',
                  '&.Mui-focused': {
                    color: '#47b2e4',
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: {
                  color: '#444444',
                  '&.Mui-focused': {
                    color: '#47b2e4',
                  },
                },
              },
            }}            
          />

          {errorMessage && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: '#0ea5e9',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#0284c7',
              },
            }}
          >
            Sign In
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            fontSize: '0.875rem',
          }}
        >
          <Link href="/" underline="hover">Back to Home</Link>
          <Link href="/forgot-password" underline="hover">Forgot Password?</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

const Login: React.FC = () => (
  <Box
    sx={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}
  >
    <Typography variant="h4" gutterBottom>
      Login
    </Typography>
    <Box component="form">
      <Box sx={{ marginBottom: '16px' }}>
        <TextField fullWidth label="Your Email" variant="outlined" />
      </Box>
      <Box sx={{ marginBottom: '16px' }}>
        <TextField fullWidth label="Password" type="password" variant="outlined" />
      </Box>
      <Button
        fullWidth
        variant="contained"
        sx={{ padding: '10px', fontWeight: 'bold', textTransform: 'none' }}
      >
        Sign In
      </Button>
    </Box>
  </Box>
);

export default Login;
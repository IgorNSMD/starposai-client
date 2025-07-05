import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import heroImg from '../assets/img/hero-img.png';

const HomeSection: React.FC = () => {
  return (
    <Box
      component="section"
      id="hero"
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#37517e',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: `'Open Sans', sans-serif`,
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          width: '100%',
          px: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
          alignItems: 'center',
        }}
      >
        {/* Bloque de texto */}
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: '700',
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Mejores soluciones para la innovación
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: '#d2d6dc',
              mb: 4,
            }}
          >
            Tenemos las herramientas para hacer grande su negocio
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              href="#about"
              sx={{
                backgroundColor: '#47b2e4',
                textTransform: 'none',
                fontWeight: '600',
                borderRadius: '30px',
                px: 4,
                '&:hover': {
                  backgroundColor: '#1a8ecf',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#fff',
                color: '#fff',
                textTransform: 'none',
                borderRadius: '30px',
                px: 3,
                '&:hover': {
                  borderColor: '#47b2e4',
                  color: '#47b2e4',
                },
              }}
            >
              Ver Video
            </Button>
          </Box>
        </Box>

        {/* Imagen */}
        <Box sx={{ textAlign: 'center' }}>
          <img src={heroImg} alt="Hero" style={{ width: '100%' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default HomeSection;
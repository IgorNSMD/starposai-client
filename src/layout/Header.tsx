import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { FiMenu } from 'react-icons/fi'; // Para el icono de menú
import { useNavigate } from 'react-router-dom';

import starposaiLogo from "../assets/starposai-logo.png"; // Puedes usar un logo similar al de Toast

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleLoginRedirect = () => {
  //   navigate('/Login'); // Redirige a la página de Login
  // };

  return (
    <AppBar position="static" style={{ backgroundColor: '#FFFFFF'}}>
      <Toolbar>
        {/* Logo de la izquierda */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer', color: '#25254F', fontWeight: 'bold' }} onClick={() => navigate('/register')}>
          <img src={starposaiLogo} alt="Logo" style={{ width: "150px", marginBottom: "10px", marginTop: "10px" }} />
        </Typography>

        {/* Menú principal con iconos */}
        <Box sx={{ display: 'flex', gap: '1rem', color: '#25254F' }}>
          <IconButton color="inherit" onClick={() => navigate('/dashboard/CustomerList')}>
            <FiMenu /> {/* Puedes personalizar este icono o agregar más */}
          </IconButton>
        </Box>

        {/* Menú de usuario */}
        <div>
          <IconButton color="inherit" sx={{ color: '#25254F' }} onClick={handleMenu}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Perfil</MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Configuración</MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/logout'); }}>Cerrar sesión</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
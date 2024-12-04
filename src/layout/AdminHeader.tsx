import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userInfo } = useAppSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login'); // Redirige al login después del logout
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#37517e', zIndex: 1201 }}>
      <Toolbar>
        {/* Botón para colapsar el Sidebar */}
        <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>

        {/* Título del Dashboard */}
        <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: '10px' }}>
          Dashboard
        </Typography>

        {/* Iconos del Header */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit">
            <MailOutlineIcon />
          </IconButton>
          <IconButton color="inherit">
            <NotificationsNoneIcon />
          </IconButton>

          {/* Menú desplegable para el usuario */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            {userInfo?.email ? (
              <Avatar alt={userInfo.email} src="/broken-image.jpg" />
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>

          {/* Menú */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: '#ffffff', // Fondo claro
                color: '#333333', // Texto oscuro
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombra suave
              },
            }}
          >
            <MenuItem
              onClick={handleMenuClose}
              sx={{
                color: '#333333', // Asegura el color oscuro del texto
                '&:hover': {
                  backgroundColor: '#f1f1f1', // Fondo al pasar el mouse
                },
              }}
            >
              Perfil
            </MenuItem>
            <MenuItem
              onClick={handleMenuClose}
              sx={{
                color: '#333333', // Asegura el color oscuro del texto
                '&:hover': {
                  backgroundColor: '#f1f1f1',
                },
              }}
            >
              Cambiar contraseña
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: '#333333', // Asegura el color oscuro del texto
                '&:hover': {
                  backgroundColor: '#f1f1f1',
                },
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
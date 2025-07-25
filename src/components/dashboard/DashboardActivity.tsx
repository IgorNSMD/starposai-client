import { useState } from 'react';
import { Paper, Typography, Box, Menu, MenuItem, } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import InventoryIcon from '@mui/icons-material/Inventory'; // Para compras



import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectDashboardActivity } from '../../store/redux/selectors/dashboardSelectors';
import { fetchDashboardActivity } from '../../store/slices/dashboardSlice';


// const activities = [
//   { time: '32 min', desc: 'Pedido #342 entregado', color: 'success.main' },
//   { time: '56 min', desc: 'Nueva reserva de mesa', color: 'error.main' },
//   { time: '2 hrs', desc: 'Producto "Coca Cola" agotado', color: 'info.main' },
//   { time: '1 día', desc: 'Ingreso de nuevo proveedor', color: 'primary.main' },
//   { time: '2 días', desc: 'Actualización de stock realizada', color: 'warning.main' },
//   { time: '4 semanas', desc: 'Nuevo cliente registrado', color: 'grey.600' },
// ];

type Props = {
  range: 'today' | 'month' | 'year';
  setRange: React.Dispatch<React.SetStateAction<'today' | 'month' | 'year'>>;
};

const getIconByType = (type: string) => {
  switch (type) {
    case 'sale':
      return <ShoppingCartIcon sx={{ fontSize: 18, color: 'success.main' }} />;
    case 'purchase':
      return <InventoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />;
    case 'reservation':
      return <EventSeatIcon sx={{ fontSize: 18, color: 'error.main' }} />;
    default:
      return <FiberManualRecordIcon sx={{ fontSize: 12, color: 'grey.600' }} />;
  }
};

const DashboardActivity = ({ range, setRange }: Props) => {
  const dispatch = useAppDispatch();
  const activities = useAppSelector(selectDashboardActivity) ?? [];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  
  
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleSelectRange = (newRange: 'today' | 'month' | 'year') => {
    setRange(newRange); // ← actualiza el estado global que viene del padre
    dispatch(fetchDashboardActivity({ range: newRange })); // ← ejecuta el thunk con el nuevo rango
    handleCloseMenu();
  };




  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        bgcolor: 'white',
        height: '100%',
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
        Actividad Reciente
        {/* Botón de menú de rango */}
        {/* <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton> */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem selected={range === 'today'} onClick={() => handleSelectRange('today')}>Hoy</MenuItem>
          <MenuItem selected={range === 'month'} onClick={() => handleSelectRange('month')}>Este mes</MenuItem>
          <MenuItem selected={range === 'year'} onClick={() => handleSelectRange('year')}>Este año</MenuItem>
        </Menu>
      </Typography>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
        {/* Línea vertical central */}
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 10,
            bottom: 0,
            width: 2,
            bgcolor: 'grey.300',
            zIndex: 0,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: 4,
            },
          }}
        />

        {activities.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              position: 'relative',
              zIndex: 1,
              maxHeight: 360,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc',
                borderRadius: 3,
              },
              '&:hover::-webkit-scrollbar-thumb': {
                backgroundColor: '#999',
              },
            }}
          >
            {/* Tiempo */}
            <Box sx={{ minWidth: 55, fontSize: 12, color: 'text.primary', mt: 0.5 }}>
              {item.time}
            </Box>

            {/* Punto e ícono */}
            <Box sx={{ position: 'relative', mt: 0.5 }}>
              {getIconByType(item.type || '')}
            </Box>

            {/* Descripción */}
            <Box sx={{ fontSize: 14, color: 'text.primary' }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: index % 2 === 0 ? 600 : 400 }}
              >
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default DashboardActivity;
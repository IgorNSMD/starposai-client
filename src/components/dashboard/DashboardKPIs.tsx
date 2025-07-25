import { useState } from 'react';
import {
  Grid,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // 👈 Icono de tres puntos
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';

import DashboardKPICard from './DashboardKPICard';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { selectDashboardKpis } from '../../store/redux/selectors/dashboardSelectors';
import { fetchDashboardKpis } from '../../store/slices/dashboardSlice';

type Props = {
  range: 'today' | 'month' | 'year';
  setRange: React.Dispatch<React.SetStateAction<'today' | 'month' | 'year'>>;
};

const DashboardKPIs = ({ range, setRange }: Props) => {
  const dispatch = useAppDispatch();
  const kpis = useAppSelector(selectDashboardKpis) ?? {
    sales: 0,
    revenue: 0,
    itemsSold: 0,
    percentageSales: 0,
    percentageRevenue: 0,   
    percentageItemsSold: 0,

  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectRange = (newRange: 'today' | 'month' | 'year') => {
    setRange(newRange); // ← actualiza el estado global que viene del padre
    dispatch(fetchDashboardKpis({ range: newRange })); // ← ejecuta el thunk con el nuevo rango
    handleCloseMenu();
  };


  const rangeLabels: Record<typeof range, string> = {
    today: 'Hoy',
    month: 'Este Mes',
    year: 'Este Año',
  };

  return (
    <Box position="relative">
      {/* Botón de menú */}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Indicadores</Typography>

        {/* Botón de menú de rango */}
        <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleSelectRange('today')}>Hoy</MenuItem>
          <MenuItem onClick={() => handleSelectRange('month')}>Este mes</MenuItem>
          <MenuItem onClick={() => handleSelectRange('year')}>Este año</MenuItem>
        </Menu>
      </Box>


      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardKPICard
            title="Sales"
            subtitle={rangeLabels[range]}
            value={kpis.sales.toString()}
            icon={<ShoppingCartIcon />}
            percentage={`${kpis.percentageSales}%`}
            trend={kpis.percentageSales >= 0 ? 'up' : 'down'}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardKPICard
            title="Revenue"
            subtitle={rangeLabels[range]}
            value={`$${kpis.revenue.toFixed(2)}`}
            icon={<AttachMoneyIcon />}
            percentage={`${kpis.percentageRevenue}%`}
            trend={kpis.percentageRevenue >= 0 ? 'up' : 'down'}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardKPICard
            title="Items Sold"
            subtitle={rangeLabels[range]}
            value={kpis.itemsSold.toString()}
            icon={<InventoryIcon />}
            percentage={`${kpis.percentageItemsSold}%`}
            trend={kpis.percentageItemsSold >= 0 ? 'up' : 'down'}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardKPIs;
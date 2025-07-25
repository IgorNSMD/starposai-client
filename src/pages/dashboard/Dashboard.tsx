import { useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';

import { useAppDispatch } from '../../store/redux/hooks';

import DashboardKPIs from '../../components/dashboard/DashboardKPIs';
import DashboardMultiLineChart from '../../components/dashboard/DashboardMultiLineChart';
import DashboardActivity from '../../components/dashboard/DashboardActivity';

import { fetchDashboardActivity, fetchDashboardChart, fetchDashboardKpis } from '../../store/slices/dashboardSlice';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const [range, setRange] = useState<'today' | 'month' | 'year'>('today');

  useEffect(() => {
    dispatch(fetchDashboardKpis({ range }));
    dispatch(fetchDashboardActivity({ range }));
    dispatch(fetchDashboardChart({ range }));
  }, [dispatch, range]);
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 3 },
        maxWidth: '1300px',
        margin: 'auto',
        overflowX: 'hidden',
        width: '100%',              // ← asegura que no se pase del viewport
        boxSizing: 'border-box',    // ← evita overflow por padding
      }}
    >
      <Grid container spacing={3}>
        {/* Bloque izquierdo: KPIs y Gráfico */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} direction="column">
            {/* KPIs */}
            <Grid item>
               <DashboardKPIs range={range} setRange={setRange} />
            </Grid>

            {/* Gráfico */}
            <Grid item>
               <DashboardMultiLineChart range={range} />
            </Grid>
          </Grid>
        </Grid>

        {/* Bloque derecho: Actividades (ocupa la altura total del bloque izquierdo) */}
        <Grid item xs={12} md={4}>
          <DashboardActivity range={range} setRange={setRange} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
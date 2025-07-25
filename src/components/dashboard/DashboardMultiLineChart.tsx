// DashboardMultiLineChart.tsx
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { fetchDashboardChart } from '../../store/slices/dashboardSlice';

type RangeType = 'today' | 'month' | 'year';

const DashboardMultiLineChart = ({ range = 'today' }: { range?: RangeType }) => {
  const dispatch = useAppDispatch();

  const chartData = useAppSelector((state) => state.dashboards.chart);
  const isLoading = useAppSelector((state) => state.dashboards.isLoadingChart);
  const error = useAppSelector((state) => state.dashboards.errorMessage);

  useEffect(() => {
    dispatch(fetchDashboardChart({ range }));
  }, [dispatch, range]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        bgcolor: 'white',
        height: 360,
        width: '100%',
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
        Reporte Diario
      </Typography>

      <Box sx={{ height: 'calc(100% - 32px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? (
          <Typography variant="body2">Cargando datos...</Typography>
        ) : error ? (
          <Typography variant="body2" color="error">{error}</Typography>
        ) : chartData.length === 0 ? (
          <Typography variant="body2">No hay datos para mostrar.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f51b5" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3f51b5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4caf50" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4caf50" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff9800" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ff9800" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="#3f51b5"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4caf50"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="itemsSold"
                stroke="#ff9800"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                fillOpacity={1}
                fill="url(#colorItems)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default DashboardMultiLineChart;
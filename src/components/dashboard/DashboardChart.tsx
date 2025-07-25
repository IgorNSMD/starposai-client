import { Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { name: 'Lun', ventas: 400 },
  { name: 'Mar', ventas: 300 },
  { name: 'Mié', ventas: 500 },
  { name: 'Jue', ventas: 200 },
  { name: 'Vie', ventas: 278 },
  { name: 'Sáb', ventas: 189 },
  { name: 'Dom', ventas: 239 },
];

const DashboardChart = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        bgcolor: 'white',
        height: 300,
        maxWidth: '1000px', // ✅ igual que el contenedor de KPI
        mx: 'auto',
        mt: 2,
        width: '100%', // ✅ usa todo el ancho del contenedor padre
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
        Ventas Semanales
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#3f51b5"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DashboardChart;


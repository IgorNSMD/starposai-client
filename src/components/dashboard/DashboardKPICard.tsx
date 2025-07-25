import { Box, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';


interface DashboardKPICardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: ReactNode;
  percentage: string;
  trend: 'up' | 'down';
  color: string; // MUI palette color (e.g., 'success.main', 'error.main')
}

const DashboardKPICard = ({
  title,
  subtitle,
  value,
  icon,
  percentage,
  trend,
  color,
}: DashboardKPICardProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: 1,
        minWidth: 260,
      }}
    >
      <Box
        sx={{
          bgcolor: `${color}.100`,
          color: `${color}.main`,
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
      >
        {icon}
      </Box>
      {/* <DashboardMenu onSelect={(val) => console.log(`${title} → ${val}`)} /> */}
      <Box>
        <Typography variant="caption" color="text.primary">
          {title} {subtitle && <span style={{ color: '#888' }}>| {subtitle}</span>}
        </Typography>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: trend === 'up' ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          {percentage} {trend === 'up' ? 'increase' : 'decrease'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default DashboardKPICard;

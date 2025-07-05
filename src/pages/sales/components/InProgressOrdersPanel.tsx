import {
  Box,
  Typography,
  Drawer,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import { useAppSelector } from "../../../store/redux/hooks";
import type { Sale } from "../../../store/slices/saleSlice";

interface InProgressOrdersPanelProps {
  open: boolean;
  onClose: () => void;
}

const InProgressOrdersPanel = ({ open, onClose }: InProgressOrdersPanelProps) => {
  const sales = useAppSelector((state) => state.sales.sales);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const inProgressSales = sales.filter(
    (s) => s.status === "in_progress" && s.tableId
  );

  const getElapsedTime = (createdAt: string | Date) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  type TableRef = string | { _id: string; name: string } | undefined;

  const getTableName = (table: TableRef): string => {
    if (typeof table === "object" && table && "_id" in table) {
      return `Mesa ${table.name}`;
    }
    if (typeof table === "string") {
      return `Mesa ${table}`;
    }
    return "Mesa desconocida";
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: isMobile ? "100vw" : 450,
          p: 2,
          maxWidth: "100vw",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
         <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography 
          variant="h6" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            pr: 4,
            fontWeight: "bold", 
            textAlign: "left", 
            color: "#666",
            pb: 1 
          }}>
          Pedidos en Mesa
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {inProgressSales.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay pedidos en mesa activos.
          </Typography>
        ) : (
          inProgressSales.map((sale: Sale) => (
            <Paper key={sale._id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {getTableName(sale.tableId)}
              </Typography>
              <Typography variant="body2">
                Pedido Nº: <strong>{sale.orderNumber}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {sale.saleItems
                  .map((item) => `${item.name} x${item.quantity}`)
                  .join(", ")}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Hace {getElapsedTime(sale.createdAt)}
              </Typography>
            </Paper>
          ))
        )}
      </Box>
    </Drawer>
  );
};

export default InProgressOrdersPanel;
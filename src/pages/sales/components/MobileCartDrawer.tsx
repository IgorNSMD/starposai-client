// components/MobileCartDrawer.tsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Button,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "../../../utils/formatters"; //../../utils/formatters

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onChangeQuantity: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
  onClearCart: () => void;
  isTakeAway: boolean;
  setIsTakeAway: (val: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  cashGiven: number | "";
  setCashGiven: (val: number | "") => void;
  total: number;
  change: number;
  onConfirm: () => void;
}

const MobileCartDrawer: React.FC<Props> = ({
  open,
  onClose,
  selectedProducts,
  onChangeQuantity,
  onRemoveProduct,
  onClearCart,
  isTakeAway,
  setIsTakeAway,
  paymentMethod,
  setPaymentMethod,
  cashGiven,
  setCashGiven,
  total,
  change,
  onConfirm,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6">🛒 Pedido</Typography>

        {selectedProducts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No hay productos en el carrito.
          </Typography>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto", mt: 2 }}>
            {selectedProducts.map((item) => (
              <Box
                key={item._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                <Box>
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subtotal: {formatCurrency(item.price * item.quantity, "€ ")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => onChangeQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </IconButton>
                  <Typography fontWeight="bold" sx={{ width: 20, textAlign: "center" }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onChangeQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    size="small"
                    onClick={() => onRemoveProduct(item._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography>Total: {formatCurrency(total, "€ ")}</Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={isTakeAway}
                onChange={(e) => setIsTakeAway(e.target.checked)}
              />
            }
            label="Para llevar"
          />

          <Select
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mt: 1 }}
          >
            <MenuItem value="cash">Efectivo</MenuItem>
            <MenuItem value="card">Tarjeta</MenuItem>
          </Select>

          {paymentMethod === "cash" && (
            <TextField
              label="Monto Entregado"
              type="number"
              fullWidth
              value={cashGiven}
              onChange={(e) => setCashGiven(Number(e.target.value))}
              sx={{ mt: 1 }}
            />
          )}

          {paymentMethod === "cash" && cashGiven !== "" && (
            <Typography sx={{ mt: 1 }}>Vuelto: {formatCurrency(change, "€ ")}</Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={selectedProducts.length === 0}
            onClick={onConfirm}
          >
            Marcar como Pagado
          </Button>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={onClearCart}
            disabled={selectedProducts.length === 0}
          >
            Cancelar Pedido
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileCartDrawer;

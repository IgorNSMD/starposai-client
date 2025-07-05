import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  Button,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch } from "../../../store/redux/hooks";
import { addItemsToSale, closeSale, cancelSale ,Sale, SaleItem } from "../../../store/slices/saleSlice";

import { useToast, } from "../../../hooks/useToastMessage"; // si usas toasts
import { updateTableStatus } from "../../../store/slices/tableSlice";
import { formatCurrency } from '../../../utils/formatters'; 

interface EditTableSaleDrawerProps {
  sale: Sale;
  onClose: () => void;
  onRefresh: (saleId: string) => void;
}

const EditTableSaleDrawer: React.FC<EditTableSaleDrawerProps> = ({ sale, onClose, onRefresh }) => {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<SaleItem[]>(sale.saleItems);
  const [paymentMethod, setPaymentMethod] = useState(sale.payment.method || 'cash');
  const [amountPaid, setAmountPaid] = useState<number | ''>(sale.payment.amountPaid ?? '');

  const { showSuccess, showError } = useToast();

  const tableName =
  typeof sale.tableId === "object" && sale.tableId !== null && "name" in sale.tableId
    ? sale.tableId.name
    : sale.tableId;

  const staffName =
  typeof sale.staffId === "object" && sale.staffId !== null && "name" in sale.staffId
    ? sale.staffId.name
    : sale.staffId;

  const drawerTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const change = paymentMethod === "cash" && amountPaid !== ""
    ? Number(amountPaid) - drawerTotal
    : 0;    

  const handleDeleteItem = async (indexToRemove: number) => {
    const updatedItems = items.filter((_, idx) => idx !== indexToRemove);
    setItems(updatedItems);

    await dispatch(addItemsToSale({
      saleId: sale._id,
      saleItems: updatedItems,
    }));
    await onRefresh(sale._id); // <-- 🔄 actualiza desde Redux
  };    

  const newTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const updateItemQuantity = async (index: number, delta: number) => {
    const newQuantity = items[index].quantity + delta;
    if (newQuantity < 1) return;

    const updated = items.map((item, i) =>
      i === index
        ? {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity,
          }
        : item
    );

    setItems(updated);
    await dispatch(addItemsToSale({ saleId: sale._id, saleItems: updated }));
  };


  return (
    <Drawer anchor="right" open={!!sale} onClose={onClose}>
      <Box sx={{ width: 360, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Editar Pedido - Mesa</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Mesa: {tableName} | Personal: {staffName}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Productos en Pedido</Typography>
        <List dense>
          {items.map((item: SaleItem, index: number) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Nombre y subtotal */}
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  Subtotal: {formatCurrency(item.subtotal, "€ ")}
                </Typography>
              </Box>

              {/* Controles: -, cantidad, +, eliminar */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  sx={{ p: 0.5 }}
                  onClick={() => updateItemQuantity(index, -1)}
                >
                  <Typography variant="body2">−</Typography>
                </IconButton>

                <Typography variant="body2" fontWeight="bold" sx={{ width: 20, textAlign: "center" }}>
                  {item.quantity}
                </Typography>

                <IconButton
                  size="small"
                  sx={{ p: 0.5 }}
                  onClick={() => updateItemQuantity(index, 1)}
                >
                  <Typography variant="body2">+</Typography>
                </IconButton>

                <IconButton
                  edge="end"
                  color="error"
                  size="small"
                  sx={{ p: 0.5 }}
                  onClick={() => handleDeleteItem(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>


          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: "auto" }}>
          <Typography variant="body1" fontWeight="bold">
             Total: {formatCurrency(newTotal, "€ ")}
          </Typography>
          <Select
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
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
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              sx={{ mt: 1 }}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            />
          )}

          {paymentMethod === "cash" && amountPaid !== "" && (
            <Typography sx={{ mt: 1 }}>
               Vuelto: {formatCurrency(change, "€ ")}
            </Typography>
          )}

          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            onClick={async () => {
              try {
                await dispatch(closeSale({
                  saleId: sale._id,
                  payment: {
                    method: paymentMethod,
                    amountPaid: paymentMethod === "cash" ? Number(amountPaid) : drawerTotal,
                    change: paymentMethod === "cash" && amountPaid !== "" ? change : 0
                  }
                })).unwrap();

                // ✅ Actualizar estado de la mesa a 'available'
                if (typeof sale.tableId === "string") {
                  await dispatch(updateTableStatus({ tableId: sale.tableId, status: "available" }));
                } else if (sale.tableId && "_id" in sale.tableId) {
                  await dispatch(updateTableStatus({ tableId: sale.tableId._id, status: "available" }));
                }

                // ✅ Refrescar ventas y cerrar drawer
                await onRefresh(sale._id); // refresca sale desde redux

                showSuccess("Pedido marcado como pagado con éxito"); // ✅ NUEVO
                onClose(); // cerrar drawer
              } catch (err) {
                showError(err instanceof Error ? err.message : "Error al cerrar venta");
              }
            }}
          >
              Marcar como Pagado
          </Button>


          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={async () => {
              try {
                await dispatch(cancelSale(sale._id)).unwrap();
                showSuccess("Pedido cancelado correctamente");
                onClose(); // Cierra el drawer
              } catch (err) {
                showError(err instanceof Error ? err.message : "Error al cancelar el pedido");
              }
            }}
          >
            Cancelar Pedido
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditTableSaleDrawer;

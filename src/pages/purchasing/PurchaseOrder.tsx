import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
} from "../../store/slices/purchaseOrderSlice";
import { fetchProducts } from "../../store/slices/productSlice";

const PurchaseOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { purchaseOrders } = useAppSelector((state) => state.purchaseorders);
  const { products } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState({
    supplier: "",
    products: [],
    total: 0,
    estimatedDeliveryDate: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProducts({ status: 'active' }));
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ supplier: "", products: [], total: 0, estimatedDeliveryDate: "" });
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updatePurchaseOrder({ id: editingId, data: formData }))
        .unwrap()
        .then(() => handleCloseModal())
        .catch((error) => console.error(error));
    } else {
      dispatch(createPurchaseOrder(formData))
        .unwrap()
        .then(() => handleCloseModal())
        .catch((error) => console.error(error));
    }
  };

  const handleEdit = (id: string) => {
    const po = purchaseOrders.find((order) => order._id === id);
    if (po) {
      setFormData(po);
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    console.log("Eliminar PO con ID:", id);
    // Aquí se podría agregar una acción de Redux para eliminar o cambiar el estado de la PO.
  };

  const rows = purchaseOrders.map((order) => ({
    id: order._id,
    supplier: order.supplier,
    total: order.total,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    status: order.status,
  }));

  const columns: GridColDef[] = [
    { field: "supplier", headerName: "Supplier", flex: 1 },
    { field: "total", headerName: "Total", flex: 1 },
    { field: "estimatedDeliveryDate", headerName: "Delivery Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton color="primary" size="small" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Purchase Order Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          New Purchase Order
        </Button>
      </Paper>

      <Paper>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} autoHeight />
      </Paper>

      {/* 📌 Modal para Crear / Editar PO */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={handleCloseModal}>
          <DialogTitle>{editingId ? "Edit Purchase Order" : "New Purchase Order"}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2, marginTop: 2 }}>
              <TextField
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                fullWidth
              />
              <TextField
                label="Estimated Delivery Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.estimatedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                fullWidth
              />

              <Typography variant="subtitle1">Products</Typography>
              <Select
                value=""
                onChange={(e) => {
                  const product = products.find((p) => p._id === e.target.value);
                  if (product) {
                    setFormData({
                      ...formData,
                      products: [...formData.products, { productId: product._id, quantity: 1, unitPrice: product.cost, subtotal: product.cost }],
                      total: formData.total + product.cost,
                    });
                  }
                }}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select Product
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} - ${product.cost}
                  </MenuItem>
                ))}
              </Select>

              <Box>
                {formData.products.map((item, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography>{products.find((p) => p._id === item.productId)?.name || item.genericProduct}</Typography>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const updatedProducts = [...formData.products];
                        updatedProducts[index].quantity = Number(e.target.value);
                        updatedProducts[index].subtotal = updatedProducts[index].quantity * updatedProducts[index].unitPrice;
                        setFormData({ ...formData, products: updatedProducts, total: updatedProducts.reduce((acc, p) => acc + p.subtotal, 0) });
                      }}
                      sx={{ width: 80 }}
                    />
                    <IconButton onClick={() => setFormData({ ...formData, products: formData.products.filter((_, i) => i !== index) })}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Typography variant="h6">Total: ${formData.total.toFixed(2)}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PurchaseOrder;

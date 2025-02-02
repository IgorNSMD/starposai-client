import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  changePurchaseOrderStatus ,
} from '../../store/slices/purchaseOrderSlice';
import { fetchProviders } from '../../store/slices/providerSlice';
import { fetchProducts } from '../../store/slices/productSlice';

// 🔹 Definir la interfaz de un Producto dentro de la PO
interface POProduct {
  productId?: string; // Si es un producto registrado
  genericProduct?: string; // Si es un producto genérico
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Provider {
  _id: string;
  name: string;
}

interface PurchaseOrderFormData {
  provider: string | Provider; // 👈 Permitimos string o el objeto Provider
  products: POProduct[];
  total: number;
  estimatedDeliveryDate: string;
}


const PurchaseOrder: React.FC = () => {
  const dispatch = useAppDispatch();
  const { purchaseOrders } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);
  const { products } = useAppSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    provider: '',
    estimatedDeliveryDate: '',
    products: [],
    total: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProviders({ status: 'active' }));
    dispatch(fetchProducts({ status: 'active' }));
  }, [dispatch]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFormData({
      provider: '',
      estimatedDeliveryDate: '',
      products: [],
      total: 0,
    });
    setEditingId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    const processedFormData = {
      ...formData,
      provider: typeof formData.provider === "string"
        ? { _id: formData.provider, name: "" } // 👈 Si es string, conviértelo a objeto
        : formData.provider, // Si ya es objeto, lo mantiene
    };
  
    if (editingId) {
      dispatch(updatePurchaseOrder({ id: editingId, data: processedFormData }))
        .unwrap()
        .then(handleCloseModal);
    } else {
      dispatch(createPurchaseOrder(processedFormData)) // 👈 Ahora enviamos `processedFormData`
        .unwrap()
        .then(handleCloseModal);
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

  const handleDelete = (poId: string) => {
    dispatch(changePurchaseOrderStatus({ id: poId, status: "inactive" }));
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    // Calcular subtotal y total
    updatedProducts[index].subtotal = updatedProducts[index].quantity * updatedProducts[index].unitPrice;
    const newTotal = updatedProducts.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    setFormData({ ...formData, products: updatedProducts, total: newTotal });
  };

  // *se habilitará codigo mas adelante*
  // const addProduct = () => {
  //   setFormData({
  //     ...formData,
  //     products: [
  //       ...formData.products,
  //       {
  //         productId: '', // Si el producto es del sistema
  //         genericProduct: '', // Si es un producto genérico
  //         quantity: 1,
  //         unitPrice: 0,
  //         subtotal: 0
  //       }
  //     ]
  //   });
  // };

  const removeProduct = (index: number) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    const newTotal = updatedProducts.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    setFormData({ ...formData, products: updatedProducts, total: newTotal });
  };

  const columns: GridColDef[] = [
    { field: 'provider', headerName: 'Provider', flex: 1 },
    { field: 'total', headerName: 'Total', flex: 1 },
    { field: 'estimatedDeliveryDate', headerName: 'Delivery Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = purchaseOrders.map((po) => ({
    id: po._id,
    provider: po.provider.name,
    total: po.total,
    estimatedDeliveryDate: po.estimatedDeliveryDate,
  }));

  return (
    <Box>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6">Purchase Order Management</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
          New Purchase Order
        </Button>
      </Paper>

      <Paper sx={{ marginTop: 2 }}>
        <DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10, 20]} />
      </Paper>

      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={handleCloseModal}>
          <DialogTitle>{editingId ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Provider"
              fullWidth
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              sx={{ marginBottom: 2 }}
            >
              {providers.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Estimated Delivery Date"
              fullWidth
              value={formData.estimatedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
              sx={{ marginBottom: 2 }}
            />

            <Typography variant="subtitle1">Products</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.products.map((p, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select value={p.productId} onChange={(e) => handleProductChange(index, 'product', e.target.value)}>
                          {products.map((prod) => (
                            <MenuItem key={prod._id} value={prod._id}>
                              {prod.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.unitPrice}</TableCell>
                      <TableCell>{p.subtotal}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => removeProduct(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PurchaseOrder;
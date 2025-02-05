import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
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
  PaperProps,
  Autocomplete,
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

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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

const DraggablePaper = (props: PaperProps) => {
  const nodeRef = useRef(null);
  return (
    <Draggable handle="#draggable-dialog-title" nodeRef={nodeRef}>
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
};

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
        ? { _id: formData.provider, name: "" } // Convierte a un objeto `Provider`
        : formData.provider, // Mantiene si ya es `Provider`
      estimatedDeliveryDate:
        formData.estimatedDeliveryDate && dayjs(formData.estimatedDeliveryDate).isValid()
          ? dayjs(formData.estimatedDeliveryDate).toISOString()
          : "",
    };
  
    if (editingId) {
      dispatch(
        updatePurchaseOrder({
          id: editingId,
          data: processedFormData, // Ahora `provider` siempre será de tipo `Provider`
        })
      )
      .unwrap()
      .then(handleCloseModal);
    } else {
      dispatch(createPurchaseOrder(processedFormData)) // 👈 Ahora `provider` tiene el tipo correcto
      .unwrap()
      .then(handleCloseModal);
    }
  };
  

  const handleEdit = (id: string) => {
    const po = purchaseOrders.find((order) => order._id === id);
    if (po) {
      setFormData({
        provider: providers.find((p) => p._id === (typeof po.provider === "string" ? po.provider : po.provider._id)) || "",
        estimatedDeliveryDate: po.estimatedDeliveryDate,
        products: po.products.map((p) => ({
          ...p,
          productId: products.find((prod) => prod._id === p.productId)?._id || "", // ✅ Asegura un string válido
        })),
        total: po.total,
      });
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
    provider: po.provider?.name || "N/A",
    total: po.total,
    estimatedDeliveryDate: po.estimatedDeliveryDate
      ? dayjs(po.estimatedDeliveryDate).format("DD-MM-YYYY")
      : "N/A",
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
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperComponent={DraggablePaper}
          maxWidth="md" // ✅ Aumenta el ancho del modal
          fullWidth  // ✅ Usa todo el ancho disponible
        >
          <DialogTitle id="draggable-dialog-title" style={{ cursor: "move" }}>
            {editingId ? 'Edit Purchase Order' : 'New Purchase Order'}
          </DialogTitle>
          <DialogContent>

            {/* Selector de Proveedores con Autocomplete */}
            <Autocomplete
              options={providers}
              getOptionLabel={(option) => option.name}
              value={
                typeof formData.provider === "string"
                  ? providers.find((p) => p._id === formData.provider) || null
                  : formData.provider
              }
              onChange={(_, newValue) => {
                setFormData({ ...formData, provider: newValue ? newValue : "" });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Provider" fullWidth sx={{ marginBottom: 2 }} />
              )}
            />

            {/* Selector de Fecha con DatePicker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Estimated Delivery Date"
                value={formData.estimatedDeliveryDate ? dayjs(formData.estimatedDeliveryDate) : null}
                onChange={(newDate) => {
                  setFormData({
                    ...formData,
                    estimatedDeliveryDate: newDate ? newDate.toISOString() : "",
                  });
                }}
                format="DD-MM-YYYY"
                sx={{ marginBottom: 2, width: "100%" }} // ✅ Responsive
              />
            </LocalizationProvider>

            {/* Tabla de Productos - Editable */}
            <Typography variant="subtitle1">Products</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
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
                      {/* Selector de Producto */}
                      <TableCell>
                      <Select
                        value={formData.products[index]?.productId || ""}
                        onChange={(e) => handleProductChange(index, "productId", e.target.value)}
                        fullWidth
                      >
                        {products.map((prod) => (
                          <MenuItem key={prod._id} value={prod._id}>
                            {prod.name}
                          </MenuItem>
                        ))}
                      </Select>
                      </TableCell>

                      {/* Input Editable - Quantity */}
                      <TableCell>
                        <TextField
                          type="number"
                          value={p.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
                          inputProps={{ min: 1 }}
                          fullWidth
                        />
                      </TableCell>

                      {/* Input Editable - Unit Price */}
                      <TableCell>
                        <TextField
                          type="number"
                          value={p.unitPrice}
                          onChange={(e) => handleProductChange(index, "unitPrice", Number(e.target.value))}
                          inputProps={{ min: 0 }}
                          fullWidth
                        />
                      </TableCell>

                      {/* Subtotal (Calculado) */}
                      <TableCell>{(p.quantity * p.unitPrice).toFixed(2)}</TableCell>

                      {/* Botón de Eliminar Producto */}
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
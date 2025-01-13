import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
} from '@mui/material';
//import { fetchProducts, createProduct  } from '../../store/slices/productSlice';
import { RootState } from '../../store/store';

const Product: React.FC = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector((state: RootState) => state.products);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    unit: '',
  });

  useEffect(() => {
    //dispatch(fetchProducts());
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (formData.sku && formData.name) {
      //dispatch(createProduct(formData));
      handleClose();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Productos
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Nuevo Producto
      </Button>
      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Cargando...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5}>{error}</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ padding: 3, backgroundColor: 'white', margin: 'auto', marginTop: '10%', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Nuevo Producto
          </Typography>
          <TextField label="SKU" name="sku" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Nombre" name="name" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Categoría" name="category" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Precio" name="price" type="number" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Stock" name="stock" type="number" fullWidth margin="normal" onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginTop: 2 }}>
            Guardar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Product;

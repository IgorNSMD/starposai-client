import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  Modal,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  changeProductStatus,
} from '../../store/slices/productSlice';
import {
  formContainer,
  submitButton,
  permissionsTable,
  datagridStyle,
} from '../../styles/AdminStyles';

interface DialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode; // Agrega esta línea
}

const Dialog: React.FC<DialogProps> = ({ isOpen, title, onClose, onConfirm, children }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box>
        <Typography>{title}</Typography>
        {children}
        <Button onClick={onConfirm}>Confirmar</Button>
        <Button onClick={onClose}>Cancelar</Button>
      </Box>
    </Modal>
  );
};

const Product: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ sku: '', name: '', category: '', price: 0, stock: 0 });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updateProduct({ id: editingId, data: { ...formData } }));
    } else {
      dispatch(createProduct(formData));
    }
    handleCloseModal();
  };

  const handleEdit = (id: string) => {
    const product = products.find((prod) => prod._id === id);
    if (product) {
      setFormData(product);
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleChangeStatus = (id: string, newStatus: 'active' | 'inactive') => {
    dispatch(changeProductStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => {
        console.log('Estado cambiado con éxito');
      })
      .catch((error) => {
        console.error('Error al cambiar estado:', error);
      });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const rows = products.map((product) => ({
    id: product._id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
  }));

  const columns = [
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 0.5 },
    { field: 'stock', headerName: 'Stock', flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row.id)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleChangeStatus(params.row.id, 'inactive')} // Cambiar estado a 'inactive'
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={formContainer}>
      {/* Barra superior */}
      <Box display="flex" justifyContent="space-between" marginBottom="16px">
        <Typography variant="h5">Gestión de Productos</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={submitButton}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Tabla */}
      <Paper sx={permissionsTable}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
      </Paper>

      {/* Modal */}
      {isModalOpen && (
        <Dialog
          isOpen={isModalOpen}
          title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
          onClose={handleCloseModal}
          onConfirm={handleSubmit}
        >
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
            <TextField
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              label="Categoría"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
            <TextField
              label="Precio"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
            <TextField
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default Product;
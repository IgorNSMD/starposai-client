import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Box,
  Button,
  Typography,
  Paper,
  PaperProps,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  changeProductStatus,
  fetchCategories,
} from '../../store/slices/productSlice';
import {
  formContainer,
  submitButton,
  permissionsTable,
  datagridStyle,
  inputContainer,
  formTitle,
  inputField,
  searchButton,
  cancelButton,
  modalTitleStyle,
} from '../../styles/AdminStyles';

const DraggablePaper = (props: PaperProps) => {
  const nodeRef = useRef(null); // Soluciona el problema de `ref` incompatible
  return (
    <Draggable handle="#draggable-dialog-title" nodeRef={nodeRef}>
      <div ref={nodeRef}>
        <Paper {...props} />
      </div>
    </Draggable>
  );
};


const Product: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, categories } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    cost: 0,
    stock: 0,
    unit: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      sku: '',
      name: '',
      description: '',
      price: 0,
      category: '',
      cost: 0,
      stock: 0,
      unit: '',
     });
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
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || '',
        cost: product.cost || 0,
        stock: product.stock || 0,
        unit: product.unit || '',
      });
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

        // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const rows = products.map((product) => ({
    id: product._id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,    
    category: product.category,
    cost: product.cost,
    stock: product.stock,
    unit: product.unit,
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
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>Product Management</Typography>
        <Box sx={inputContainer}>
          <TextField
            label="SKU"
            name="sku"
            onChange={handleChange}
            sx={inputField}
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
          <TextField
            label="Name"
            name="name"
            onChange={handleChange}
            sx={inputField}
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
        </Box>        
        <Box sx={inputContainer}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={submitButton}
          >
            New Product
          </Button>
          <Button
            variant="outlined" // Cambiado a `contained` para igualar el estilo de "Save"
            color="secondary" // O el color que prefieras
            startIcon={<SearchIcon  />}
            sx={searchButton}
          >
            Search
          </Button>
        </Box>        
      </Paper>        


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
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperComponent={DraggablePaper} // Usa el componente ajustado
        >
          <DialogTitle
            id="draggable-dialog-title"
            sx={modalTitleStyle}
          >
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogContent>
            <Box sx={inputContainer}>
              <TextField
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                sx={inputField}
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
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                padding: 2,
              }}
            >
              {/* Campos del formulario */}
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={inputField}
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
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                sx={inputField}
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
              <TextField
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                sx={inputField}
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

              <FormControl sx={{ minWidth: 350 }}>
                <InputLabel
                  id="parent-select-label"
                  shrink={true} // Esto fuerza que el label permanezca visible
                  sx={{
                    color: "#444444",
                    "&.Mui-focused": {
                      color: "#47b2e4",
                    },
                  }}
                >
                  Category
                </InputLabel>
                <Select
                  labelId="parent-select-label"
                  name="role"
                  value={formData.category} // Garantiza un valor seguro
                  onChange={handleInputChange}
                >
                  {/* <MenuItem key="-1" value="-1">
                    <em>None</em>
                  </MenuItem> */}
                  {categories.map((r) => {
                    //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                    const uniqueKey = r._id;
                    //console.log('uniqueKey->', uniqueKey)
                    return (
                      <MenuItem key={uniqueKey} value={uniqueKey}>
                        {r.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                sx={inputField}
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
              <TextField
                label="Cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                sx={inputField}
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
              <TextField
                label="Stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                sx={inputField}
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

            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={submitButton}
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
              sx={cancelButton}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  );
};

export default Product;
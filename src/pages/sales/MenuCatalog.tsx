import React, { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Typography, TextField, MenuItem, IconButton, Checkbox,
  DialogActions, DialogTitle, DialogContent, Dialog as DialogMUI
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
  fetchMenuCatalogs,
  createMenuCatalog,
  updateMenuCatalog,
  deleteMenuCatalog
} from '../../store/slices/menuCatalogSlice';
import {
  fetchRecipeCategories,
  fetchRecipeCategoriesRoot
} from '../../store/slices/recipeCategorySlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { formContainer_v2, formTitle, inputField, datagridStyle, submitButton, cancelButton, inputContainer, searchButton } from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // ajusta la ruta si es distinta

import { baseURL_CATALOGICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable


interface SelectedProduct {
  productId: string;
  name: string;
  quantity: number;
}

const MenuCatalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { recipeCategories, recipeCategoriesRoot } = useAppSelector(state => state.recipeCategories);
  const { products } = useAppSelector(state => state.products);
  const { menus } = useAppSelector(state => state.menuCatalogs);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '' as string | File,
    category: '',
    subcategory: '',
    price: 0,
    recipe: [] as { product: string; productName: string; quantity: number }[],
  });

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const handlePreviewOpen = () => setIsPreviewOpen(true);
  const handlePreviewClose = () => setIsPreviewOpen(false);

  useEffect(() => {
    if (menus.length === 0) {
      dispatch(fetchRecipeCategories());
      dispatch(fetchRecipeCategoriesRoot());
      dispatch(fetchProducts({ status: 'active' }));
      dispatch(fetchMenuCatalogs());
    }
  }, [dispatch, menus.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Obtén el archivo seleccionado
      setFormData((prevForm) => ({ ...prevForm, image: file }));
    }
  };

  const handleProductToggle = (product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.productId === product.productId);
      if (index !== -1) {
        return prev.filter((p) => p.productId !== product.productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, quantity: newQuantity < 1 ? 1 : newQuantity }
          : p
      )
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', image: '', category: '', subcategory: '', price: 0, recipe: [] });
    setSelectedProducts([]);
  };

  const performSave = () => {
    const recipe = selectedProducts.map(({ productId, name, quantity }) => ({
      product: productId,
      productName: name,
      quantity,
    }));
  
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price.toString());
    data.append("categoryId", formData.category);
    data.append("subcategoryId", formData.subcategory);
  
    if (formData.image instanceof File) {
      data.append("image", formData.image);
    } else {
      data.append("image", formData.image);
    }
  
    data.append("recipe", JSON.stringify(recipe));
  
    if (editingId) {
      dispatch(updateMenuCatalog({ id: editingId, data })).then(() => {
        resetForm();
        dispatch(fetchMenuCatalogs());
      });
    } else {
      dispatch(createMenuCatalog(data)).then(() => {
        resetForm();
        dispatch(fetchMenuCatalogs());
      });
    }
  
    setIsUpdateDialogOpen(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      setIsUpdateDialogOpen(true); // Muestra el diálogo si es edición
    } else {
      performSave(); // Guardado directo si es nuevo
    }
  };

  const handleEdit = (id: string) => {
    const item = menus.find(m => m._id === id);
    if (!item) return;
    setEditingId(id);
  
    const parsedRecipe = item.recipe.map(r => ({
      product: typeof r.product === 'object' ? r.product._id : r.product,
      productName: r.productName,
      quantity: r.quantity,
    }));
  
    const selected: SelectedProduct[] = item.recipe.map(r => ({
      productId: typeof r.product === 'object' ? r.product._id : r.product,
      name: r.productName,
      quantity: r.quantity,
    }));
  
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      category: typeof item.categoryId === 'object' ? item.categoryId._id ?? '' : item.categoryId ?? '',
      subcategory: typeof item.subcategoryId === 'object' ? item.subcategoryId._id ?? '' : item.subcategoryId ?? '',
      price: item.price,
      recipe: parsedRecipe,
    });
  
    setSelectedProducts(selected);
  };
  

  // const handleDelete = (id: string) => {
  //   dispatch(deleteMenuCatalog(id)).then(() => dispatch(fetchMenuCatalogs()));
  // };

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setSelectedId(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (selectedId) {
      dispatch(deleteMenuCatalog(selectedId)).then(() => {
        dispatch(fetchMenuCatalogs());
      });
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const filteredSubcategories = recipeCategories.filter(cat => cat.parentId === formData.category);

  const rows = menus.map(m => ({
    id: m._id,
    name: m.name,
    category: m.categoryId?.name || '',         // 👈 nombre poblado
    subcategory: m.subcategoryId?.name || '',   // 👈 nombre poblado
    price: `$${m.price.toFixed(2)}`
  }));

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'subcategory', headerName: 'Subcategory', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 0.7 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row.id)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDeleteDialogOpen(params.row.id)} color="error"><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  const rowsProducts = products.map(p => ({
    id: p._id,
    name: p.name,
    description: p.description || '',
    selected: selectedProducts.some(sp => sp.productId === p._id) // ✅ necesario
  }));

  const columnsProducts: GridColDef[] = [
    {
      field: 'select',
      headerName: 'Sel',
      type: 'boolean', // ✅ requerido por DataGrid para mostrar checkboxes
      flex: 0.5,
      renderCell: (params) => {
        const isSelected = selectedProducts.some(p => p.productId === params.row.id);
        return (
          <Checkbox
            checked={isSelected}
            onChange={() =>
              handleProductToggle({
                productId: params.row.id,
                name: params.row.name,
                quantity: isSelected ? 1 : selectedProducts.find(p => p.productId === params.row.id)?.quantity || 1,
              })
            }
            sx={{
              color: '#555', // color borde sin seleccionar
              '&.Mui-checked': {
                color: '#47b2e4',
              },
              '& .MuiSvgIcon-root': {
                border: '1px solid #ccc', // borde extra para mejor visibilidad
                borderRadius: '4px',
              },
            }}
          />
        );
      },
    },
    { field: 'name', headerName: 'Product', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const product = selectedProducts.find(p => p.productId === params.row.id);
        const isSelected = !!product;
  
        return (
          <TextField
            type="number"
            size="small"
            value={isSelected ? product?.quantity ?? 1 : ''}
            disabled={!isSelected}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              if (!isNaN(newValue)) handleQuantityChange(params.row.id, newValue);
            }}
            sx={{
              width: '80px',
              '& input': {
                textAlign: 'right',
                padding: '4px 8px', // 🔽 reduce vertical padding
              }
            }}
            inputProps={{ min: 1 }}
          />
        );
      },
    }
  ];

  const getIconUrl = (iconPath: string) => {
    return iconPath && !iconPath.startsWith('http')
      ? `${baseURL_CATALOGICONS}/${iconPath}`
      : iconPath;
  };

  return (
    <Box sx={formContainer_v2}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>{editingId ? 'Edit Menu Catalog' : 'Add Menu Catalog'}</Typography>
        <Box sx={inputContainer}>
          <TextField 
              select label="Category" 
              name="category" 
              fullWidth value={formData.category} 
              onChange={handleInputChange} 
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
              }}>
              {recipeCategoriesRoot.map(cat => (<MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>))}
          </TextField>
          <TextField 
            select label="Subcategory" 
            name="subcategory" 
            fullWidth value={formData.subcategory} 
            onChange={handleInputChange} 
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
            }}>

            {filteredSubcategories.map(sub => (<MenuItem key={sub._id} value={sub._id}>{sub.name}</MenuItem>))}
          </TextField>
          
        </Box>
        <Box sx={inputContainer}>
        <TextField 
            label="Name" 
            name="name" 
            fullWidth 
            value={formData.name} 
            onChange={handleInputChange} 
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
            label="Price" 
            name="price" 
            type="number" 
            fullWidth 
            value={formData.price} 
            onChange={handleInputChange} 
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
          <TextField 
              label="Description" 
              name="description" 
              fullWidth 
              value={formData.description} 
              onChange={handleInputChange} 
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
      </Paper>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Box sx={inputContainer}>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#47b2e4",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#1e88e5" },
            }}
            >
            Upload Icon
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </Button>
          {/* Mostrar el nombre del archivo seleccionado */}
          {formData.image && (
            <Box sx={{ marginTop: "10px" }}>
              <Typography variant="body2" sx={{ color: "#444444" }}>
                Current Icon:
              </Typography>
              <img
                src={
                  formData.image instanceof File
                    ? URL.createObjectURL(formData.image) // Icono temporal si es un archivo subido
                    : getIconUrl(formData.image) // Icono desde el servidor
                }
                alt="Menu Icon"
                style={{ width: "50px", height: "50px", objectFit: "contain", marginTop: "5px" }}
              />
            </Box>
          )}
        </Box>
      </Paper>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Recipe Components</Typography>

        <DataGrid
          rows={rowsProducts}
          columns={columnsProducts}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
        <Box display="flex" gap={2} mt={3}>
          <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<SaveIcon />} sx={submitButton}>
            {editingId ? 'Update' : 'Save'}
          </Button>
          <Button
            variant="outlined"
            color="info"
            onClick={handlePreviewOpen}
            startIcon={<SearchIcon />} 
            sx={searchButton}
          >
            Preview
          </Button>
          <Button variant="outlined" color="secondary" onClick={resetForm} startIcon={<CancelIcon />} sx={cancelButton}>
            Cancel
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Menu Catalog List
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
      </Paper>

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this menu catalog?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        isOpen={isUpdateDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this menu catalog?"
        onClose={() => setIsUpdateDialogOpen(false)}
        onConfirm={performSave}
      />
      <DialogMUI open={isPreviewOpen} onClose={handlePreviewClose} maxWidth="md" fullWidth>
          <DialogTitle>Menu Preview</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={4} alignItems="flex-start" flexWrap="wrap">
              <Box>
                <img
                  src={formData.image instanceof File ? URL.createObjectURL(formData.image) : getIconUrl(formData.image)}
                  alt="Menu Icon"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                  }}
                />
              </Box>
              <Box flex="1">
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {formData.name}
                </Typography>
                <Typography variant="subtitle1" color="#333" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                <Typography variant="body1"><strong>Price:</strong> ${formData.price}</Typography>
                <Typography variant="body1"><strong>Category:</strong> {recipeCategoriesRoot.find(c => c._id === formData.category)?.name}</Typography>
                <Typography variant="body1"><strong>Subcategory:</strong> {recipeCategories.find(sc => sc._id === formData.subcategory)?.name}</Typography>

                <Typography variant="body1" sx={{ mt: 2 }}><strong>Recipe:</strong></Typography>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {selectedProducts.map(p => (
                    <li key={p.productId}>
                      {p.name} (x{p.quantity})
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePreviewClose} color="primary">Close</Button>
          </DialogActions>
      </DialogMUI>


    </Box>
  );
};

export default MenuCatalog;
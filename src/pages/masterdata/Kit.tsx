import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Checkbox,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchKits,
  createKit,
  updateKit,
  deleteKit,
} from '../../store/slices/kitSlice';
import {
  fetchProducts,
} from '../../store/slices/productSlice';
import Dialog from '../../components/Dialog';
import { useToastMessages } from '../../hooks/useToastMessage';

const Kits: React.FC = () => {
  const dispatch = useAppDispatch();
  const {kits, errorMessage, successMessage } = useAppSelector((state) => state.kits);
  const { products, } = useAppSelector((state) => state.products);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kitName, setKitName] = useState("");
  const [kitDescription, setKitDescription] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ status: 'active' }));
    dispatch(fetchKits());
  }, [dispatch]);

  useToastMessages(successMessage, errorMessage);

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productId === productId);
      if (existing) {
        return prev.filter((p) => p.productId !== productId);
      } else {
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setFormData({ ...formData, [name]: value });
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
      dispatch(deleteKit(selectedId)).then(() => dispatch(fetchKits()));
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      console.error("El nombre y la descripción son obligatorios.");
      return;
    }
  
    // Asegurarse de que editingId no sea null antes de enviarlo
    const kitId = editingId ?? ""; // Si es null, usar una cadena vacía
  
    const data = {
      id: kitId, // Ahora siempre será una string
      name: formData.name,
      description: formData.description,
      components: selectedProducts.map((p) => ({
        productId: typeof p === "string" ? p : p.productId, // Asegurar estructura correcta
        quantity: p.quantity || 1, // Evita valores undefined
      })),
    };
  
    if (editingId) {
      dispatch(updateKit(data))
        .then(() => {
          dispatch(fetchKits());
          setEditingId(null);
        });
    } else {
      dispatch(createKit(data)).then(() => {
        dispatch(fetchKits());
      });
    }
  
    // Reiniciar formulario después de la operación
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setSelectedProducts([]);
  };
  

  const handleEdit = (id: string) => {
    const kit = kits.find((kit) => kit._id === id);
    if (kit) {
      setFormData({ name: kit.name, description: kit.description });
  
      // Verifica que `components` existe y mapea correctamente
      if (kit.components) {
        setSelectedProducts(
          kit.components.map((prod) => ({
            productId: prod.productId, // Asegurar la estructura
            quantity: prod.quantity || 1, // Si no tiene cantidad, asigna 1 por defecto
          }))
        );
      }
  
      setEditingId(id);
    }
  };
  

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setSelectedProducts([]);
  };

  const columnsProducts: GridColDef[] = [
    {
      field: 'select',
      headerName: 'Sel',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          color="primary"
          checked={selectedProducts.includes(params.row.id)}
          onChange={() => handleProductToggle(params.row.id)}
        />
      ),
    },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'name', headerName: 'Product Name', flex: 1 },
  ];

  const rowsProducts = products.map((product) => ({
    id: product._id,
    sku: product.sku,
    name: product.name,
  }));

  const columnsKits: GridColDef[] = [
    { field: 'name', headerName: 'Kit Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteDialogOpen(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rowsKits = kits.map((kit) => ({
    id: kit._id,
    name: kit.name,
  }));

  return (
    <Box sx={{ padding: 3 }}>
       {/* Sección de Crear Kit */}
       <Paper sx={{ padding: 3, marginBottom: 3, boxShadow: 3 }}>
       <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Crear Nuevo Kit
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Nombre del Kit"
            variant="outlined"
            fullWidth
            value={kitName}
            onChange={(e) => setKitName(e.target.value)}
            placeholder="Ejemplo: Kit Desayuno"
          />
          <TextField
            label="Descripción"
            variant="outlined"
            fullWidth
            value={kitDescription}
            onChange={(e) => setKitDescription(e.target.value)}
            placeholder="Ejemplo: Contiene café, leche y pan"
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ alignSelf: "flex-start", marginTop: 1 }}
          >
            Guardar Kit
          </Button>
        </Box>
      </Paper>

      {/* Separador */}
      <Divider sx={{ marginY: 2 }} />

      {/* Tabla de Productos */}
      <Paper sx={{ padding: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Seleccionar Productos para el Kit
        </Typography>
        <DataGrid 
          rows={rowsProducts} 
          columns={columnsProducts} 
          pageSizeOptions={[5, 10, 20]}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#304FFE",
              color: "white",
              fontWeight: "bold",
            },
          }} />
      </Paper>

      <Paper sx={{ height: 300 }}>
        <Typography variant="h6">Existing Kits</Typography>
        <DataGrid rows={rowsKits} columns={columnsKits} pageSizeOptions={[5, 10, 20]} />
      </Paper>

      <Dialog isOpen={isDeleteDialogOpen} title="Confirm Delete" message="Are you sure you want to delete this kit?" onClose={handleDeleteDialogClose} onConfirm={handleConfirmDelete} />
    </Box>
  );
};

export default Kits;
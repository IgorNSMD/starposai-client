import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Checkbox,
  useMediaQuery
} from '@mui/material';

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchKits,
  createKit,
  updateKit,
  deleteKit,
} from '../../store/slices/kitSlice';

import {
  fetchProducts
} from '../../store/slices/productSlice';


import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';

interface SelectedProduct {
  productId: string;
  name: string;
  quantity: number;
}

interface KitComponent {
  product: string | { _id: string }; // ✅ Permite ambos tipos
  productName: string
  quantity: number;
}
interface Kit {
  _id: string;
  name: string;
  cost: number;
  components: KitComponent[];
  status: "active" | "inactive";
}

const Kits: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { kits, errorMessage, successMessage } = useAppSelector((state) => state.kits);
  const { products } = useAppSelector((state) => state.products);
  const [formData, setFormData] = useState({ name: '', cost: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchProducts({ status: 'active' }));
    dispatch(fetchKits());
  }, [dispatch]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

  const handleProductToggle = (product: SelectedProduct) => {
    setSelectedProducts((prev) => {
      const index = prev.findIndex((p) => p.productId === product.productId);
      if (index !== -1) {
        return prev.filter((p) => p.productId !== product.productId); // Si ya está, lo deselecciona
      } else {
        const newProduct = { 
          productId: product.productId, 
          name: product.name, // 🔹 Verifica que este campo no esté vacío
          quantity: product.quantity || 1
        };
        
        //console.log("Producto agregado a selectedProducts:", newProduct); // 🔍 Depuración
        
        return [...prev, newProduct];
      }
    });
  };
  
  
  
  

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

      // Diálogo para eliminar
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
      dispatch(deleteKit(selectedId))
        .then(() => dispatch(fetchKits())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    //console.log("selectedProducts antes de enviar: ", selectedProducts);
  
    const data = {
      name: formData.name,
      cost: formData.cost,
      components: selectedProducts.map((p) => ({
        product: p.productId,
        productName: p.name, // 🔹 Asegurando que name se pase correctamente
        quantity: p.quantity ?? 1,
      })),
    };
  
    //console.log("data-handleSubmit:", data);
  
    if (editingId) {
      dispatch(updateKit({ id: editingId, ...data })).then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ name: '', cost: 0 });
        setSelectedProducts([]);
      });
    } else {
      dispatch(createKit(data)).then(() => {
        dispatch(fetchKits());
        setFormData({ name: '', cost: 0 });
        setSelectedProducts([]);
      });
    }
  };
  
  

  const handleEdit = (id: string) => {
    //console.log("Editing kit with ID:", id);
    const kit = kits.find((kit) => kit._id === id);
    if (kit) {
      setFormData({ name: kit.name, cost: kit.cost });
  
      // 🔹 Convertimos los componentes en el formato correcto
      setSelectedProducts(
        kit.components.map((comp) => ({
          productId: typeof comp.product === "string" ? comp.product : (comp.product as { _id: string })._id,
          name: comp.productName || "Unknown Product", // 🔹 Asegura que el nombre esté presente
          quantity: comp.quantity,
        }))
      );
  
      setEditingId(id);
    }
  };
 
  
  

  const handleCancel = () => {
    setFormData({ name: '', cost: 0 });
    setEditingId(null);
    setSelectedProducts([]);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate = () => {
    const data = {
      name: formData.name,
      cost: formData.cost,
      components: selectedProducts.map((p) => ({
        product: p.productId, // ✅ Ahora solo toma el ID del producto
        productName: p.name,
        quantity: p.quantity ?? 1,
      })),
    };
  
    if (editingId) {
      dispatch(updateKit({ id: editingId, ...data })).then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ name: '', cost: 0 });
        setSelectedProducts([]);
      });
    }
  };
  
  

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, quantity: isNaN(newQuantity) || newQuantity < 1 ? 1 : newQuantity }
          : p
      )
    );
  };
  

  const columnsProducts: GridColDef[] = [
    {
      field: 'select',
      headerName: 'Sel',
      flex: 0.5,
      renderCell: (params) => {
        const isSelected = selectedProducts.some((p) => p.productId === params.row.id);
        return (
          <Checkbox
            color="primary"
            checked={isSelected}
            onChange={() =>
              handleProductToggle({
                productId: params.row.id,
                name: params.row.name,
                quantity: isSelected
                  ? 1
                  : selectedProducts.find((p) => p.productId === params.row.id)?.quantity || 1,
              })
            }
            sx={{
              '&.Mui-checked': { color: '#47b2e4' },
              color: '#444444',
            }}
          />
        );
      },
    },
    
    { field: 'key', headerName: 'Product', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const product = selectedProducts.find((p) => p.productId === params.row.id);
        const isSelected = !!product; // Solo se edita si está en selectedProducts
    
        return (
          <TextField
            type="number"
            size="small"
            value={isSelected ? product?.quantity ?? 1 : ''}
            disabled={!isSelected} // Solo editable si está seleccionado
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (!isNaN(newValue) && newValue >= 1) {
                handleQuantityChange(params.row.id, newValue);
              }
            }}
            sx={{
              width: '80px',
              '& input': { textAlign: 'right' },
            }}
            inputProps={{ min: 1 }}
          />
        );
      },
    }
    
  ];
 
  

  const rowsProducts = products.map((product) => ({
    id: product._id,
    key: product.name,// 🔹 Asegura que el nombre está presente
    name: product.name, // ✅ Asegura que el campo `name` esté en la estructura
    description: product.description,
  }));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'cost', headerName: 'Cost', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
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
            onClick={() => handleDeleteDialogOpen(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  

  // const rows = Kits.map((Kit) => ({
  //   id: Kit._id,
  //   name: Kit.name,
  // }));

  const rows = kits.filter((kit: Kit) => kit._id && kit.name) 
  .map((kit: Kit) => ({
    id: kit._id, // Usa `_id` como identificador único
    name: kit.name,
    cost: kit.cost
  }));

  return (
    <Box p={2} sx={{ width: "100%", overflowX: "auto" }}>

      <Typography 
        variant="h4" 
        sx={{ mt: 3, mb: 3, textAlign: isSmallScreen ? "center" : "left" }}
      >
        {editingId ? 'Edit Kit' : 'Add New Kit'}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 2, mb: 3 }}>
        <TextField
          label="Kit Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          sx={{ flex: 1, minWidth: 200 }}
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
          sx={{ flex: 1, minWidth: 200 }}
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

      <Box sx={{ width: "100%", overflowX: "auto" }}>
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
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#304FFE", color: "#FFF",  fontSize: "1rem", },
            "& .MuiDataGrid-cell": { padding: "12px", fontSize: "0.9rem", display: "flex", alignItems: "center", },
            "& .MuiDataGrid-row:nth-of-type(odd)": { backgroundColor: "#F4F6F8" },
            "& .MuiButton-root": { borderRadius: "6px" },
            "& .status-cell": {
              textAlign: "center",
              //minWidth: 600,
              minWidth: "900px", // 🔹 Asegura un ancho mínimo
            },
            
          }}
        />
        <Box display="flex" gap={2} margin ="16px" >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={{
              color: '#ffffff',
              backgroundColor: '#47b2e4',
              "&:hover": {
                backgroundColor: "#3699c9",
              }
            }}
          >
            {editingId ? 'Update' : 'Save'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
            sx={{
              color: '#ffffff',
              backgroundColor: "#e57373", // 🔹 Prueba con un color rojo para ver si aparece
              "&:hover": {
                backgroundColor: "#d32f2f",
              }
            }}
          >
            Cancel
          </Button>
          
        </Box>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Kist List
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
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#304FFE", color: "#FFF",  fontSize: "1rem", },
            "& .MuiDataGrid-cell": { padding: "12px", fontSize: "0.9rem", display: "flex", alignItems: "center", },
            "& .MuiDataGrid-row:nth-of-type(odd)": { backgroundColor: "#F4F6F8" },
            "& .MuiButton-root": { borderRadius: "6px" },
            "& .status-cell": {
              textAlign: "center",
              //minWidth: 600,
              minWidth: "900px", // 🔹 Asegura un ancho mínimo
            },
            
          }}
        />        
      </Box>
      {/* Cuadro de diálogo de confirmación */}
      <Dialog
        isOpen={isDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this Product?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmUpdate}
      />

      {/* Cuadro de diálogo para eliminar */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this Kit?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

    </Box>
  );
};

export default Kits;
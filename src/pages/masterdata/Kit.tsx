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
//import SaveIcon from '@mui/icons-material/Save';
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
  quantity: number;
}

interface KitComponent {
  productId: string;
  quantity: number;
}
interface Kit {
  _id: string;
  name: string;
  description: string;
  components: KitComponent[];
  status: "active" | "inactive";
}

const Kits: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { kits, errorMessage, successMessage } = useAppSelector((state) => state.kits);
  const { products } = useAppSelector((state) => state.products);
  const [formData, setFormData] = useState({ name: '', description: '' });
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
    setSelectedProducts((prev) =>
      prev.some((p) => p.productId === product.productId)
        ? prev.filter((p) => p.productId !== product.productId)
        : [...prev, product]
    );
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
    const data = {
      name: formData.name,
      description: formData.description || "",  // 🛠️ Agregamos description por defecto vacío
      components: selectedProducts.map((p) => ({
        productId: typeof p === "string" ? p : p.productId,
        quantity: (typeof p === "object" && "quantity" in p) ? p.quantity : 1,
      })),
    };
  
    if (editingId) {
      dispatch(updateKit({ id: editingId, ...data })).then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ name: '', description: '' }); // Resetear también description
        setSelectedProducts([]);
      });
    } else {
      dispatch(createKit(data)).then(() => {
        dispatch(fetchKits());
        setFormData({ name: '', description: '' });
        setSelectedProducts([]);
      });
    }
  };
  

  const handleEdit = (id: string) => {
    const kit = kits.find((kit) => kit._id === id);
    if (kit) {
      setFormData({ name: kit.name, description: kit.description });
      setSelectedProducts(kit.components.map((prod) => ({
        productId: prod.productId, 
        quantity: prod.quantity
      })));
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description:'' });
    setEditingId(null);
    setSelectedProducts([]);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    const data = {
      name: formData.name,
      description: formData.description || "",  // 🛠️ Agregamos description por defecto vacío
      components: selectedProducts.map((p) => ({
        productId: typeof p === "string" ? p : p.productId,
        quantity: (typeof p === "object" && "quantity" in p) ? p.quantity : 1,
      })),
    };
  
    if (editingId) {
      dispatch(updateKit({ id: editingId, ...data })).then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setSelectedProducts([]);
      });
    } 
  };

  const columnsProducts: GridColDef[] = [
    {
      field: 'select',
      headerName: 'Sel',
      flex: 0.5,
      renderCell: (params) => (
        <Checkbox
          color="primary"
          checked={selectedProducts.includes(params.row.id)} // Verifica si está seleccionado
          onChange={() => handleProductToggle(params.row.id)} // Llama a la función al hacer clic
          sx={{
            '&.Mui-checked': {
              color: '#47b2e4',
            },
            color: '#444444',
          }}
        />
      ),
    },
    { field: 'key', headerName: 'Product', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ];

  const rowsProducts = products.map((products) => ({
    id: products._id,
    key: products.name,
    description: products.description,
  }));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
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
    name: kit.name
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
          >
            {editingId ? 'Update' : 'Save'}
          </Button>
          {editingId && (
            <Button
              variant="outlined" // Cambiado a `contained` para igualar el estilo de "Save"
              color="secondary" // O el color que prefieras
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          )}
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
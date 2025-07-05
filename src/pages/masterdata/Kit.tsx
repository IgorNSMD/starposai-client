import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Checkbox,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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

import { fetchProducts } from '../../store/slices/productSlice';
import { fetchTaxRates } from '../../store/slices/taxRateSlice';
import { fetchWarehouses } from '../../store/slices/warehouseSlice';
import { fetchSettingByContext } from '../../store/slices/settingSlice';
import { TaxRate } from '../../store/slices/taxRateSlice'; 
import { fetchProviders } from '../../store/slices/providerSlice';

import {
  formContainer_v2,
  inputContainer,
  inputField,
} from '../../styles/AdminStyles';

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
  stock: number;
  initialWarehouse?: string; // ✅ NUEVO
  taxRate?: string | TaxRate;
  components: KitComponent[];
  status: "active" | "inactive";
}

const Kits: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { kits, errorMessage, successMessage } = useAppSelector((state) => state.kits);
  const { products } = useAppSelector((state) => state.products);
  const { taxRates } = useAppSelector((state) => state.taxRates);
  const { currentSetting } = useAppSelector((state) => state.settings);
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const { providers } = useAppSelector((state) => state.providers);

  const [formData, setFormData] = useState({ 
    name: '', 
    cost: 0, 
    stock: 0,
    provider: '', // ✅ NUEVO
    initialWarehouse: '',
    taxRate: '', // ✅ NUEVO
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  // Cargar permisos al montar el componente
  useEffect(() => {
      dispatch(fetchSettingByContext()); // ✅ Configuración del local actual
      dispatch(fetchProducts({ status: "active" }));
      dispatch(fetchKits());
      dispatch(fetchWarehouses()); 
      dispatch(fetchTaxRates()); // ✅
      dispatch(fetchProviders());
    }, [dispatch, ]);

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

  
    if (editingId) {
      dispatch(updateKit({ 
        id: editingId, 
        name: formData.name, 
        cost: Number(formData.cost), 
        stock: Number(formData.stock), 
        provider: formData.provider || '', // ✅ AGREGAR AQUÍ
        initialWarehouse: formData.initialWarehouse || '', // ✅ NUEVO
        taxRate: formData.taxRate,
        components: selectedProducts.map(p => ({
          product: p.productId,
          productName: p.name,
          quantity: p.quantity
        }))
      }))
      .then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ 
          name: '', 
          cost: 0, 
          stock: 0,
          provider: '', // ✅ NUEVO
          initialWarehouse: '',
          taxRate: '', // ✅ NUEVO 
        });
        setSelectedProducts([]);
      });
    } else {
      dispatch(createKit({ 
        name: formData.name, 
        cost: Number(formData.cost), 
        stock: Number(formData.stock), 
        provider: formData.provider || '', 
        initialWarehouse: formData.initialWarehouse || '', 
        taxRate: formData.taxRate,
        components: selectedProducts.map(p => ({
          product: p.productId,
          productName: p.name,
          quantity: p.quantity
        }))
      }))
      .then(() => {
        dispatch(fetchKits());
        setFormData({ 
          name: '', 
          cost: 0, 
          stock: 0,
          provider: '', // ✅ NUEVO
          initialWarehouse: '',
          taxRate: '',  });
        setSelectedProducts([]);
      });
    }
    
  };
  
  

  const handleEdit = (id: string) => {
    //console.log("Editing kit with ID:", id);
    const kit = kits.find((kit) => kit._id === id);
    if (kit) {
      setFormData({ 
        name: kit.name, 
        cost: kit.cost, 
        stock: kit.stock,
        provider: kit.provider || '', // ✅ NUEVO
        initialWarehouse: kit.initialWarehouse || '',
        taxRate: kit.taxRate || '',  
      });
  
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
    setFormData({ 
      name: '', 
      cost: 0, 
      stock: 0, 
      provider: '', // ✅ NUEVO
      initialWarehouse: '',
      taxRate: '', 
    });
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
      cost: Number(formData.cost),
      stock: Number(formData.stock),
      provider: formData.provider || '',
      initialWarehouse: formData.initialWarehouse || '', // ✅ NUEVO
      taxRate: formData.taxRate || '', // ✅ CORRECTO
      components: selectedProducts.map(p => ({
        product: p.productId,
        productName: p.name,
        quantity: p.quantity
      }))
    };
  
    if (editingId) {
      dispatch(updateKit({ id: editingId, ...data })).then(() => {
        dispatch(fetchKits());
        setEditingId(null);
        setFormData({ 
          name: '', 
          cost: 0, 
          stock: 0, 
          provider: '', // ✅ NUEVO
          initialWarehouse: '',
          taxRate: '', 
        });
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
    { field: 'stock', headerName: 'Stock', flex: 1 },
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
    },
    
  ];
 
  

  const rowsProducts = products.map((product) => ({
    id: product._id,
    key: product.name,// 🔹 Asegura que el nombre está presente
    name: product.name, // ✅ Asegura que el campo `name` esté en la estructura
    stock: product.stock,
  }));

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'cost', headerName: 'Cost', flex: 1 },
    { field: 'stock', headerName: 'Stock', flex: 1 },
    { field: 'initialWarehouse', headerName: 'Warehouse', flex: 1 },
    { field: 'taxRate', headerName: 'Tax Rate', flex: 1 }, // ✅ nuevo
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
  .map((kit: Kit) => {
    const warehouseName = warehouses.find(w => w._id === kit.initialWarehouse)?.name || '-';
    const taxRateInfo = taxRates.find(rate => rate._id === kit.taxRate);
    const taxRateLabel = taxRateInfo ? `${taxRateInfo.name}` : '-';

    return {
      id: kit._id,
      name: kit.name,
      cost: kit.cost,
      stock: kit.stock || 0,
      initialWarehouse: warehouseName, // ✅ nombre en lugar de ID
      taxRate: taxRateLabel, // ✅ agregado
    };
  });

  return (
    <Box p={2} sx={formContainer_v2}>

      <Typography 
        variant="h4" 
        sx={{ mt: 3, mb: 3, textAlign: isSmallScreen ? "center" : "left" }}
      >
        {editingId ? 'Edit Kit' : 'Add New Kit'}
      </Typography>

      <Box sx={inputContainer}>
        <TextField
          label="Kit Name"
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
          label="Cost"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          sx={{
            ...inputField,
            backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
            pointerEvents: 'none', // No permite interacción
          }}
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
          type="number"
          value={formData.stock}
          onChange={handleChange}
          sx={{
            ...inputField,
            backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
            pointerEvents: 'none', // No permite interacción
          }}
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
        <FormControl sx={{ ...inputField }}>
          <InputLabel
            shrink={true}
            sx={{
              color: '#444444',
              '&.Mui-focused': { color: '#47b2e4' },
            }}
          >
            Provider
          </InputLabel>
          <Select
            name="provider"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          >
            {providers.map((prov) => (
              <MenuItem key={prov._id} value={prov._id}>
                {prov.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ ...inputField }}>
          <InputLabel
            shrink={true}
            sx={{
              color: '#444444',
              '&.Mui-focused': { color: '#47b2e4' },
            }}
          >
            Initial Warehouse
          </InputLabel>
          <Select
            name="initialWarehouse"
            value={formData.initialWarehouse}
            onChange={(e) =>
              setFormData({ ...formData, initialWarehouse: e.target.value })
            }
          >
            {warehouses.map((w) => (
              <MenuItem key={w._id} value={w._id}>
                {w.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ ...inputField }}>
          <InputLabel
            shrink={true}
            sx={{
              color: '#444444',
              '&.Mui-focused': { color: '#47b2e4' },
            }}
          >
            Tax Rate
          </InputLabel>
          <Select
            name="taxRate"
            value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
          >
            {taxRates
              .filter(rate =>
                rate.isActive &&
                rate.appliesTo.includes('PurchaseOrder') &&
                rate.country?.toLowerCase() === (currentSetting?.country || '').toLowerCase()
              )
              .map(rate => (
                <MenuItem key={rate._id} value={rate._id}>
                  {rate.name} 
                </MenuItem>
              ))}
          </Select>
        </FormControl>


      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
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
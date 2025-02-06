import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchProviders } from "../../store/slices/providerSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";

export interface Product {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  status: 'active' | 'inactive';
}

interface SelectedProduct extends Product {
  quantity: number;
}

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
  provider: string | Provider;
  products: POProduct[];  // Asegúrate de que es un array de POProduct
  total: number;
  estimatedDeliveryDate: string;
}


const PurchaseOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { providers } = useAppSelector((state) => state.providers);
  const { products } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    provider: '',
    estimatedDeliveryDate: '',
    products: [] as POProduct[], // <-- Agrega la tipificación explícita
    total: 0,
 });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  //const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchProviders({ status: "active" }));
    dispatch(fetchProducts({ status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  const handleProductSearch = () => {
    const foundProduct = products.find((prod) => prod.sku === searchTerm);
    if (foundProduct) {
      setSelectedProduct({ ...foundProduct, quantity: 1 });
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts: POProduct[] = [selectedProduct].map((p) => ({
      productId: p.sku,
      quantity: p.quantity,
      unitPrice: p.price,
      subtotal: p.quantity * p.price,
    }));

    const newTotal = updatedProducts.reduce(
      (sum, p) => sum + p.unitPrice * p.quantity,
      0
    );

    setFormData({
      ...formData,
      products: updatedProducts,
      total: newTotal,
    });

    setSelectedProduct(null);
    setSearchTerm("");
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    const newTotal = updatedProducts.reduce(
      (sum, p) => sum + p.unitPrice * p.quantity,
      0
    );
    setFormData({ ...formData, products: updatedProducts, total: newTotal });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" sx={{ marginBottom: 2 }}>
        PURCHASE ORDER
      </Typography>

      {/* Dropdown Proveedor */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2, 
        mb: 3
      }}>
        <Select
          value={formData.provider}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Provider</MenuItem>
          {providers.map((provider) => (
            <MenuItem key={provider._id} value={provider._id}>
              {provider.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          variant="outlined" // 👈 Esto asegura un borde visible
          sx={{ 
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}
          label="Order Number"
          value="Auto-generated"
          disabled
          fullWidth
        />
      </Box>

      {/* Búsqueda de Producto */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto 2fr auto 1fr 1fr auto", 
        gap: 1,
        alignItems: "center",
        mb: 3
      }}>
        {/* Code Input */}
        <TextField 
          label="Code" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          fullWidth 
        />
        
        {/* Search Icon dentro del campo Code */}
        <IconButton onClick={handleProductSearch}>
          <SearchIcon />
        </IconButton>

        {/* Product Name Input */}
        <TextField 
          label="Product Name" 
          value={selectedProduct?.name || ""} 
          fullWidth 
          disabled 
          variant="outlined" // 👈 Esto asegura un borde visible
          sx={{ 
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}
        />
        
        {/* Product List Icon dentro del campo Product Name */}
        <IconButton onClick={() => setSearchModalOpen(true)}>
          📋
        </IconButton>

        {/* Price Input */}
        <TextField 
          label="Price" 
          value={selectedProduct?.price || ""} 
          fullWidth 
          disabled 
          variant="outlined" // 👈 Esto asegura un borde visible
          sx={{ 
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}
        />

        {/* Total Input */}
        <TextField 
          label="Total" 
          value={(selectedProduct?.quantity || 0) * (selectedProduct?.price || 0)} 
          fullWidth 
          disabled 
          variant="outlined" // 👈 Esto asegura un borde visible
          sx={{ 
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}
        />

        {/* Add Product Button */}
        <IconButton color="primary" onClick={handleAddProduct}>
          <AddIcon />
        </IconButton>
      </Box>


      {/* Tabla de Productos */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        overflowX: "auto",  // Hace scroll horizontal en móviles
        boxShadow: 3,
        maxWidth: "100%",  // Evita que la tabla se desborde
      }}>
        <Table stickyHeader>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Price</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subtotal</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.products.map((p, index) => (
               <TableRow key={index} sx={{ bgcolor: index % 2 ? "#f9f9f9" : "white" }}>
                <TableCell>{p.productId}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>{p.unitPrice}</TableCell>
                <TableCell>{p.quantity * p.unitPrice}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleRemoveProduct(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totales */}
      <Box sx={{ 
        bgcolor: "#f5f5f5", 
        padding: 2, 
        borderRadius: 2, 
        textAlign: "right", 
        fontWeight: "bold",
        boxShadow: 2,
        mt: 2, 
        fontSize: "1.1rem" 
      }}>
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Subtotal: ${formData.total.toFixed(2)}</Typography>
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Tax (19%): ${(formData.total * 0.19).toFixed(2)}</Typography>
        <Typography variant="h5" sx={{ color: "primary.main", fontSize: "1.5rem", fontWeight: "bold" }}>
          Total: ${(formData.total * 1.19).toFixed(2)}
        </Typography>
      </Box>

      {/* Botones */}
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",  // Permite que los botones se apilen en pantallas chicas
        justifyContent: "center",
        gap: 2,
        mt: 3
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ 
            px: 4, 
            py: 1, 
            fontSize: "1rem", 
            borderRadius: "8px",
            minWidth: "150px"  // Asegura que los botones sean grandes en móviles
          }}
        >
          Save
        </Button>
        
        <Button 
          variant="outlined" 
          color="error" 
          sx={{ 
            px: 4, 
            py: 1, 
            fontSize: "1rem", 
            borderRadius: "8px",
            minWidth: "150px"
          }}
        >
          Cancel
        </Button>
      </Box>

      {/* Modal de Búsqueda Avanzada */}
      <Dialog open={searchModalOpen} onClose={() => setSearchModalOpen(false)}>
        <DialogTitle>Search Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter text to search"
            fullWidth
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderPage;

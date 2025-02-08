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
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { createPurchaseOrder } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { useToastMessages } from  "../../hooks/useToastMessage"
import CustomDialog from '../../components/Dialog'; // Dale un alias como 'CustomDialog'

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
  products: POProduct[];
  total: number;
  estimatedDeliveryDate: string;
  orderNumber?: string;  // Agregamos orderNumber opcionalmente
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};


const PurchaseOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  

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

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

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

  const handleSubmit = () => {

    console.log('handleSubmit -> Inicio')

    const providerObject: Provider | undefined = 
      typeof formData.provider === "string"
        ? providers.find((p) => p._id === formData.provider)
        : formData.provider;
  
    if (!providerObject) {
      return;
    }
    
    console.log('handleSubmit -> p1')

    const purchaseOrderData = { ...formData, provider: providerObject };

    console.log('handleSubmit -> p2')

    dispatch(createPurchaseOrder(purchaseOrderData))
      .unwrap()
      .then((data) => {
        console.error('PO creada exitosamente');
        setFormData({ ...formData, orderNumber: data.orderNumber });
      })
      .catch((error) => {
        console.error('Error al crear PO: ', error);
      });

      console.log('handleSubmit -> fin')
  };

  const handleDeleteDialogOpen = (index: number) => {
    setSelectedProductIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProductIndex !== null) {
      const updatedProducts = formData.products.filter((_, i) => i !== selectedProductIndex);
      const newTotal = updatedProducts.reduce(
        (sum, p) => sum + p.unitPrice * p.quantity,
        0
      );
      setFormData({ ...formData, products: updatedProducts, total: newTotal });
    }
    setDeleteDialogOpen(false);
  };

  const handleCancelDialogOpen = () => {
    if (formData.products.length > 0) {
      setCancelDialogOpen(true);
    } else {
      handleConfirmCancel();
    }
  };

  const handleConfirmCancel = () => {
    setFormData({
      provider: '',
      estimatedDeliveryDate: '',
      products: [],
      total: 0,
    });
    setCancelDialogOpen(false);
  };

  return (
    <Box 
      sx={{ 
        padding: 4, 
       "@media (max-width: 900px)": {padding: 4, maxWidth: "400px", margin: "0 auto"}}}
      >
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ marginBottom: 2,fontWeight: "bold", color: "#666", mb: 2  }}>
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
      {/* Sección de búsqueda de producto en dos líneas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // Web: dos columnas para separar filas
          gap: 2,
          alignItems: "center",
          mb: 3,
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr", // Móvil: una sola columna
          },
        }}
      >
        {/* Primera línea en web */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr auto", // Web: Distribución normal
            gap: 2, // Aumenta el espacio entre los elementos
            alignItems: "center",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "40px 1fr", // Móvil: Acomoda en una sola columna
            },
          }}
        >
          {/* Botón de limpiar */}
          <IconButton onClick={() => { setSearchTerm(""); setSelectedProduct(null); }} color="secondary">
            ❌
          </IconButton>

          {/* Code Input */}
          <TextField label="Code" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />

          {/* Buscar producto */}
          <IconButton onClick={handleProductSearch} sx={{ marginLeft: "-10px" }}>
            <SearchIcon />
          </IconButton>

          {/* Product Name Input */}
          <TextField 
            label="Product Name" 
            value={selectedProduct?.name || ""} 
            fullWidth 
            disabled 
            variant="outlined" // Asegura que tenga bordes visibles
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)", // Color del borde
                },
                "&:hover fieldset": {
                  borderColor: "primary.main", // Color del borde al pasar el mouse
                },
                "&.Mui-disabled fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)", // Color del borde cuando está deshabilitado
                },
              },
            }}
            />


        </Box>

        {/* Segunda línea en web */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto auto auto auto auto", // Web: Distribución normal
            gap: 2,
            alignItems: "center",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr", // Móvil: Apilado
              gap: 2,
            },
          }}
        >
          {/* Product List Icon */}
          <IconButton onClick={() => setSearchModalOpen(true)} sx={{ marginLeft: "-10px" }}>
            📋
          </IconButton>

          {/* Cantidad */}
          <TextField
            label="Qty"
            type="number"
            value={selectedProduct?.quantity || ""}
            onChange={(e) =>
              setSelectedProduct((prev) =>
                prev ? { ...prev, quantity: Number(e.target.value) } : null
              )
            }
            fullWidth
          />

          {/* Precio */}
          <TextField
            label="Price"
            type="text" 
            value={selectedProduct?.price ? new Intl.NumberFormat("es-CL").format(selectedProduct.price) : ""}
            fullWidth
            disabled
            sx={{
              borderRadius: 1,
              border: "1px solid #ccc",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#555",
              textAlign: "right",
              "& .MuiInputBase-input": {
                textAlign: "right", // Asegura que el texto dentro del input esté a la derecha
              },
              "@media (max-width: 900px)": {
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: "bold",
                pt: 1,
              },
            }}
          />

          {/* Total */}
          <TextField
            label="Total"
            value={selectedProduct?.quantity && selectedProduct?.price
              ? new Intl.NumberFormat("es-CL").format(selectedProduct.quantity * selectedProduct.price)
              : ""}
            fullWidth
            disabled
            sx={{
              borderRadius: 1,
              border: "1px solid #ccc",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#555",
              textAlign: "right",
              "& .MuiInputBase-input": {
                textAlign: "right", // Asegura que el texto dentro del input esté a la derecha
              },
              "@media (max-width: 900px)": {
                marginTop: "8px",
              },
            }}
          />

          {/* Botón "+" */}
          <IconButton
            color="primary"
            onClick={handleAddProduct}
            sx={{
              fontSize: "2rem",
              width: "48px",
              height: "48px",
              "@media (max-width: 900px)": {
                fontSize: "3rem", // Aumenta tamaño del ícono en móvil
                width: "64px", // Aumenta el tamaño del botón en móvil
                height: "64px",
                justifySelf: "center", // Centra horizontalmente en la grid
                alignSelf: "center", // Centra verticalmente en la grid
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>


      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          width: "100%",
          alignItems: "center",
          "@media (max-width: 900px)": {
            flexDirection: "column", // 🔹 Lo apilamos en móviles
            gap: 2,
          }
        }}
      >
      </Box>   

      {/* Tabla de Productos */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        overflowX: "auto",  // Hace scroll horizontal en móviles
        boxShadow: 3,
        maxWidth: "100%",  // Evita que la tabla se desborde
        "@media (max-width: 900px)": {
          maxWidth: "100%",
          overflowX: "auto",
        },        
      }}>
        <Table stickyHeader size="small"> {/* Se cambia a "small" para hacerla más compacta */}
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Price</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Subtotal</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.products.map((p, index) => (
               <TableRow key={index} sx={{ bgcolor: index % 2 ? "#f9f9f9" : "white" }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.productId}</TableCell>
                <TableCell>{p.productId}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>{formatNumber(p.quantity)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>${formatNumber(p.unitPrice)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>${formatNumber(p.quantity * p.unitPrice)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <IconButton color="error" onClick={() => handleDeleteDialogOpen(index)}>
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
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Subtotal: ${formatNumber(formData.total)}</Typography>
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Tax (19%): ${formatNumber(formData.total * 0.19)}</Typography>
        <Typography variant="h5" sx={{ color: "primary.main", fontSize: "1.5rem", fontWeight: "bold" }}>
          Total: ${formatNumber(formData.total * 1.19)}
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
          onClick={handleSubmit}
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
          onClick={handleCancelDialogOpen}
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
      {/* Modal de Búsqueda Avanzada */}
      <Dialog open={searchModalOpen} onClose={() => setSearchModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", pb: 1 }}>Select a Product</DialogTitle>
        
        <DialogContent>
          {/* Campo de búsqueda */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Enter product name or code"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputBase-root": { height: 48 }, 
                "& .MuiInputLabel-root": { top: "4px" },
              }}
            />
          </Box>

          {/* Tabla de resultados */}
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto", borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  {["Code", "Product Name", "Category", "Price", "Stock", "Action"].map((head) => (
                    <TableCell key={head} sx={{ color: "white", fontWeight: "bold", p: 1, textAlign: head === "Action" ? "center" : "left" }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((prod) => (
                  <TableRow key={prod._id} hover>
                    <TableCell sx={{ p: 1 }}>{prod.sku}</TableCell>
                    <TableCell sx={{ p: 1 }}>{prod.name}</TableCell>
                    <TableCell sx={{ p: 1, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.category}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "right" }}>${prod.price.toFixed(2)}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "center" }}>{prod.stock}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2, minWidth: 80 }}
                        onClick={() => {
                          setSelectedProduct({ ...prod, quantity: 1 });
                          setSearchTerm(prod.sku);
                          setSearchModalOpen(false);
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pr: 2 }}>
          <Button onClick={() => setSearchModalOpen(false)} color="error" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>


      <CustomDialog
        isOpen={deleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to remove this product?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

    </Box>
  );
};

export default PurchaseOrderPage;

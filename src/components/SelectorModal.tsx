import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/redux/hooks";
import { Product, fetchProducts } from "../store/slices/productSlice";
import { Kit, fetchKits } from "../store/slices/kitSlice";
import { Box } from "@mui/system";


interface SelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Product | Kit) => void;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(value);
};

const SelectorModal: React.FC<SelectorModalProps> = ({ open, onClose, onSelect }) => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { kits } = useAppSelector((state) => state.kits);

  const [tabIndex, setTabIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Product | Kit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (open) {
      dispatch(fetchProducts({ status: "active" }));
      dispatch(fetchKits());
    }
  }, [open, dispatch]);

    // Manejo de cambio de cantidad
    const handleQuantityChange = (productId: string, value: string) => {
      const quantity = parseInt(value, 10) || 1;
      setQuantities((prev) => ({ ...prev, [productId]: quantity }));
    };

  // ✅ Filtra productos/kits en función del texto ingresado
  const filteredItems = (tabIndex === 0 ? products : kits).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
    setSearchTerm(""); // 🔹 Limpia el filtro al cambiar de pestaña
  };

  const handleSelectItem = (item: Product | Kit) => {
    setSelectedItem(item);
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      setSelectedItem(null);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", color: "#666",pb: 1 }}>
        {tabIndex === 0 ? "Select Product " : "Select kit"}
      </DialogTitle>

      <Tabs 
        value={tabIndex} 
        onChange={handleTabChange} 
        centered
        sx={{
          borderBottom: "2px solid #ddd",
          "& .MuiTab-root": { 
            fontWeight: "bold", 
            color: "#999"  // Hace que los tabs no seleccionados sean visibles
          },
          "& .Mui-selected": { 
            color: "#007FFF", // Color destacado para el seleccionado
            fontWeight: "bold"
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#007FFF" // Color del indicador debajo del tab seleccionado
          },
          mb: 1, // Agrega margen inferior para separarlo del TextField
        }}
        >
        <Tab label="Products" />
        <Tab label="Kits" />
      </Tabs>

      {/* INPUT DE BÚSQUEDA */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, px: 3 }}>
        <TextField
          label="Enter name"
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

      <DialogContent>
        <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f0f0f0" }}>
              <TableRow>
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>}
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Price</TableCell>}
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Stock</TableCell>}
                <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Quantity</TableCell>                
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item._id} hover>
                  {/* Si es la pestaña de productos, muestra la columna de SKU */}
                  {tabIndex === 0 && <TableCell>{'sku' in item ? item.sku : "N/A"}</TableCell>}

                   {/* Nombre del producto o kit */}
                  <TableCell>{item.name}</TableCell>

                  {/* Si es la pestaña de productos, muestra precio y stock */}
                  {tabIndex === 0 && <TableCell sx={{ textAlign: "right" }}>{'price' in item ? `$${formatNumber(item.price)}` : "-"}</TableCell>}
                  {tabIndex === 0 && <TableCell sx={{ textAlign: "right" }}>{'stock' in item ? formatNumber(item.stock) : "-"}</TableCell>}

                  <TableCell sx={{ textAlign: "right" }}>
                    <TextField
                      type="number"
                      size="small"
                      value={quantities[item._id] || 1}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      inputProps={{ min: 1, style: { textAlign: "center" } }}
                      sx={{
                        width: "60px",
                        marginLeft: "auto", // Empuja el campo hacia la derecha
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    />
                  </TableCell>                  
                  
                  {/* Botón de acción */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onSelect(item)}
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
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleConfirmSelection} color="primary" disabled={!selectedItem}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectorModal;
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
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { Product, fetchProducts } from "../../store/slices/productSlice";
import { Kit, fetchKits } from "../../store/slices/kitSlice";


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

  useEffect(() => {
    if (open) {
      dispatch(fetchProducts({ status: "active" }));
      dispatch(fetchKits());
    }
  }, [open, dispatch]);

  const handleTabChange = (_: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
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
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", pb: 0 }}>
        {tabIndex === 0 ? "PRODUCTS" : "KITS"}
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
          }
        }}
        >
        <Tab label="Products" />
        <Tab label="Kits" />
      </Tabs>
      <DialogContent>
        <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f0f0f0" }}>
              <TableRow>
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>}
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Price</TableCell>}
                {tabIndex === 0 && <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Stock</TableCell>}
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(tabIndex === 0 ? products : kits).map((item) => (
                <TableRow key={item._id} hover>
                  {/* Si es la pestaña de productos, muestra la columna de SKU */}
                  {tabIndex === 0 && <TableCell>{'sku' in item ? item.sku : "N/A"}</TableCell>}

                   {/* Nombre del producto o kit */}
                  <TableCell>{item.name}</TableCell>

                  {/* Si es la pestaña de productos, muestra precio y stock */}
                  {tabIndex === 0 && <TableCell sx={{ textAlign: "right" }}>{'price' in item ? `$${formatNumber(item.price)}` : "-"}</TableCell>}
                  {tabIndex === 0 && <TableCell  sx={{ textAlign: "right" }}>{'stock' in item ? formatNumber(item.stock) : "-"}</TableCell>}
                  
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
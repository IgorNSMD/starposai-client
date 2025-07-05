import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Paper
} from "@mui/material";
import { Product } from "../../store/slices/productSlice";

interface ProductSelectorModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSelect: (product: Product, quantity: number) => void;
  filterType?: 'product' | 'recipe' | 'kit' | 'all' | ('product' | 'kit')[];
}

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  open,
  products,
  onClose,
  onSelect,
  filterType // ✅ Desestructura aquí
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});

  const filtered = products.filter(p =>
    (
      filterType === 'all' ||
      !filterType ||
      (Array.isArray(filterType) && filterType.includes(p.type as 'product' | 'kit')) ||
      (!Array.isArray(filterType) && p.type === filterType)
    ) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  useEffect(() => {
    // Reinicia cantidades al abrir
    if (open) {
      const initial = products.reduce((acc, prod) => {
        acc[prod._id] = 1;
        return acc;
      }, {} as { [id: string]: number });
      setQuantities(initial);
    }
  }, [open, products]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", color: "#666",pb: 1 }}>
        Select Product
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Search by name or code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <TableContainer 
          component={Paper}
          sx={{
            overflowX: 'auto',
            maxWidth: '100%',
          }}
          >
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((prod) => (
                <TableRow key={prod._id}>
                  <TableCell>{prod.sku}</TableCell>
                  <TableCell>{prod.name}</TableCell>
                  <TableCell>{prod.stock}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={quantities[prod._id] || 1}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [prod._id]: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: "60px" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      onClick={() => onSelect(prod, quantities[prod._id] || 1)}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectorModal;

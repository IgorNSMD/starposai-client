import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
  fetchInventoryMovements,
  createInventoryMovement,
  clearMessages,
} from '../../store/slices/inventoryMovementSlice';

const InventoryMovement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { movements, isLoading, successMessage, errorMessage } = useAppSelector((state) => state.inventorymovements);

  const [filters, setFilters] = useState<{ productId: string; type: string }>({
    productId: '',
    type: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: { _id: '', name: '' }, // Cambiar de string a objeto
    type: 'entry' as 'entry' | 'exit' | 'adjustment',
    quantity: 0,
    reason: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInventoryMovements(filters));
  }, [dispatch, filters]);

  const handleSearch = () => {
    dispatch(fetchInventoryMovements(filters));
  };

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ productId: '', type: 'entry', quantity: 0, reason: '' });
    setLocalError(null);
    dispatch(clearMessages());
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      productId: formData.productId._id, // Solo pasa el ID al backend
    };
    dispatch(createInventoryMovement(payload))
      .unwrap()
      .then(() => {
        // Manejo de éxito
      })
      .catch((error) => {
        // Manejo de error
      });
  };

  const handleProductChange = (selectedProduct: { _id: string; name: string }) => {
    setFormData({ ...formData, productId: selectedProduct });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const rows = movements.map((movement) => ({
    id: movement._id,
    productId: movement.productId.name,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    date: new Date(movement.date).toLocaleDateString(),
  }));

  const columns: GridColDef[] = [
    { field: 'productId', headerName: 'Product', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'reason', headerName: 'Reason', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Inventory Movements
      </Typography>

      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <TextField
            label="Product ID"
            name="productId"
            value={filters.productId}
            onChange={handleFilterChange}
            fullWidth
          />
          <Select
            label="Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="entry">Entry</MenuItem>
            <MenuItem value="exit">Exit</MenuItem>
            <MenuItem value="adjustment">Adjustment</MenuItem>
          </Select>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} loading={isLoading} />
      </Paper>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenModal}
        sx={{ marginTop: 2 }}
      >
        New Movement
      </Button>

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>New Inventory Movement</DialogTitle>
        {localError && <Alert severity="error">{localError}</Alert>}
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
            <TextField
              label="Product ID"
              name="productId"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              fullWidth
            />
            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entry' | 'exit' | 'adjustment' })}
              fullWidth
            >
              <MenuItem value="entry">Entry</MenuItem>
              <MenuItem value="exit">Exit</MenuItem>
              <MenuItem value="adjustment">Adjustment</MenuItem>
            </Select>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryMovement;

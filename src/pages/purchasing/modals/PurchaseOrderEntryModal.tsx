import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import { Warehouse } from '../../../types/types';
import { PurchaseOrderItem } from "../../../store/slices/purchaseOrderSlice";

interface EntryItem {
  referenceId?: string;
  referenceType: 'Product' | 'Kit';
  name: string;
  quantityToReceive: number;
  warehouseId: string;
  cost: number;
  unitPurchase: string;
  unitFactor: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (entries: EntryItem[]) => void;
  items: PurchaseOrderItem[];
  warehouses: Warehouse[];
}

const PurchaseOrderEntryModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  items,
  warehouses
}) => {
  const [entryData, setEntryData] = useState<EntryItem[]>([]);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open && items.length && warehouses.length) {
      const initialEntryData = items.map((item) => {
        const receivedQty = typeof item.receivedQuantity === 'number' ? item.receivedQuantity : 0;
        const orderedQty = item.quantity ?? 0;
        const availableQty = Math.max(orderedQty - receivedQty, 0);

        return {
          referenceId: item.referenceId,
          referenceType: (item.type === 'Kit' ? 'Kit' : 'Product') as 'Kit' | 'Product',
          name: item.name,
          quantityToReceive: availableQty,
          warehouseId: item.initialWarehouse || warehouses[0]?._id || '',
          cost: item.cost || 0,
          unitPurchase: item.unitPurchase || '',
          unitFactor: item.unitFactor || 1,
        };
      });
      setEntryData(initialEntryData);
    }
  }, [open, items, warehouses]);

  const handleChange = (
    index: number,
    field: 'quantityToReceive' | 'warehouseId' | 'cost',
    value: string
  ) => {
    setEntryData((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'cost' || field === 'quantityToReceive'
                ? parseFloat(value) || 0
                : value
            }
          : item
      )
    );
  };

  const isValid = entryData.some((item, index) => {
    const original = items[index];
    const max = (original.quantity ?? 0) - (original.receivedQuantity ?? 0);
    return item.quantityToReceive > 0 && item.quantityToReceive <= max && !!item.warehouseId;
  });

  const handleConfirm = () => {
    onConfirm(entryData); // Sin transformación
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#444' }}>
        Register Stock Entry
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Modify the quantities you want to receive and select the corresponding warehouse.
        </Typography>

        {!isSmall && (
          <Grid container spacing={2} sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1, mb: 1 }}>
            <Grid item xs={3}><strong>Product</strong></Grid>
            <Grid item xs={1}><strong>Qty</strong></Grid>
            <Grid item xs={2}><strong>Cost</strong></Grid>
            <Grid item xs={3}><strong>Qty to Receive</strong></Grid>
            <Grid item xs={3}><strong>Warehouse</strong></Grid>
          </Grid>
        )}

        <Grid container spacing={2}>
          {entryData.map((item, index) => {
            const itemPO = items[index];
            const qty = itemPO.quantity ?? 0;
            const receivedQty = itemPO.receivedQuantity ?? 0;
            const maxAvailable = qty - receivedQty;

            return (
              <React.Fragment key={item.referenceId ?? index}>
                {isSmall ? (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>{item.name}</Typography>
                      <TextField
                        label="Qty"
                        value={qty}
                        fullWidth
                        margin="dense"
                        disabled
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Cost"
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleChange(index, 'cost', e.target.value)}
                        fullWidth
                        margin="dense"
                        inputProps={{ min: 0, step: 0.01 }}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Qty to Receive"
                        type="number"
                        value={item.quantityToReceive}
                        onChange={(e) => handleChange(index, 'quantityToReceive', e.target.value)}
                        error={item.quantityToReceive > maxAvailable}
                        helperText={
                          item.quantityToReceive > maxAvailable
                            ? 'Exceeds available'
                            : ''
                        }
                        fullWidth
                        margin="dense"
                        inputProps={{ min: 1 }}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Warehouse"
                        select
                        value={item.warehouseId}
                        onChange={(e) =>
                          handleChange(index, 'warehouseId', e.target.value)
                        }
                        fullWidth
                        margin="dense"
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}
                      >
                        {warehouses.map((wh) => (
                          <MenuItem key={wh._id} value={wh._id}>
                            {wh.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={3}>
                      <TextField 
                        value={item.name} 
                        fullWidth disabled 
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}                        
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <TextField 
                        value={qty} 
                        fullWidth 
                        disabled 
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}                        
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleChange(index, 'cost', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: "center" } }}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}                        
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        type="number"
                        value={item.quantityToReceive}
                        onChange={(e) => handleChange(index, 'quantityToReceive', e.target.value)}
                        error={item.quantityToReceive > maxAvailable}
                        helperText={
                          item.quantityToReceive > maxAvailable
                            ? 'Exceeds available'
                            : ''
                        }
                        fullWidth
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}                        
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        select
                        value={item.warehouseId}
                        onChange={(e) =>
                          handleChange(index, 'warehouseId', e.target.value)
                        }
                        fullWidth
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#444444",
                              "&.Mui-focused": { color: "#47b2e4" },
                            },
                          },
                        }}                        
                      >
                        {warehouses.map((wh) => (
                          <MenuItem key={wh._id} value={wh._id}>
                            {wh.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">
          Cancel
        </Button>
        <Button
           onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!isValid}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseOrderEntryModal;
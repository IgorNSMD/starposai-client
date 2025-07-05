import React, { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, Grid, MenuItem, Paper, Autocomplete
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchWarehouses } from "../../store/slices/warehouseSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { createInventoryMovement, fetchInventoryDisassembly } from "../../store/slices/inventoryMovementSlice";
import {
  formTitle, inputField, submitButton, cancelButton, datagridStyle
} from "../../styles/AdminStyles";
import { useToast } from "../../hooks/useToastMessage";
import { hasStockByWarehouse } from "../../utils/hasStockByWarehouse";
import { InventoryMovement } from "../../types/types";

interface ItemOption {
  _id: string;
  name: string;
}

function resolveName(entity: string | { name: string } | null, fallback: string): string {
  if (entity && typeof entity === "object" && "name" in entity) {
    return entity.name;
  }
  return fallback;
}

const KitDisassembly: React.FC = () => {
  const dispatch = useAppDispatch();
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const { movements } = useAppSelector((state) => state.inventorymovements);
  const { products } = useAppSelector((state) => state.products);
  const kits = products.filter((p) => p.type === "kit");
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    referenceId: "",
    quantity: 0,
    warehouse: "",
    reason: ""
  });

  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchInventoryDisassembly());
    dispatch(fetchProducts({ status: 'active' }));
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) : value
    }));
  };

  const selectedKit = kits.find((k) => k._id === formData.referenceId);

  const getStockInWarehouse = () => {
    if (selectedKit && hasStockByWarehouse(selectedKit)) {
      return selectedKit.stockByWarehouse.find(
        (s) => s.warehouse === formData.warehouse
      )?.quantity || 0;
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!selectedKit) {
      showError("Debe seleccionar un kit válido.");
      return;
    }

    const availableStock = getStockInWarehouse();
    if (formData.quantity > availableStock) {
      showError(`Stock insuficiente. Disponibles: ${availableStock}`);
      return;
    }

    const kitComponents = selectedKit?.components?.map((comp) => {
      const productId = typeof comp.product === "string"
        ? comp.product
        : comp.product._id;

      return {
        productId,
        quantity: comp.quantity * formData.quantity,
      };
    }) || [];

    dispatch(
      createInventoryMovement({
        referenceId: formData.referenceId,
        referenceType: "Kit",
        quantity: formData.quantity,
        warehouse: formData.warehouse,
        reason: formData.reason,
        sourceType: "Disassembly",
        kitComponents
      })
    ).unwrap().then(() => {
      showSuccess("Desensamblaje registrado correctamente.");
      dispatch(fetchInventoryDisassembly());
      resetForm();
    }).catch((error) => {
      showError(error);
    });
  };

  const resetForm = () => {
    setFormData({ referenceId: "", quantity: 0, warehouse: "", reason: "" });
  };

  const availableItems: ItemOption[] = kits.map(({ _id, name }) => ({ _id, name }));

  const columns: GridColDef[] = [
    { field: "warehouseName", headerName: "Warehouse", flex: 1 },
    { field: "referenceLabel", headerName: "Kit", flex: 1.5 },
    { field: "quantity", headerName: "Qty", flex: 0.7 },
    { field: "reason", headerName: "Reason", flex: 1.5 },
  ];

  const disassemblyMovements = movements
    .filter((m) => m && m.sourceType === "Disassembly")
    .map((m: InventoryMovement) => {
      const sourceWhName = resolveName(m.warehouse, warehouses.find(w => w._id === m.warehouse)?.name || String(m.warehouse));
      const referenceLabel = resolveName(
        m.referenceId,
        products.find(p => p._id === m.referenceId && p.type === "kit")?.name || String(m.referenceId)
      );

      return {
        id: m._id,
        warehouseName: sourceWhName,
        referenceLabel,
        quantity: m.quantity,
        reason: m.reason || "-",
      };
    });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        px: 1,
        pb: 4,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: "1000px",
          p: { xs: 2, sm: 3 },
          boxShadow: 3,
          borderRadius: 2,
          mb: 1,
        }}
      >
        <Typography sx={formTitle}>Register Kit Disassembly</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              fullWidth
              sx={inputField}
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

          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={availableItems}
              getOptionLabel={(item) => item.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={availableItems.find((item) => item._id === formData.referenceId) || null}
              onChange={(_, newValue) => {
                setFormData((prev) => ({ ...prev, referenceId: newValue?._id || "" }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Reference Item" 
                  fullWidth sx={inputField} 
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
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              sx={inputField}
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
            {selectedKit && formData.warehouse && (
              <Typography sx={{ fontSize: "0.875rem", color: "#666", mt: 1 }}>
                Stock disponible: {getStockInWarehouse()} unidades
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              sx={inputField}
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
        </Grid>

        <Box display="flex" gap={2} mt={3}>
          <Button variant="outlined" onClick={resetForm} startIcon={<CancelIcon />} sx={cancelButton}>
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
            disabled={
              !formData.referenceId || !formData.warehouse || formData.quantity <= 0 || getStockInWarehouse() < formData.quantity
            }
          >
            Save
          </Button>
        </Box>

        {selectedKit && formData.quantity > 0 && (
          <Paper sx={{ mt: 3, p: 2, backgroundColor: "#f9f9f9" }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Componentes resultantes del desensamblaje:
            </Typography>
            <ul>
              {selectedKit.components?.map((comp, index) => {
                const qty = comp.quantity * formData.quantity;
                const name: string =
                  typeof comp.product === "object" && comp.product !== null && "name" in comp.product
                    ? (comp.product as { name: string }).name
                    : typeof comp.product === "string"
                      ? comp.product
                      : "Producto";

                return (
                  <li key={index}>
                    {name}: {qty} unidad{qty > 1 ? "es" : ""}
                  </li>
                );
              })}
            </ul>
          </Paper>
        )}
      </Paper>

      <Paper
        sx={{
          width: "100%",
          maxWidth: "1000px",
          p: 2,
          boxShadow: 3,
          borderRadius: 2,
          overflowX: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Kit Disassembly History
        </Typography>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
           <Box sx={{ minWidth: "600px" }}>
              <DataGrid
                rows={disassemblyMovements}
                columns={columns}
                autoHeight
                pageSizeOptions={[5, 10, 20, 100]}
                sx={datagridStyle}
                disableRowSelectionOnClick
              />
           </Box>

        </Box>
      </Paper>
    </Box>
  );

};

export default KitDisassembly;

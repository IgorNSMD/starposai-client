import React, { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, Grid, MenuItem, Paper,
  Autocomplete, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchWarehouses } from "../../store/slices/warehouseSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchKits } from "../../store/slices/kitSlice";
import { createInventoryTransfer, fetchInventoryTranfers, } from "../../store/slices/inventoryMovementSlice";
import {
  formTitle, inputField, submitButton, cancelButton,

  formContainer_v2
} from "../../styles/AdminStyles";

import { useToast } from "../../hooks/useToastMessage";
import { hasStockByWarehouse } from "../../utils/hasStockByWarehouse";

interface ItemOption {
  _id: string;
  name: string;
}

interface PopulatedMovement {
  _id: string;
  type: string;
  referenceType: "Product" | "Kit";
  referenceId: { _id: string; name: string } | string;
  quantity: number;
  reason: string;
  sourceWarehouse: string;
  destinationWarehouse: string;
  sourceType: string;
}


interface MovementWithLabel extends PopulatedMovement {
  referenceLabel?: string;
}

const TransferInventory: React.FC = () => {
  const dispatch = useAppDispatch();

  //const [localMovements, setLocalMovements] = useState<MovementWithLabel[]>([]);

  const { warehouses } = useAppSelector((state) => state.warehouses);
  const { movements  } = useAppSelector((state) => state.inventorymovements);
  const { products } = useAppSelector((state) => state.products);
  const { kits } = useAppSelector((state) => state.kits);

  const { showError } = useToast();

  const [formData, setFormData] = useState({
    referenceType: "Product" as "Product" | "Kit",
    referenceId: "",
    quantity: 0,
    reason: "",
    sourceVenue: "",             // <-- nuevo campo
    destinationVenue: "",       // <-- nuevo campo
    sourceWarehouse: "",
    destinationWarehouse: ""
  });

  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchInventoryTranfers());
    dispatch(fetchProducts({ status: "active" }));
    dispatch(fetchKits());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) : value,
    }));
  };




  const handleSubmit = () => {

    const entity = formData.referenceType === "Product"
      ? products.find((p) => p._id === formData.referenceId)
      : kits.find((k) => k._id === formData.referenceId);

    if (!entity) {
      showError("El producto o kit seleccionado no existe.");
      return;
    }

    if (!hasStockByWarehouse(entity)) {
      showError("No se puede obtener el stock del almacén de origen.");
      return;
    }

    const stockByWarehouse = entity.stockByWarehouse;

    const sourceStock = stockByWarehouse.find(
      (s) => s.warehouse === formData.sourceWarehouse
    )?.quantity || 0;


    if (formData.quantity > sourceStock) {
      showError(`Stock insuficiente. Tienes ${sourceStock} unidades disponibles.`);
      return;
    }

    const itemList = formData.referenceType === "Product" ? products : kits;
    const selectedItem = itemList.find((item) => item._id === formData.referenceId);

    dispatch(createInventoryTransfer({
    ...formData,
      sourceType: "Transfer",
      venueId: formData.sourceVenue, // solo el local de salida
    }))
     .unwrap()
      .then((movements) => {
        // Este patch reemplaza el referenceId string por el objeto completo con nombre

        (movements as MovementWithLabel[]).map((m) => ({
          ...m,
          referenceLabel: selectedItem?.name || String(m.referenceId),
        }));

        //setLocalMovements((prev) => [...enriched, ...prev]);


      // Opcional: podrías despachar otro `setMovements` si quieres actualizarlo inmediatamente
      // dispatch(setMovements([...existing, ...enriched]))
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      referenceType: "Product",
      referenceId: "",
      quantity: 0,
      reason: "",
      sourceVenue: "",             // <-- nuevo campo
      destinationVenue: "",       // <-- nuevo campo      
      sourceWarehouse: "",
      destinationWarehouse: ""
    });
  };

  const availableItems: ItemOption[] = (formData.referenceType === "Product" ? products : kits)
    ?.map(({ _id, name }) => ({ _id, name }));

  const columns: GridColDef[] = [
    { field: "type", headerName: "Type", flex: 1 },
    { field: "sourceVenueName", headerName: "From Venue", flex: 1 },
    { field: "sourceWarehouseName", headerName: "From", flex: 1 },
    { field: "destinationVenueName", headerName: "To Venue", flex: 1 },
    { field: "destinationWarehouseName", headerName: "To", flex: 1 },
    { field: "referenceLabel", headerName: "Item", flex: 1.5 },
    { field: "referenceType", headerName: "Ref Type", flex: 1 },
    { field: "reason", headerName: "Reason", flex: 1.5 },
    { field: "quantity", headerName: "Qty", flex: 0.7 }
  ];

  const allMovements = movements.map((m) => {
  let referenceLabel: string;

  if (
    typeof m.referenceId === "object" &&
    m.referenceId !== null &&
    "_id" in m.referenceId &&
    "name" in m.referenceId
  ) {
     referenceLabel = (m.referenceId as { name: string }).name;
  } else {

    const itemList = m.referenceType === "Product" ? products : kits;
    const found = itemList.find((i) => i._id === m.referenceId);
    referenceLabel = found?.name || String(m.referenceId);
  }

  return {
    ...m,
    referenceLabel,
  };
  });



  const rows = allMovements
  .filter((m) => m.sourceType === "Transfer" && m.quantity > 0)
  .map((m) => {
    const sourceWh = warehouses.find((w) => w._id === m.sourceWarehouse);
    const destWh = warehouses.find((w) => w._id === m.destinationWarehouse);
        
    const sourceVenueName = typeof sourceWh?.venueId === "object"
      ? (sourceWh.venueId as { name: string }).name
      : "";

    const destinationVenueName = typeof destWh?.venueId === "object"
      ? (destWh.venueId as { name: string }).name
      : "";

    return {
      id: m._id,
      type: m.type,
      sourceWarehouseName: sourceWh?.name || m.sourceWarehouse,
      destinationWarehouseName: destWh?.name || m.destinationWarehouse,
      referenceLabel: m.referenceLabel,
      referenceType: m.referenceType,
      reason: m.reason,
      quantity: m.quantity,
      sourceVenueName,
      destinationVenueName,
    };
  });

  const venues = Array.from(
  new Map(
    warehouses
      .filter((w) => w.venueId && typeof w.venueId === "object")
      .map((w) => {
        const venueObj = w.venueId as unknown as { _id: string; name: string };
        return [venueObj._id, venueObj];
      })
    ).values()
  );

  return (
    <Box sx={formContainer_v2}>
      <Paper sx={{ padding: "20px", marginBottom: "1px", width: "100%" }}>
        <Typography sx={formTitle}>Register Transfer Movement</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Source Venue"
              name="sourceVenue"
              value={formData.sourceVenue}
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
              {venues.map((v) => (
                <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Destination Venue"
              name="destinationVenue"
              value={formData.destinationVenue}
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
              {venues.map((v) => (
                <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={2}>


          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Source Warehouse"
              name="sourceWarehouse"
              value={formData.sourceWarehouse}
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
              {warehouses
                .filter((wh) => {
                  return typeof wh.venueId === "object" &&
                    wh.venueId !== null &&
                    (wh.venueId as { _id: string })._id === formData.sourceVenue;
                })
                .map((wh) => (
                  <MenuItem key={wh._id} value={wh._id}>{wh.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Destination Warehouse"
              name="destinationWarehouse"
              value={formData.destinationWarehouse}
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
              {warehouses
                .filter((wh) => {
                  return typeof wh.venueId === "object" &&
                    wh.venueId !== null &&
                    (wh.venueId as { _id: string })._id === formData.destinationVenue;
                })
                .map((wh) => (
                  <MenuItem key={wh._id} value={wh._id}>{wh.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <RadioGroup
              row
              name="referenceType"
              value={formData.referenceType}
              onChange={(e) => setFormData({ ...formData, referenceType: e.target.value as "Product" | "Kit", referenceId: "" })}
            >
              <FormControlLabel value="Product" control={<Radio />} label="Product" />
              <FormControlLabel value="Kit" control={<Radio />} label="Kit" />
            </RadioGroup>
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
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        ...inputField,
                        "& label": {
                          color: "#444444",
                        },
                        "& label.Mui-focused": {
                          color: "#47b2e4",
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
          </Grid>

          <Grid item xs={12} sm={4}>
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetForm}
            startIcon={<CancelIcon />}
            sx={cancelButton}
          >
            Clear
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ padding: "20px", marginTop: "20px", width: "100%" }}>
        <Typography variant="h6" sx={{ padding: "10px", color: "#333333", fontWeight: "bold" }}>
          Transfer Movement List
        </Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box sx={{ minWidth: '900px' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10, 20, 100]}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#304FFE",
                  color: "#FFF",
                  fontSize: "1rem",
                },
                "& .MuiDataGrid-cell": {
                  padding: "12px",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#F4F6F8",
                },
                "& .MuiButton-root": {
                  borderRadius: "6px",
                },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Box>

      </Paper>

    </Box>
  );
};

export default TransferInventory;

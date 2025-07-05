// InventoryMovementsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, Grid, MenuItem, Paper,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { createInventoryMovement, updateInventoryMovement, deleteInventoryMovement, fetchInventoryAdjustments } from "../../store/slices/inventoryMovementSlice";
import { fetchWarehouses } from "../../store/slices/warehouseSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchKits } from "../../store/slices/kitSlice";

import {
  formContainer,
  formTitle,
  inputField,
  submitButton,
  cancelButton,
  datagridStyle,
} from "../../styles/AdminStyles";
import Dialog from "../../components/Dialog"; // tu diálogo estandar


interface InventoryMovementRow {
  id: string;
  type: "adjustment", // 👈 forzado y no editable type: "entry" | "exit" | "transfer" | "adjustment" | "disassembly";
  warehouseId: string;
  referenceId: string;
  referenceType: "Product" | "Kit";
  quantity: number;
  reason: string;
  referenceLabel: string;
  sourceLabel: string;
}

interface PopulatedMovement {
  _id: string;
  type: string;
  warehouse: string;
  referenceId: { _id: string; name: string } | string;
  referenceType: "Product" | "Kit";
  quantity: number;
  reason: string;
  sourceType?: string;
  sourceId?: { _id: string; orderNumber?: string; invoiceNumber?: string } | string;
}

interface ItemOption {
  _id: string;
  name: string;
}

const InventoryMovements: React.FC = () => {
  const dispatch = useAppDispatch();
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const { movements , loading } = useAppSelector((state) => state.inventorymovements);
  const { products } = useAppSelector((state) => state.products);
  const { kits } = useAppSelector((state) => state.kits);

  const [formData, setFormData] = useState<{
    type: "adjustment", // 👈 forzado y no editable type: "entry" | "exit" | "transfer" | "adjustment" | "disassembly";
    warehouse: string;
    referenceId: string;
    referenceType: "Product" | "Kit"; // ✅ aquí está el fix
    quantity: number;
    reason: string;
    sourceType: "Adjustment"; // 👈 AÑADIR ESTO
  }>({
    type: "adjustment", //type: "entry",
    warehouse: "",
    referenceId: "",
    referenceType: "Product",
    quantity: 0,
    reason: "",
    sourceType: "Adjustment", // 👈 AÑADIR ESTO
  });
  

  //const [editing, setEditing] = useState(false); // por si luego agregas edición
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchInventoryAdjustments());
    dispatch(fetchProducts({ status: 'active' }));
    dispatch(fetchKits());
  }, [dispatch]);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  
  const handleConfirmUpdate = () => {
    if (editingId) {
      dispatch(updateInventoryMovement({ id: editingId, updateData: formData })).then(() => {
        dispatch(fetchInventoryAdjustments());
        resetForm();
      });
    }
    handleDialogClose();
  };
  

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedId(null);
  };
  
  const handleConfirmDelete = () => {
    if (selectedId) {
      dispatch(deleteInventoryMovement(selectedId)).then(() => {
        dispatch(fetchInventoryAdjustments());
      });
    }
    handleDeleteDialogClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updateInventoryMovement({ id: editingId, updateData: formData })).then(() => {
        resetForm();
        dispatch(fetchInventoryAdjustments());
      });
    } else {
      dispatch(createInventoryMovement(formData)).then(() => {
        resetForm();
        dispatch(fetchInventoryAdjustments());
      });
    }
  };

  const handleEdit = (row: InventoryMovementRow) => {
    setEditingId(row.id);
    setFormData({
      type: row.type,
      warehouse: row.warehouseId, // 👈 o asegúrate que venga el `_id`
      referenceId: row.referenceId,
      referenceType: row.referenceType,
      quantity: row.quantity,
      reason: row.reason,
      sourceType: "Adjustment", // 👈 necesario porque es parte del tipo
    });
  };


  const resetForm = () => {
    setFormData({
      type: "adjustment", // 👈 forzado y no editable type: "entry",
      warehouse: "",
      referenceId: "",
      referenceType: "Product",
      quantity: 0,
      reason: "",
      sourceType: "Adjustment", // 👈 AÑADIR ESTO
    });
    setEditingId('');
  };

  const rows = (movements as PopulatedMovement[]).map((m) => {
    const whName =
      typeof m.warehouse === "object" && m.warehouse !== null && "name" in m.warehouse
        ? (m.warehouse as { name: string }).name
        : warehouses.find((w) => w._id === m.warehouse)?.name || String(m.warehouse);


    const referenceLabel =
      typeof m.referenceId === "object" && m.referenceId !== null && "name" in m.referenceId
    ? (m.referenceId as { name: string }).name
    : String(m.referenceId);


    // const sourceLabel =
    //   typeof m.sourceId === "object" && m.sourceType === "PurchaseOrder" && m.sourceId?.orderNumber
    // ? `PO: ${m.sourceId.orderNumber}`
    // : typeof m.sourceId === "object" && m.sourceType === "SalesOrder" && m.sourceId?.invoiceNumber
    // ? `SO: ${m.sourceId.invoiceNumber}`
    // : "-";


    return {
      id: m._id,
      type: m.type,
      warehouseId: m.warehouse, // ✅ conservar el ID para edición
      warehouseName: whName,
      referenceId: typeof m.referenceId === "object" ? m.referenceId._id : m.referenceId,
      referenceType: m.referenceType,
      quantity: m.quantity,
      reason: m.reason,
      referenceLabel,
    };
  });

  const columns: GridColDef[] = [
  { field: "type", headerName: "Type", flex: 0.9, minWidth: 100 },
  { field: "warehouseName", headerName: "Warehouse", flex: 1.2, minWidth: 140 },
  { field: "referenceLabel", headerName: "Item", flex: 1.4, minWidth: 160 },
  { field: "referenceType", headerName: "Ref Type", flex: 0.9, minWidth: 120 },
  { field: "reason", headerName: "Reason", flex: 1.6, minWidth: 180 },
  { field: "quantity", headerName: "Qty", flex: 0.8, minWidth: 90 },
    // { field: "reason", headerName: "Reason", flex: 1.3 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar">
            <IconButton color="success" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => handleDeleteDialogOpen(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  const availableItems: ItemOption[] = (formData.referenceType === "Product"
    ? products
    : kits
  )?.map(({ _id, name }) => ({ _id, name }));

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: "20px", marginBottom: "1px", width: "100%" }}>
        <Typography sx={formTitle}>
          {editingId ? "Edit Movement" : "Register Inventory Movement"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Movement Type"
              name="type"
              fullWidth
              value={formData.type}
              onChange={handleChange}
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
              <MenuItem value="adjustment">Adjustment</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Warehouse"
              name="warehouse"
              fullWidth
              value={formData.warehouse}
              onChange={handleChange}
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
            <RadioGroup
              row
              name="referenceType"
              value={formData.referenceType}
              onChange={(e) => {
                const newType = e.target.value as "Product" | "Kit";
                setFormData((prev) => ({
                  ...prev,
                  referenceType: newType,
                  referenceId: "", // reinicia la selección
                }));
              }}
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
            getOptionKey={(option) => option._id} // opcional si usas MUI 5+
            value={availableItems.find((item) => item._id === formData.referenceId) || null}
            onChange={(_, newValue) => {
              setFormData((prev) => ({
                ...prev,
                referenceId: newValue?._id || "",
              }));
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
              fullWidth
              value={formData.quantity}
              onChange={handleChange}
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
              fullWidth
              value={formData.reason}
              onChange={handleChange}
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
            onClick={editingId ? handleDialogOpen : handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
            disabled={loading}
          >
            {editingId ? "Update" : "Save"}
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
      <Paper sx={{ padding: "20px", marginBottom: "1px", width: "100%" }}>
        <Typography variant="h6" sx={{ padding: "10px", color: "#333333", fontWeight: "bold" }}>
          Inventory Movement List
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 20, 100]} // 👈 agregamos 100
          sx={datagridStyle}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este movimiento de inventario?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        isOpen={isDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this movement?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmUpdate}
      />

    </Box>
  );
};

export default InventoryMovements;
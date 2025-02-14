import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchPurchaseOrders } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { useToastMessages } from "../../hooks/useToastMessage";

const PurchaseOrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseOrders, successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);

  const [filters, setFilters] = useState({
    orderNumber: "",
    provider: ""
  });

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProviders({ status: "active" }));
  }, [dispatch]);

  useToastMessages(successMessage, errorMessage);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this PO?")) {
        console.log(id)
      //dispatch(deletePurchaseOrder(id));
    }
  };

  const handleEdit = (orderNumber: string) => {
    navigate("/purchase-order", { state: { orderNumber } });
  };

  const filteredOrders = purchaseOrders.filter((po) =>
    (filters.orderNumber ? po.orderNumber?.includes(filters.orderNumber) : true) &&
    (filters.provider ? po.provider === filters.provider : true)
  );

  const columns: GridColDef[] = [
    { field: "orderNumber", headerName: "Order #", flex: 1 },
    { 
      field: "provider", 
      headerName: "Provider", 
      flex: 1, 
      valueGetter: (params) => {
        const providerId = params.value as string; // Asegurar que params.value es un string
        const provider = providers.find(p => p._id === providerId);
        return provider ? provider.name : "Unknown";
      }
    },
    { field: "createdAt", headerName: "Created At", flex: 1, valueGetter: (params) => new Date(params.value as string).toLocaleDateString() },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "createdBy", headerName: "Created By", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(params.row.orderNumber)}>
            Edit
          </Button>
          <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDelete(params.row._id)}>
            Delete
          </Button>
        </Box>
      )
    }
  ];
  

  return (
    <Box p={4}>
      <Typography variant="h4" sx={{ mb: 3 }}>Purchase Orders</Typography>
      
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Order Number"
          value={filters.orderNumber}
          onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
          fullWidth
        />
        <Select
          value={filters.provider}
          onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">All Providers</MenuItem>
          {providers.map((provider) => (
            <MenuItem key={provider._id} value={provider._id}>{provider.name}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={() => navigate("/purchase-order")}>
          + New PO
        </Button>
      </Box>

      <DataGrid
        rows={filteredOrders}
        columns={columns}
        pageSize={10}
        autoHeight
        getRowId={(row) => row._id}
      />
    </Box>
  );
};

export default PurchaseOrdersList;
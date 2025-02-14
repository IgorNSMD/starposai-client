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
        if (!params.value || typeof params.value !== "object") return "Unknown";
        return (params.value as { name: string }).name || "Unknown";
      }
    },
  
    { 
      field: "createdAt", 
      headerName: "Created At", 
      flex: 1, 
      valueGetter: (params) => {
        if (!params.value) return "Invalid Date";
        return new Date(params.value).toLocaleDateString();
      }
    },
  
    { 
      field: "status", 
      headerName: "Status", 
      flex: 1,
      cellClassName: (params) => {
        switch (params.value) {
          case "pending": return "status-pending";
          case "partial": return "status-partial";
          case "received": return "status-received";
          default: return "";
        }
      }
    },
  
    { 
      field: "createdBy", 
      headerName: "Created By", 
      flex: 1,
      valueGetter: (params) => {
        if (!params.value || typeof params.value !== "object") return "Unknown";
        return (params.value as { name: string }).name || "Unknown";
      }
    },
  
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={() => handleEdit(params.row.orderNumber)}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            sx={{ ml: 1 }} 
            onClick={() => handleDelete(params.row._id)}
          >
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
        getRowId={(row) => row._id}
        sx={{
            "& .status-pending": { color: "#FF9800", fontWeight: "bold" },
            "& .status-partial": { color: "#2196F3", fontWeight: "bold" },
            "& .status-received": { color: "#4CAF50", fontWeight: "bold" },
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#304FFE", color: "#FFF" },
            "& .MuiDataGrid-cell": { padding: "10px" },
            "& .MuiDataGrid-row:nth-of-type(odd)": { backgroundColor: "#F4F6F8" },
            "& .MuiButton-root": { borderRadius: "6px" }
        }}
        />
🔹 🚀 Resul
    </Box>
  );
};

export default PurchaseOrdersList;
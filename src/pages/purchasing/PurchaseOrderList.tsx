import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchPurchaseOrders, changePurchaseOrderStatus } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { useToastMessages } from "../../hooks/useToastMessage";
  

const PurchaseOrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { purchaseOrders, successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);

  const [filters, setFilters] = useState({
    orderNumber: "",
    provider: "",
    status: ""
  });

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProviders({ status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    console.log("📌 Datos de las órdenes de compra:", purchaseOrders);
}, [purchaseOrders]);

  useToastMessages(successMessage, errorMessage);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this PO?")) {
        dispatch(changePurchaseOrderStatus({ id, status: "inactive" }));
    }
  };

  const handleEdit = (orderNumber: string) => {
    navigate("/purchase-order", { state: { orderNumber } });
  };

  const filteredOrders = purchaseOrders.filter((po) =>
    (filters.orderNumber ? po.orderNumber?.includes(filters.orderNumber) : true) &&
    (filters.provider ? po.provider === filters.provider : true) &&
    (filters.status ? po.status === filters.status : true)
  );

  console.log("📌 filteredOrders:", filteredOrders);

  const rows = filteredOrders.map((po) => ({
    id: po._id,
    orderNumber: po.orderNumber || "N/A",
    provider:
            typeof po.provider === "object" && po.provider !== null
                ? (po.provider as { name: string }).name
                : "Unknown",
    createdBy:
             typeof po.createdBy === "object" && po.createdBy !== null
                ? (po.createdBy as { name: string }).name
                : "Unknown",
    createdAt: po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "Invalid Date",
    status: po.status,
  }));



  const columns: GridColDef[] = [
    { field: "orderNumber", headerName: "Order #", flex: 1 },
    { field: "provider", headerName: "Provider", flex: 1 }, // 🔹 Ahora contiene solo el nombre
    { field: "createdBy", headerName: "Created By", flex: 1 }, // 🔹 Ahora contiene solo el nombre
    { field: "createdAt", headerName: "Created At", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Typography color={params.value === "pending" ? "orange" : "black"}>
          {params.value}
        </Typography>
      ),
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
            onClick={() => handleDelete(params.row.id)}
          >
            Deactivate
          </Button>
        </Box>
      ),
    },
  ];
  

  
  
  

  return (
    <Box p={4} sx={{ maxWidth: "100%", overflowX: "auto" }}>
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
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="partial">Partial</MenuItem>
          <MenuItem value="received">Received</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={() => navigate("/purchase-order")}>
          + New PO
        </Button>
      </Box>

      <DataGrid
        rows={rows} // Debes pasar rows, no filteredOrders
        columns={columns}
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
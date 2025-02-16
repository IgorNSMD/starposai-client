import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Select, MenuItem, Typography, IconButton, FormControl, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Add, Download } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ExcelJS, { Row, Cell } from 'exceljs';
import { saveAs } from 'file-saver';

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchPurchaseOrders, changePurchaseOrderStatus } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { useToastMessages } from "../../hooks/useToastMessage";
import CustomDialog from "../../components/Dialog";


  

const PurchaseOrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { purchaseOrders, successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);

  const [filters, setFilters] = useState({
    orderNumber: "",
    provider: "",
    status: ""
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPurchaseOrders());
    dispatch(fetchProviders({ status: "active" }));
  }, [dispatch]);

//   useEffect(() => {
//     console.log("📌 Datos de las órdenes de compra:", purchaseOrders);
// }, [purchaseOrders]);

  useToastMessages(successMessage, errorMessage);

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedOrderId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedOrderId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedOrderId) {
      dispatch(changePurchaseOrderStatus({ id: selectedOrderId, status: "inactive" }))
          .unwrap()
          .then(() => {
            console.log('Estado cambiado a inactive con éxito');
            dispatch(fetchPurchaseOrders());
          })
          .catch((error) => {
            console.error('Error al cambiar el estado del producto:', error);
          });
    }
    handleDeleteDialogClose();
  };


  const handleEdit = (orderNumber: string) => {
    navigate("/admin/purchasing/po", { state: { orderNumber } });
  };


  const handleExportToExcel = async () => {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchase Orders');

    // Definir columnas y encabezados con estilos
    worksheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 15 },
      { header: 'Provider', key: 'provider', width: 20 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    // Aplicar estilos a los encabezados
    worksheet.getRow(1).eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco y negrita
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Azul de fondo
      };
    });

    // Agregar datos desde `rows`
    rows.forEach((row) => {
      worksheet.addRow({
        orderNumber: row.orderNumber,
        provider: row.provider || 'Unknown',
        createdBy: row.createdBy || 'Unknown',
        createdAt: row.createdAt || 'N/A',
        status: row.status,
      });
    });

    // Aplicar bordes y estilos a las celdas de datos
    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (rowNumber !== 1) { // Excluir los encabezados
        row.eachCell((cell: Cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    // Generar archivo Excel y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'purchase_orders.xlsx');
  };


  const filteredOrders = purchaseOrders.filter((po) =>
    (filters.orderNumber ? po.orderNumber?.includes(filters.orderNumber) : true) &&
    (filters.provider
    ? typeof po.provider === "object" && po.provider !== null
      ? (po.provider as { _id: string })._id === filters.provider
      : po.provider === filters.provider
    : true)  &&
    (filters.status ? po.status === filters.status : true)
  );

  //console.log("📌 filteredOrders:", filteredOrders);

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
    { field: "createdAt", headerName: "Created At", flex: 1, 
      headerAlign: "center",
      align: "center"  },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color:
              params.value === "pending"
                ? "orange"
                : params.value === "partial"
                ? "blue"
                : params.value === "received"
                ? "green"
                : "gray",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.orderNumber)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteDialogOpen(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
    
  ];
  
  
  

  return (
     <Box p={2} sx={{ width: "100%", overflowX: "auto" }}>
      <Typography 
        variant="h4" 
        sx={{ mt: 3, mb: 3, textAlign: isSmallScreen ? "center" : "left" }}
      >Purchase Orders
      </Typography>
      
      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: 2, mb: 3 }}>
        <TextField
          label="Order Number"
          value={filters.orderNumber}
          onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          {/* <InputLabel>All Providers</InputLabel> */}
          <Select
            value={filters.provider}
            onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
            displayEmpty
            fullWidth
              sx={{
                color: "#333", // Asegura que el texto siempre sea oscuro
                "& .MuiSelect-select": {
                  color: filters.provider ? "#333" : "#888", // Diferencia el color cuando está vacío
                },
                "& .MuiInputLabel-root": {
                  color: "#555 !important", // Evita que el label se vea borroso
                },
            }}
          >
            <MenuItem value="">All Providers</MenuItem>
            {providers.map((provider) => (
              <MenuItem key={provider._id} value={provider._id}>{provider.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          {/* <InputLabel>All Status</InputLabel> */}
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="received">Received</MenuItem>
            {/* <MenuItem value="inactive">Inactive</MenuItem> */}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: isSmallScreen ? "center" : "flex-start" }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={handleExportToExcel}
            sx={{ height: "100%" }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate("/admin/purchasing/po")}
            sx={{ height: "100%" }}
          >
            New PO
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: "900px" }}> {/* 🔹 Asegura que la tabla tenga un tamaño mínimo */}
          <DataGrid
            rows={rows} // Debes pasar rows, no filteredOrders
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}        
            sx={{
                "& .status-pending": { color: "#FF9800", fontWeight: "bold" },
                "& .status-partial": { color: "#2196F3", fontWeight: "bold" },
                "& .status-received": { color: "#4CAF50", fontWeight: "bold" },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#304FFE", color: "#FFF",  fontSize: "1rem", },
                "& .MuiDataGrid-cell": { padding: "12px", fontSize: "0.9rem", display: "flex", alignItems: "center", },
                "& .MuiDataGrid-row:nth-of-type(odd)": { backgroundColor: "#F4F6F8" },
                "& .MuiButton-root": { borderRadius: "6px" },
                "& .status-cell": {
                  textAlign: "center",
                  //minWidth: 600,
                  minWidth: "900px", // 🔹 Asegura un ancho mínimo
                },
                
            }}
            />  
        </Box>
      </Box>

      <CustomDialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this purchase order?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        />
🔹 🚀 Resul
    </Box>
  );
};

export default PurchaseOrdersList;
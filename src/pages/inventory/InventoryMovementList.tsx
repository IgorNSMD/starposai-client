import React, { useEffect, useState } from "react";
import { Box, Button, Typography, IconButton,useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { Download } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ExcelJS, { Cell } from "exceljs";
import { saveAs } from "file-saver";

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { fetchInventoryMovements, deleteInventoryMovement } from "../../store/slices/inventoryMovementSlice";
import { fetchWarehouses } from "../../store/slices/warehouseSlice";
import { useToastMessages } from "../../hooks/useToastMessage";
import CustomDialog from "../../components/Dialog";

const InventoryMovementsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { movements, successMessage, errorMessage } = useAppSelector((state) => state.inventorymovements);
  //const { warehouses } = useAppSelector((state) => state.warehouses);

//   const [filters, setFilters] = useState({
//     movementType: "",
//     warehouse: "",
//     status: ""
//   });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInventoryMovements());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  useToastMessages(successMessage, errorMessage);

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedMovementId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedMovementId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedMovementId) {
      dispatch(deleteInventoryMovement(selectedMovementId))
        .unwrap()
        .then(() => dispatch(fetchInventoryMovements()));
    }
    handleDeleteDialogClose();
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventory Movements");
    worksheet.columns = [
      { header: "Type", key: "type", width: 15 },
      { header: "Warehouse", key: "warehouse", width: 20 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    worksheet.getRow(1).eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };
    });

    movements.forEach((row) => {
      worksheet.addRow({
        type: row.type,
        //warehouse: row.warehouse?.name || "Unknown",
        quantity: row.quantity,
        status: row.status,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "inventory_movements.xlsx");
  };

  const rows = movements.map((movement) => ({
    id: movement._id,
    type: movement.type,
    //warehouse: movement.warehouse?.name || "Unknown",
    quantity: movement.quantity,
    status: movement.status,
  }));

  const columns: GridColDef[] = [
    { field: "type", headerName: "Type", flex: 1 },
    { field: "warehouse", headerName: "Warehouse", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton color="error" size="small" onClick={() => handleDeleteDialogOpen(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box p={2} sx={{ width: "100%", overflowX: "auto" }}>
      <Typography variant="h4" sx={{ mt: 3, mb: 3, textAlign: isSmallScreen ? "center" : "left" }}>Inventory Movements</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Button variant="contained" color="success" startIcon={<Download />} onClick={handleExportToExcel}>
          Export
        </Button>
      </Box>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: "900px" }}>
          <DataGrid 
            rows={rows} 
            columns={columns} 
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
        message="Are you sure you want to delete this inventory movement?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default InventoryMovementsList;
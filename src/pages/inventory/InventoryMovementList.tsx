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
import { selectActiveCompanyVenue } from '../../store/slices/authSlice';

import { useToastMessages } from "../../hooks/useToastMessage";
import CustomDialog from "../../components/Dialog";

interface InventoryMovementItem {
  _id: string;
  type: string;
  warehouse: { _id: string; name: string } | string;
  referenceId: { _id: string; name: string } | string;
  quantity: number;
  reason?: string;
  sourceType: string;
  status?: string;
}


const InventoryMovementsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { movements, successMessage, errorMessage } = useAppSelector((state) => state.inventorymovements);
  const { activeCompanyId, activeVenueId } = useAppSelector(selectActiveCompanyVenue);  

  //const { warehouses } = useAppSelector((state) => state.warehouses);

//   const [filters, setFilters] = useState({
//     movementType: "",
//     warehouse: "",
//     status: ""
//   });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null);

  useEffect(() => {
    if (activeCompanyId) {
      dispatch(fetchInventoryMovements());
      dispatch(fetchWarehouses());
    }
  }, [dispatch, activeCompanyId, activeVenueId]);

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
    { header: "Reference", key: "reference", width: 25 },
    { header: "Warehouse", key: "warehouse", width: 25 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Reason", key: "reason", width: 30 },
    { header: "Source", key: "source", width: 20 },
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

  movements.forEach((m) => {
    const referenceLabel =
      typeof m.referenceId === "object" && m.referenceId !== null && "name" in m.referenceId
        ? (m.referenceId as { name: string }).name
        : String(m.referenceId);

    const warehouseLabel =
      typeof m.warehouse === "object" && m.warehouse !== null && "name" in m.warehouse
        ? (m.warehouse as { name: string }).name
        : String(m.warehouse);

    worksheet.addRow({
      type: m.type,
      reference: referenceLabel,
      warehouse: warehouseLabel,
      quantity: m.quantity,
      reason: m.reason || "",
      source: m.sourceType || "",
      status: m.status || "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "inventory_movements.xlsx");
};


  const rows = (movements as InventoryMovementItem[]).map((m) => {
    const referenceLabel =
      typeof m.referenceId === "object" && m.referenceId?.name
        ? m.referenceId.name
        : String(m.referenceId);

    const warehouseName =
      typeof m.warehouse === "object" && m.warehouse?.name
        ? m.warehouse.name
        : String(m.warehouse);

    return {
      id: m._id,
      type: m.type,
      referenceLabel,
      warehouseName,
      quantity: m.quantity,
      reason: m.reason || "-",
      sourceType: m.sourceType,
      status: m.status,
    };
  });


  const columns: GridColDef[] = [
  { field: "type", headerName: "Type", flex: 1 },
  { field: "referenceLabel", headerName: "Reference", flex: 1.5 },
  { field: "warehouseName", headerName: "Warehouse", flex: 1.5 },
  { field: "quantity", headerName: "Quantity", flex: 1 },
  { field: "reason", headerName: "Reason", flex: 1.5 },
  { field: "sourceType", headerName: "Source", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 },
  {
    field: "actions",
    headerName: "Actions",
    flex: 0.5,
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

      <Box 
          sx={{
            width: '100%',
            overflowX: 'auto', // 🔹 Permite scroll horizontal
          }}
        >  {/* Establece una altura fija */}
        <Box
          sx={{
            minWidth: '900px', // 🔹 Hace que se necesite scroll en móviles
            height: 500,
          }}
        >
          <DataGrid 
            rows={rows} 
            columns={columns} 
            pageSizeOptions={[25, 50, 100]} 
            sx={{
              "& .status-pending": { color: "#FF9800", fontWeight: "bold" },
              "& .status-partial": { color: "#2196F3", fontWeight: "bold" },
              "& .status-received": { color: "#4CAF50", fontWeight: "bold" },
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
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  useMediaQuery,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/CheckCircle";
import TableSortLabel from "@mui/material/TableSortLabel";

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import {
  fetchInventoryReviewStock,
  createInventoryMovement,
  InventoryReviewItem,
} from "../../store/slices/inventoryMovementSlice";
import { useToastMessages } from "../../hooks/useToastMessage";

interface InventoryRow {
  id: string;
  referenceId: string;
  referenceType: string;
  productName: string;
  warehouseName: string;
  warehouseId: string;
  currentQuantity: number;
  revisedQuantity: number;
  difference: number;
}

const InventoryReviewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { reviewStock, successMessage, errorMessage } = useAppSelector(
    (state) => state.inventorymovements
  );

  const [revisedQuantities, setRevisedQuantities] = useState<{ [key: string]: number }>({});
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [orderBy, setOrderBy] = useState<keyof InventoryRow>('productName');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');


  const uniqueWarehouses = useMemo(() => {
    const seen = new Set<string>();
    return reviewStock
      .filter((item) => {
        if (!item.warehouseId || seen.has(item.warehouseId)) return false;
        seen.add(item.warehouseId);
        return true;
      })
      .map((item) => ({
        id: item.warehouseId,
        name: item.warehouseName,
      }));
  }, [reviewStock]);

  useEffect(() => {
    dispatch(fetchInventoryReviewStock());
  }, [dispatch]);

  useToastMessages(successMessage, errorMessage);

  useEffect(() => {
    if (reviewStock.length === 0) return;
    setRevisedQuantities((prev) => {
      const updated = { ...prev };
      reviewStock.forEach((item) => {
        const key = item.referenceId + "_" + item.warehouseId;
        if (!(key in prev)) {
          updated[key] = item.currentQuantity;
        }
      });
      return updated;
    });
  }, [reviewStock]);

  const handleSort = (column: keyof InventoryRow) => {
    const isAsc = orderBy === column && orderDirection === 'asc';
    setOrderBy(column);
    setOrderDirection(isAsc ? 'desc' : 'asc');
  };

  const handleChange = (id: string, value: string) => {
    const parsed = parseFloat(value);
    setRevisedQuantities((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleAdjustment = async (row: InventoryReviewItem) => {
    const revisedQty = revisedQuantities[row.id];
    const difference = revisedQty - row.currentQuantity;
    if (difference === 0) return;

    await dispatch(
      createInventoryMovement({
        referenceId: row.referenceId,
        referenceType: row.referenceType,
        warehouse: row.warehouseId,
        quantity: difference,
        type: "adjustment",
        sourceType: "Adjustment",
        reason: "ajuste por revisión",
        status: "validated",
        date: new Date().toISOString(),
        createdBy: userInfo?.id || "",
        sourceWarehouse: row.warehouseId,
        destinationWarehouse: row.warehouseId,
      })
    );

    await dispatch(fetchInventoryReviewStock());
  };

  const rows: InventoryRow[] = useMemo(() => {
    return reviewStock
      .filter((item) =>
        selectedWarehouse ? item.warehouseId === selectedWarehouse : true
      )
      .map((item) => {
        const key = item.referenceId + "_" + item.warehouseId;
        const revised = revisedQuantities[key] ?? item.currentQuantity;
        const diff = revised - item.currentQuantity;
        return {
          id: key,
          referenceId: item.referenceId,
          referenceType: item.referenceType,
          productName: item.productName,
          warehouseName: item.warehouseName,
          warehouseId: item.warehouseId,
          currentQuantity: item.currentQuantity,
          revisedQuantity: revised,
          difference: diff,
        };
      });
  }, [reviewStock, revisedQuantities, selectedWarehouse]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return orderDirection === 'asc' ? valA - valB : valB - valA;
      }

      return orderDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [rows, orderBy, orderDirection]);

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Box p={2}>
      <Typography variant="h4" sx={{ mt: 3, mb: 3, textAlign: isSmallScreen ? "center" : "left" }}>
        Revisión de Inventario
      </Typography>
      <Box sx={{ mb: 2, maxWidth: 300 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Filtrar por almacén"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
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
          <MenuItem value="">Todos los almacenes</MenuItem>
          {uniqueWarehouses.map((wh) => (
            <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{
          width: "100%",
          overflowX: "auto", // scroll horizontal
          maxHeight: { xs: 400, md: 500 }, // altura adaptable
          mt: 2
        }}
        >
        <Table stickyHeader sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#304FFE" }}>
              <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                <TableSortLabel
                  active={orderBy === 'productName'}
                  direction={orderBy === 'productName' ? orderDirection : 'asc'}
                  onClick={() => handleSort('productName')}
                  sx={{
                    color: '#FFF',
                    '&.Mui-active': { color: '#FFF' }, // 👈 color blanco cuando está activo
                    '& .MuiSvgIcon-root': { color: '#FFF' }, // ícono blanco también
                  }}
                >
                  Producto
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#FFF", fontWeight: "bold" }}>
                <TableSortLabel
                  active={orderBy === 'warehouseName'}
                  direction={orderBy === 'warehouseName' ? orderDirection : 'asc'}
                  onClick={() => handleSort('warehouseName')}
                  sx={{
                    color: '#FFF',
                    '&.Mui-active': { color: '#FFF' }, // 👈 color blanco cuando está activo
                    '& .MuiSvgIcon-root': { color: '#FFF' }, // ícono blanco también
                  }}
                >
                  Almacén
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#FFF", fontWeight: "bold" }} align="right">
                <TableSortLabel
                  active={orderBy === 'currentQuantity'}
                  direction={orderBy === 'currentQuantity' ? orderDirection : 'asc'}
                  onClick={() => handleSort('currentQuantity')}
                  sx={{
                    color: '#FFF',
                    '&.Mui-active': { color: '#FFF' }, // 👈 color blanco cuando está activo
                    '& .MuiSvgIcon-root': { color: '#FFF' }, // ícono blanco también
                  }}
                >
                  Cantidad actual
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#FFF", fontWeight: "bold" }} align="right">
                <TableSortLabel
                  active={orderBy === 'revisedQuantity'}
                  direction={orderBy === 'revisedQuantity' ? orderDirection : 'asc'}
                  onClick={() => handleSort('revisedQuantity')}
                  sx={{
                    color: '#FFF',
                    '&.Mui-active': { color: '#FFF' }, // 👈 color blanco cuando está activo
                    '& .MuiSvgIcon-root': { color: '#FFF' }, // ícono blanco también
                  }}
                >
                  Cantidad revisada
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#FFF", fontWeight: "bold" }} align="right">
                <TableSortLabel
                  active={orderBy === 'difference'}
                  direction={orderBy === 'difference' ? orderDirection : 'asc'}
                  onClick={() => handleSort('difference')}
                  sx={{
                    color: '#FFF',
                    '&.Mui-active': { color: '#FFF' }, // 👈 color blanco cuando está activo
                    '& .MuiSvgIcon-root': { color: '#FFF' }, // ícono blanco también
                  }}
                >
                  Diferencia
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#FFF", fontWeight: "bold" }} align="center">
                Acción
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.warehouseName}</TableCell>
                <TableCell align="right">{row.currentQuantity}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    size="small"
                    value={revisedQuantities[row.id] ?? row.currentQuantity}
                    onChange={(e) => handleChange(row.id, e.target.value)}
                    inputProps={{ min: 0, style: { textAlign: "right" } }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", color: row.difference > 0 ? '#388E3C' : row.difference < 0 ? '#D32F2F' : 'inherit' }}>
                  {row.difference > 0 ? "+" : ""}{row.difference}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      if (row.referenceType === "Product" || row.referenceType === "Kit") {
                        handleAdjustment(row as InventoryReviewItem);
                      }
                    }}
                    disabled={row.difference === 0}
                  >
                    <CheckIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default InventoryReviewPage;
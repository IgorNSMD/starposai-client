import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useMediaQuery } from "@mui/material";

import { useAppSelector } from "../../../store/redux/hooks";
import type { Sale } from "../../../store/slices/saleSlice";
import { useCallback, useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRoom: string;
  setSelectedRoom: (roomId: string) => void;
  selectedTable: string;
  setSelectedTable: (tableId: string) => void;
  setSelectedStaff: (staffId: string) => void;
  sales: Sale[];
  setDrawerSale: (sale: Sale) => void;
}

const FullScreenRoomMap = ({
  open,
  onClose,
  selectedRoom,
  setSelectedRoom,
  selectedTable,
  setSelectedTable,
  setSelectedStaff,
  sales,
  setDrawerSale,
}: Props) => {

  const scale = useMediaQuery('(max-width:600px)') ? 30 : 40;

  const rooms = useAppSelector((state) => state.rooms.rooms);
  const tables = useAppSelector((state) => state.tables.tables);
  const { reservations } = useAppSelector((state) => state.reservations);

  const RESERVATION_WARNING_MINUTES = 60;

  const getReservedTableIds = useCallback((): string[] => {
    const now = new Date();
    return reservations
      .filter((res) => {
        if (res.status !== "confirmed") return false;
        const resTime = new Date(res.reservationTime).getTime();
        const diffMs = resTime - now.getTime();
        return diffMs >= 0 && diffMs <= RESERVATION_WARNING_MINUTES * 60000;
      })
      .map((res) =>
        typeof res.tableId === "object" && res.tableId !== null && "_id" in res.tableId
          ? res.tableId._id
          : res.tableId
      );
  }, [reservations]);

  const [reservedTableIds, setReservedTableIds] = useState<string[]>([]);

  // ⏱️ Actualización automática cada 30 segundos (puedes dejarlo en 60_000 para producción)
  useEffect(() => {
    setReservedTableIds(getReservedTableIds());

    const interval = setInterval(() => {
      setReservedTableIds(getReservedTableIds());
    }, 30000);

    return () => clearInterval(interval);
  }, [getReservedTableIds]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 1, sm: 2 } }}>
          Mapa del Salón
        </Typography>

        <TextField
          select
          label="Seleccionar Salón"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          size="small"
          slotProps={{
            inputLabel: {
              shrink: true,
              sx: {
                color: '#444444',
                '&.Mui-focused': {
                  color: '#47b2e4',
                },
              },
            },
          }}
        >
          {rooms.map((room) => (
            <MenuItem key={room._id} value={room._id}>
              {room.name}
            </MenuItem>
          ))}
        </TextField>

        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            border: "1px dashed #ccc",
            position: "relative",
            width: "100%",
            height: { xs: "60vh", sm: "70vh", md: "80vh" }, // responsive height
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            overflow: "auto",
            mb: 2,
          }}
        >
          {tables.map((table) => (
            <Box
              key={table._id}
              sx={{
                position: "absolute",
                left: table.position.x * scale,
                top: table.position.y * scale,
                width: scale + 24,
                height: scale + 24,
                border: selectedTable === table._id ? "2px solid #fff" : "none",
                bgcolor: (() => {
                  const isSelected = selectedTable === table._id;
                  if (reservedTableIds.includes(table._id)) return "#f0c000"; // amarillo
                  if (table.status === "occupied") return "error.main";
                  if (table.status === "reserved") return "warning.main";
                  if (isSelected) return "success.main";
                  return "primary.main";
                })(),
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: table.shape === "Circle" ? "50%" : "8px",
                fontSize: 14,
                fontWeight: "bold",
                boxShadow: 1,
                cursor:
                  table.status === "occupied" || table.status === "available"
                    ? "pointer"
                    : "default",
                "&:hover": {
                  boxShadow: 4,
                },
              }}
              onClick={() => {
                if (!selectedRoom) return;

                if (table.status === "occupied") {
                  const sale = sales.find(
                    (s) =>
                      s.status === "in_progress" &&
                      s.tableId !== null &&
                      (
                        typeof s.tableId === "object" && "_id" in s.tableId
                          ? (s.tableId as { _id: string })._id === table._id
                          : s.tableId === table._id
                      )
                  );
                  if (sale) {
                    setDrawerSale(sale);
                    setSelectedTable(typeof sale.tableId === "object" ? sale.tableId._id : sale.tableId as string);
                    setSelectedStaff(typeof sale.staffId === "object" ? sale.staffId._id : sale.staffId as string);
                  }
                } else {
                  setSelectedTable(table._id);
                }

                onClose();
              }}
            >
              {table.name}
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenRoomMap;

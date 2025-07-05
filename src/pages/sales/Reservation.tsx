import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Chip 
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import {
  createReservation,
  deleteReservation,
  fetchReservations,
  updateReservation,
  updateReservationStatus,
} from "../../store/slices/reservationSlice";
import { fetchTablesByRoom } from "../../store/slices/tableSlice";
import { fetchRooms, } from '../../store/slices/roomSlice';
import { cancelButton, datagridStyle, formContainer_v2, formTitle, inputField, submitButton } from "../../styles/AdminStyles";

import { toLocalDateTimeInput } from '../../utils/dateUtils';
import { extractId } from '../../utils/idUtils';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura


const Reservation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reservations } = useAppSelector((state) => state.reservations);
  const { tables } = useAppSelector((state) => state.tables);
  const { rooms } = useAppSelector((state) => state.rooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState<{ id: string; status: "confirmed" | "cancelled" } | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    contactInfo: "",
    tableId: "",
    roomId: "",
    numberOfPeople: 1,
    reservationTime: "",
  });

  useEffect(() => {
    dispatch(fetchReservations());
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (rooms.length === 1) {
      const defaultRoom = rooms[0];
      setSelectedRoomId(defaultRoom._id);
      dispatch(fetchTablesByRoom(defaultRoom._id));
    }
  }, [rooms, dispatch]);

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setSelectedId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      dispatch(deleteReservation(selectedId)).then(() => {
        dispatch(fetchReservations());
      });
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleStatusDialogOpen = (id: string, status: "confirmed" | "cancelled") => {
    setStatusChangeInfo({ id, status });
    setIsStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusChangeInfo(null);
    setIsStatusDialogOpen(false);
  };

  const handleConfirmStatusChange = () => {
    if (statusChangeInfo) {
      dispatch(updateReservationStatus(statusChangeInfo)).then(() => {
        dispatch(fetchReservations());
      });
    }
    handleStatusDialogClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.tableId || !formData.reservationTime) return;
  
    const payload = {
      ...formData,
      roomId: selectedRoomId, // asegúrate que esté bien asignado
    };
  
    if (editingId) {
      // Modo edición
      dispatch(updateReservation({ id: editingId, data: payload })).then(() => {
        dispatch(fetchReservations());
        resetForm();
      });
    } else {
      // Modo creación
      dispatch(createReservation(payload)).then(() => {
        dispatch(fetchReservations());
        resetForm();
      });
    }
  };
  
  
  const handleEdit = (id: string) => {
    const res = reservations.find((r) => r._id === id);
    if (!res) return;
  
    const roomId = extractId(res.roomId);
    const tableId = extractId(res.tableId);

    setEditingId(id);
    setSelectedRoomId(roomId);
  
    // 1. Primero actualizas room
    dispatch(fetchTablesByRoom(roomId)).then(() => {
      setFormData({
        customerName: res.customerName,
        contactInfo: res.contactInfo,
        roomId,
        tableId,
        numberOfPeople: res.numberOfPeople,
        reservationTime: toLocalDateTimeInput(res.reservationTime),
      });
    });

  };
  



  const resetForm = () => {
    setFormData({
      customerName: "",
      contactInfo: "",
      tableId: "",
      roomId: "",
      numberOfPeople: 1,
      reservationTime: "",
    });
    setEditingId(null); // salimos del modo edición
  };
  

  const rows = reservations
  .filter((res) => new Date(res.reservationTime) >= new Date()) // Solo reservas futuras
  .map((res) => {
    const tableName = typeof res.tableId === 'object' && res.tableId?.name
      ? res.tableId.name
      : "N/A";

    return {
      id: res._id,
      customer: res.customerName,
      contact: res.contactInfo,
      tableName,
      numberOfPeople: res.numberOfPeople,
      reservationTime: new Date(res.reservationTime).toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      status: res.status,
    };
  });

  const columns: GridColDef[] = [
    { field: "customer", headerName: "Customer", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
    { field: "tableName", headerName: "Table", flex: 0.6 },
    { field: "numberOfPeople", headerName: "N°", flex: 0.6},
    { field: "reservationTime", headerName: "Time", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => {
        const status = params.value;
        let color: "default" | "success" | "error" | "warning" = "default";
  
        switch (status) {
          case "confirmed":
            color = "success";
            break;
          case "cancelled":
            color = "error";
            break;
          case "pending":
          default:
            color = "warning";
            break;
        }
  
        return (
          <Chip
            label={status}
            color={color}
            size="small"
            sx={{
              color: "#fff", // fuerza texto blanco
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.2,
      renderCell: (params) => (
        <>

          <Tooltip title="Editar">
            <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Confirmar">
            <IconButton color="success" onClick={() => handleStatusDialogOpen(params.row.id, 'confirmed')}>
              <DoneIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancelar">
            <IconButton color="warning" onClick={() => handleStatusDialogOpen(params.row.id, 'cancelled')}>
              <CloseIcon />
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

  return (
    <Box sx={formContainer_v2}>
      <Paper 
        sx={{ 
          padding: '20px',
          marginBottom: '16px',
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          boxShadow: 2,
          borderRadius: 2, 
        }}
      >
        <Typography sx={formTitle}>
          {editingId ? "Edit Reservation" : "Add Reservation"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Customner Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              sx={inputField}
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
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Contact"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              sx={inputField}
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
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Room"
              name="roomId"
              value={selectedRoomId}
              onChange={(e) => {
                const newRoomId = e.target.value;
                setSelectedRoomId(newRoomId);
                dispatch(fetchTablesByRoom(newRoomId));
                setFormData((prev) => ({ 
                  ...prev, 
                  roomId: newRoomId, // 🟢 Agrega esta línea
                  tableId: "" 
                })); // reset mesa
                dispatch(fetchTablesByRoom(newRoomId));
              }}
              fullWidth
              sx={inputField}
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
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Table"
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              sx={inputField}
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
              {tables.map((table) => (
                <MenuItem key={table._id} value={table._id}>
                  {table.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="N° People"
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleChange}
              sx={inputField}
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
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Datetime"
              type="datetime-local"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleChange}
              sx={inputField}
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
            />
          </Grid>
          <Box display="flex" gap={2} margin ="16px" >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              sx={submitButton}
            >
              {editingId ? "Update" : "Save"}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetForm}
                startIcon={<CancelIcon />}
                sx={cancelButton}
              >
                Cancel
              </Button>
            )}            
          </Box>

        </Grid>
      </Paper>

      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography 
          variant="h6" 
          sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}
        >
          List of Reservations
        </Typography>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
           <Box sx={{ minWidth: '700px' }}> {/* Puedes ajustar esto si necesitas más espacio */}
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10]}
              sx={datagridStyle}
              disableRowSelectionOnClick
            />
          </Box>    
        </Box>

        
      </Paper>

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this reservation?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        isOpen={isStatusDialogOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to mark this reservation as "${statusChangeInfo?.status}"?`}
        onClose={handleStatusDialogClose}
        onConfirm={handleConfirmStatusChange}
      />
    </Box>
  );
};

export default Reservation;

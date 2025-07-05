import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import {
  createTable,
  updateTable,
  deleteTable,
  fetchTablesByRoom,
} from "../../store/slices/tableSlice";
import { fetchParametersByCategory } from '../../store/slices/parameterSlice';

import { fetchRooms } from "../../store/slices/roomSlice";
import { Table } from "../../types/types";
import { cancelButton, datagridStyle, formContainer, formTitle, inputField, submitButton } from "../../styles/AdminStyles";
import Dialog from '../../components/Dialog';


const Tables: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tables } = useAppSelector((state) => state.tables);
  const { rooms } = useAppSelector((state) => state.rooms);
  const shapes = useAppSelector((state) => state.parameters.parametersByCategory["Shape"] || []);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Table, "_id" | "companyId" | "venueId">>({
    name: "",
    x: 0,
    y: 0,
    status: "available",
    roomId: "",
    shape: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchParametersByCategory("Shape"));
  }, [dispatch]);

  useEffect(() => {
    if (formData.roomId) {
      dispatch(fetchTablesByRoom(formData.roomId));
    }
  }, [dispatch, formData.roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "x" || name === "y" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.roomId) return;

    if (editingId) {
      dispatch(updateTable({ id: editingId, data: formData })).then(() => {
        dispatch(fetchTablesByRoom(formData.roomId));
        setEditingId(null);
        resetForm();
      });
    } else {
      dispatch(createTable({
        name: formData.name,
        number: 1, // o alguna lógica si quieres que sea dinámico
        position: { x: formData.x, y: formData.y },
        roomId: formData.roomId,
        shape: formData.shape,
      })).then(() => {
        dispatch(fetchTablesByRoom(formData.roomId));
        resetForm();
      });
    }
  };

  const handleEdit = (row: {
    id: string;
    name: string;
    x: number;
    y: number;
    status: "available" | "occupied" | "reserved";
    roomId: string;
    shape: string;
  }) => {
    setEditingId(row.id);
    setFormData({
      name: row.name,
      x: row.x,
      y: row.y,
      status: row.status,
      roomId: row.roomId,
      shape: row.shape,
    });
  };

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
      dispatch(deleteTable(selectedId));
    }
    handleDeleteDialogClose();
  };

//   const handleDelete = (id: string) => {
//     dispatch(deleteTable(id)).then(() => {
//       dispatch(fetchTablesByRoom(formData.roomId));
//     });
//   };

  const handleCancel = () => {
    setFormData({
        name: "",
        x: 0,
        y: 0,
        status: "available",
        roomId: "",
        shape: "",
     });
    setEditingId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      x: 0,
      y: 0,
      status: "available",
      roomId: "",
      shape: "",
    });
  };

  const rows = tables.map((t) => ({
    id: t._id,
    name: t.name, // `Mesa ${t.number}`,   // ✅ Generas el "nombre visual" con el número
    x: t.position.x,            // ✅ accediendo correctamente a la posición
    y: t.position.y,
    status: t.status,
    roomId: t.roomId,
    shape: t.shape,
  }));

  const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "shape", headerName: "Shape", flex: 0.5 },
  { field: "status", headerName: "Status", flex: 0.5 },
  {
    field: "actions",
    headerName: "Actions",
    flex: 0.6,
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


  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? "Edit Table" : "Add Table"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              select
              label="Room"
              name="roomId"
              value={formData.roomId}
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
              {rooms.map((room) => (
                <MenuItem key={room._id} value={room._id}>
                  {room.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
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
          <Grid item xs={6} sm={4}>
            <TextField
              fullWidth
              select
              label="Shape"
              name="shape"
              value={formData.shape}
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
              {shapes.map((shape) => (
                <MenuItem key={shape._id} value={shape.key}>
                  {shape.key}
                </MenuItem>
              ))}
            </TextField>
          </Grid>                   
          <Grid item xs={6} sm={2} sx={{ display: 'none' }}>
            <TextField
              label="Pos X"
              name="x"
              type="number"
              value={formData.x}
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
          <Grid item xs={6} sm={2} sx={{ display: 'none' }}>
            <TextField
              label="Pos Y"
              name="y"
              type="number"
              value={formData.y}
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
 
        </Grid>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
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
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={cancelButton}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          List of tables
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          sx={datagridStyle}
          disableRowSelectionOnClick
        />
      </Paper>
      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar esta mesa ?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default Tables;

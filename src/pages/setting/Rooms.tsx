// src/pages/Rooms.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  clearRoomMessages,
} from '../../store/slices/roomSlice';
import {
  datagridStyle,
  formContainer,
  inputField,
  submitButton,
  formTitle,
  cancelButton,
  generalTable,
} from '../../styles/AdminStyles';
import Dialog from '../../components/Dialog';
import { useToastMessages } from '../../hooks/useToastMessage';

const Rooms: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms, successMessage, errorMessage } = useAppSelector((state) => state.rooms);

  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useToastMessages(
    successMessage, 
    errorMessage, 
    clearRoomMessages);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingId) {
      dispatch(updateRoom({ id: editingId, name: formData.name })).then(() => {
        setEditingId(null);
        setFormData({ name: '' });
      });
    } else {
      dispatch(createRoom({ name: formData.name })).then(() => {
        setFormData({ name: '' });
      });
    }
  };

  const handleEdit = (id: string) => {
    const room = rooms.find((r) => r._id === id);
    if (room) {
      setFormData({ name: room.name });
      setEditingId(id);
    }
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
      dispatch(deleteRoom(selectedId));
    }
    handleDeleteDialogClose();
  };

  const handleCancel = () => {
    setFormData({ name: '' });
    setEditingId(null);
  };

  const rows = rooms.map((r) => ({
    id: r._id,
    name: r.name,
  }));

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteDialogOpen(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Room' : 'Add New Room'}
        </Typography>
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
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
          >
            {editingId ? 'Update' : 'Save'}
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

      <Paper sx={generalTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          List of Rooms
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
      </Paper>

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este salón?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default Rooms;
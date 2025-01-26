import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Box,
  Button,
  Typography,
  Paper,
  PaperProps,
  TextField,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchClients,
  createClient,
  updateClient,
  changeClientStatus,
  searchClients,
} from '../../store/slices/clientSlice';
import {
  formContainer,
  submitButton,
  permissionsTable,
  inputContainer,
  formTitle,
  inputField,
  searchButton,
  cancelButton,
  modalTitleStyle,
  datagridStyle_v2,
  inputContainerForm,
} from '../../styles/AdminStyles';
import CustomDialog from '../../components/Dialog'; // Diálogo reutilizable para confirmaciones
import { useToastSuccessMessage } from '../../hooks/useToastMessage';

const DraggablePaper = (props: PaperProps) => {
  const nodeRef = useRef(null);
  return (
    <Draggable handle="#draggable-dialog-title" nodeRef={nodeRef}>
      <div ref={nodeRef}>
        <Paper {...props} />
      </div>
    </Draggable>
  );
};

const Client: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clients, successMessage } = useAppSelector((state) => state.clients);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    address: '',
    country: '',
  });

  const [filters, setFilters] = useState({
    name: '',
    rut: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchClients({ status: 'active' }));
  }, [dispatch]);

  // Manejo de mensajes
  useToastSuccessMessage(successMessage);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      rut: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    });
    setEditingId(null);
    setLocalError(null);
  };

  const handleSubmit = () => {
    if (editingId) {
    dispatch(updateClient({ id: editingId, data: { ...formData } }))
        .unwrap()
        .then(() => {
        setLocalError(null)
        handleCloseModal(); // Cierra el modal si la operación fue exitosa
        })
        .catch((error) => {
        setLocalError(error); // Muestra el error si falla
        });
    } else {
    dispatch(createClient(formData))
        .unwrap()
        .then(() => {
        handleCloseModal(); // Cierra el modal si la operación fue exitosa
        })
        .catch((error) => {
        setLocalError(error); // Muestra el error si falla
        });
    }
  };

  const handleSearch = () => {
    dispatch(searchClients(filters));
  };

  const handleEdit = (id: string) => {
    const client = clients.find((cli) => cli._id === id);
    if (client) {
      setFormData({
        name: client.name,
        rut: client.rut,
        email: client.email,
        phone: client.phone,
        address: client.address,
        country: client.country,
      });
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleDeleteDialogOpen = (id: string) => {
    setSelectedClientId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedClientId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedClientId) {
      dispatch(changeClientStatus({ id: selectedClientId, status: 'inactive' }))
        .unwrap()
        .then(() => {
          console.log('Estado cambiado a inactive con éxito');
          dispatch(fetchClients({ status: 'active' }));
        })
        .catch((error) => {
          console.error('Error al cambiar el estado del producto:', error);
        });      
    }
    handleDeleteDialogClose();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const rows = clients.map((client) => ({
    id: client._id,
    name: client.name,
    rut: client.rut,
    email: client.email,
    phone: client.phone,
    address: client.address,
    country: client.country,
  }));

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'rut', headerName: 'RUT', flex: 1, minWidth: 120 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120 },
    { field: 'address', headerName: 'Address', flex: 1.5, minWidth: 200 },
    { field: 'country', headerName: 'Country', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)}
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
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>Client Management</Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
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
          <TextField
            label="RUT"
            name="rut"
            value={filters.rut}
            onChange={handleFilterChange}
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
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '16px' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={submitButton}
          >
            New Client
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={searchButton}
          >
            Search
          </Button>
        </Box>
      </Paper>

      <Paper sx={permissionsTable}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          disableRowSelectionOnClick
          sx={datagridStyle_v2}
        />
      </Paper>

      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={handleCloseModal} PaperComponent={DraggablePaper}>
          <DialogTitle id="draggable-dialog-title" sx={modalTitleStyle}>
            {editingId ? 'Edit Client' : 'New Client'}
          </DialogTitle>
          {localError && (
            <Box sx={{ margin: '16px' }}>
              <Alert severity="error">{localError}</Alert>
            </Box>
          )}
          <DialogContent>
            <Box sx={inputContainerForm}>
              <TextField 
                label="Name" 
                name="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
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
              <TextField 
                label="RUT" 
                name="rut" 
                value={formData.rut} 
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })} 
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
              <TextField 
                label="Email" 
                name="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
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
              <TextField 
                label="Phone" 
                name="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
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
              <TextField 
                label="Address" 
                name="address" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
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
              <TextField 
                label="Country" 
                name="country" 
                value={formData.country} 
                onChange={(e) => setFormData({ ...formData, country: e.target.value })} 
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={submitButton}>
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal} sx={cancelButton}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <CustomDialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this client?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default Client;
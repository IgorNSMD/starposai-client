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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchProviders,
  createProvider,
  updateProvider,
  changeProviderStatus,
} from '../../store/slices/providerSlice';
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
} from '../../styles/AdminStyles';

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

const Provider: React.FC = () => {
  const dispatch = useAppDispatch();
  const { providers } = useAppSelector((state) => state.providers);

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

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

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
  };

  const handleSubmit = () => {
    if (editingId) {
      dispatch(updateProvider({ id: editingId, data: { ...formData } }));
    } else {
      dispatch(createProvider(formData));
    }
    handleCloseModal();
  };

  const handleEdit = (id: string) => {
    const provider = providers.find((prov) => prov._id === id);
    if (provider) {
      setFormData({
        name: provider.name,
        rut: provider.rut,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        country: provider.country,
      });
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(changeProviderStatus({ id, status: 'inactive' }));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const rows = providers.map((provider) => ({
    id: provider._id,
    name: provider.name,
    rut: provider.rut,
    email: provider.email,
    phone: provider.phone,
    address: provider.address,
    country: provider.country,
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
            onClick={() => handleDelete(params.row.id)}
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
        <Typography sx={formTitle}>Provider Management</Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            sx={inputField}
          />
          <TextField
            label="RUT"
            name="rut"
            value={filters.rut}
            onChange={handleFilterChange}
            sx={inputField}
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
            New Provider
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<SearchIcon />}
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
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          disableRowSelectionOnClick
          sx={datagridStyle_v2}
        />
      </Paper>

      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperComponent={DraggablePaper}
        >
          <DialogTitle id="draggable-dialog-title" sx={modalTitleStyle}>
            {editingId ? 'Edit Provider' : 'New Provider'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={inputField}
              />
              <TextField
                label="RUT"
                name="rut"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                sx={inputField}
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={inputField}
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={inputField}
              />
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                sx={inputField}
              />
              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                sx={inputField}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={submitButton}
            >
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
              sx={cancelButton}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Provider;
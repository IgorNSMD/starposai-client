import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  Button,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
  Stack,
} from '@mui/material';

import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { useMediaQuery, useTheme,  } from "@mui/material";

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchPositions,
  fetchStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../../store/slices/staffSlice';



import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';



interface FormData {
  name: string;
  position: string;
}

const Staff: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dispatch = useAppDispatch();
  const { staffs, positions, errorMessage, successMessage } = useAppSelector((state) => state.staffs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Nuevo estado para el cuadro de diálogo
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Para eliminar
  const [selectedId, setSelectedId] = useState<string | null>(null); // ID seleccionado para eliminar

  const [formData, setFormData] = useState<FormData>({
    name: "",
    position: "", 
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchPositions());
    dispatch(fetchStaffs());
  }, [dispatch]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

      // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };

      // Diálogo para eliminar
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
      dispatch(deleteStaff(selectedId))
        .then(() => dispatch(fetchStaffs())); // Actualiza la lista después de eliminar
      setSelectedId(null);
    }
    handleDeleteDialogClose();
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      position: formData.position
    };
  
    if (editingId) {
      dispatch(updateStaff({ id: editingId, ...data })).then(() => {
        dispatch(fetchStaffs());
        setEditingId(null);
        setFormData({     
          name: "",
          position: "", // Valor inicial como string
         });
      });
    } else {
      dispatch(createStaff({ ...data })).then(() => {
        dispatch(fetchStaffs());
        setEditingId(null);
        setFormData({     
          name: "",
          position: "", // Valor inicial como string
         });
      });
    }

  };

  const handleEdit = (id: string) => {
    const staff = staffs.find((staff) => staff._id === id);
    if (staff) {
      setFormData({ 
        name: staff.name, 
        position: typeof staff.position === 'string' ? staff.position : staff.position?._id || ''
      });
      setEditingId(id);
    }
  };

  const handleCancel = () => {
    setFormData({     
      name: "",
      position: "", // Valor inicial como string
     });
    setEditingId(null);
  };

  // Función para cerrar el cuadro de diálogo
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleConfirmUpdate  = () => {
    const data = {
      name: formData.name,
      position: formData.position
    };
  
    if (editingId) {
      dispatch(updateStaff({ id: editingId, ...data })).then(() => {
        dispatch(fetchStaffs());
        setEditingId(null);
        setFormData({     
          name: "",
          position: "", // Valor inicial como string
         });
      });
    } 
  };

  const columns = [
  { field: 'name', headerName: 'Name', minWidth: 150, flex: 1 },
  { field: 'position', headerName: 'Position', minWidth: 150, flex: 1 },
  {
    field: 'actions',
    headerName: 'Actions',
    minWidth: 100,
    flex: 0.5,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <>
        <IconButton
          color="primary"
          onClick={() => handleEdit(params.row.id)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDeleteDialogOpen(params.row.id)}
        >
          <DeleteIcon />
        </IconButton>
      </>
    ),
  },
  ];

  

  const rows = staffs
  .filter((staff) => staff._id && staff.name) // Filtra registros válidos
  .map((staff) => {

    const positionName = typeof staff.position === "string"
      ? positions.find((p) => p._id === staff.position)?.name || "Unknown Position"
      : staff.position?.name || "Unknown Position";

    return {
      id: staff._id, // Usa `_id` como identificador único
      name: staff.name,
      position: positionName, // Mapea el nombre del rol
    };
  });

  return (
  <Box p={2} sx={{ maxWidth: '1000px', mx: 'auto' }}>
    <Paper
      sx={{
        p: 3,
        mb: 1,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        {editingId ? 'Edit Staff' : 'Add New Staff'}
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Staff Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
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

        <FormControl fullWidth>
          <InputLabel
              id="parent-select-label"
              shrink={true} // Esto fuerza que el label permanezca visible
              sx={{
                color: "#444444",
                "&.Mui-focused": {
                  color: "#47b2e4",
                },
              }}
            >
            Position
          </InputLabel>
          <Select
            labelId="position-label"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            label="Position"
          >
            {positions.map((pos) => (
              <MenuItem key={pos._id} value={pos._id}>
                {pos.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="flex-start"
        gap={2}
        mt={3}
      >
        <Button 
          variant="contained" 
          onClick={handleSubmit}
        >
          {editingId ? 'Update' : 'Save'}
        </Button>

        {editingId && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
            sx={{
              backgroundColor: '#e57373',
              borderColor: '#ccc',
              color: '#f5f5f5',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
                color: '#444',
              },
            }}              
          >
            Cancel
          </Button>
        )}
      </Box>
    </Paper>

    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Staffs List
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{
          minWidth: '100%',
          overflowX: 'auto',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#37517e',
            color: '#fff',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto',
          },
        }}
      />
    </Paper>

    <Dialog
      isOpen={isDialogOpen}
      title="Confirm Update"
      message="Are you sure you want to update this staff?"
      onClose={handleDialogClose}
      onConfirm={handleConfirmUpdate}
    />

    <Dialog
      isOpen={isDeleteDialogOpen}
      title="Confirm Delete"
      message="Are you sure you want to delete this staff?"
      onClose={handleDeleteDialogClose}
      onConfirm={handleConfirmDelete}
    />
  </Box>
);

};

export default Staff;
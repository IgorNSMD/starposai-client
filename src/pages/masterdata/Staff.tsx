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
} from '@mui/material';

import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchPositions,
  fetchStaffs,
  updateStaff,
  deleteStaff,
} from '../../store/slices/staffSlice';

import {
  formContainer,
  submitButton,
  inputField,
  inputContainer,
  formTitle,
  datagridStyle,
  cancelButton,
  staffsTable,
} from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura
import { useToastMessages } from '../../hooks/useToastMessage';


interface FormData {
  name: string;
  position: string;
}

const Staff: React.FC = () => {
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
    } 
  };

  const handleEdit = (id: string) => {
    const staff = staffs.find((staff) => staff._id === id);
    if (staff) {
      setFormData({ name: staff.name, position: staff.position });
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
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'position', headerName: 'position', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
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
    const positionName = positions.find((position) => position._id === staff.position)?.name || "Unknown Position";
    return {
      id: staff._id, // Usa `_id` como identificador único
      name: staff.name,
      position: positionName, // Mapea el nombre del rol
    };
  });

  return (
    <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          {editingId ? 'Edit Staff' : ''}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Staff Name"
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
        </Box>
        <Box sx={inputContainer}>
          <FormControl sx={{ minWidth: 350 }}>
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
              labelId="parent-select-label"
              name="position"
              value={formData.position} // Garantiza un valor seguro
              onChange={handleInputChange}
            >
              {/* <MenuItem key="-1" value="-1">
                <em>None</em>
              </MenuItem> */}
              {positions.map((r) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = r._id;
                //console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {r.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" gap={2} margin ="16px" >
          {editingId && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={submitButton}
            >
            Update
            </Button>
          )}
          {editingId && (
            <Button
              variant="outlined" // Cambiado a `contained` para igualar el estilo de "Save"
              color="secondary" // O el color que prefieras
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={cancelButton}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      <Paper sx={staffsTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Staffs List
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle}
        />
      </Paper>

      {/* Cuadro de diálogo de confirmación */}
      <Dialog
        isOpen={isDialogOpen}
        title="Confirm Update"
        message="Are you sure you want to update this permission?"
        onClose={handleDialogClose}
        onConfirm={handleConfirmUpdate}
      />

      {/* Cuadro de diálogo para eliminar */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this position?"
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

    </Box>
  );
};

export default Staff;
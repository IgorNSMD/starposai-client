import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
    Grid,
  MenuItem,
} from "@mui/material";
import { 
  DataGrid, 
  GridColDef,  } from "@mui/x-data-grid";
import SaveIcon  from '@mui/icons-material/Save';  
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton } from '@mui/material';

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import {
  createTask,
  fetchTasksByVenue,
  fetchFailedTasks,
  updateTaskStatus,
  deleteTask
} from "../../store/slices/taskSlice";

import { fetchStaffs } from "../../store/slices/staffSlice";

import {
  datagridStyle,
  formContainer_v2,
  formTitle,
  inputField,
  submitButton
} from '../../styles/AdminStyles';

import Dialog from '../../components/Dialog'; // Asegúrate de ajustar la ruta según tu estructura

const Task: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, failedTasks } = useAppSelector((state) => state.tasks);
  const { staffs } = useAppSelector((state) => state.staffs);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<"completed" | "failed" | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openStatusDialog = (id: string, status: "completed" | "failed") => {
    setSelectedTaskId(id);
    setStatusToUpdate(status);
    setIsStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setSelectedTaskId(null);
    setStatusToUpdate(null);
    setIsStatusDialogOpen(false);
  };

  const confirmStatusUpdate = () => {
    if (selectedTaskId && statusToUpdate) {
      dispatch(updateTaskStatus({ id: selectedTaskId, status: statusToUpdate }))
        .then(() => {
          dispatch(fetchTasksByVenue());
          dispatch(fetchFailedTasks());
        });
    }
    closeStatusDialog();
  };

  const openDeleteDialog = (id: string) => {
    setSelectedTaskId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedTaskId(null);
    setIsDeleteDialogOpen(false);
  };
  
  const confirmDeleteTask = () => {
    if (selectedTaskId) {
      // aquí deberías tener un thunk como `deleteTask`
      dispatch(deleteTask(selectedTaskId)).then(() => {
        dispatch(fetchTasksByVenue());
        dispatch(fetchFailedTasks());
      });
    }
    closeDeleteDialog();
  };

  const [formData, setFormData] = useState({
    staffId: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {
    dispatch(fetchStaffs());
    dispatch(fetchTasksByVenue());
    dispatch(fetchFailedTasks());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.staffId || !formData.description || !formData.dueDate) return;

    dispatch(
      createTask({
        ...formData,
      })
    ).then(() => {
      setFormData({ staffId: "", description: "", dueDate: "" });
      dispatch(fetchTasksByVenue());
    });
  };

  // const handleStatusChange = (id: string, status: "completed" | "failed") => {
  //   dispatch(updateTaskStatus({ id, status })).then(() => {
  //     dispatch(fetchTasksByVenue());
  //     dispatch(fetchFailedTasks());
  //   });
  // };

     // Mapear datos para DataGrid
  const rows = tasks.filter((tk) => tk._id && tk.staffId.name && tk.description) // Filtra registros válidos
     .map((task) => ({
       id: task._id, // Usa `_id` como identificador único
       staffName: task.staffId?.name || "N/A", // si backend hace populate
       description: task.description,
       dueDate: new Date(task.dueDate).toLocaleDateString(), // 💥 Aquí lo formateas bien
       status: task.status,
     }));

  const rows2 = failedTasks.filter((tk) => tk._id && tk.staffId.name && tk.description) // Filtra registros válidos
     .map((task) => ({
       id: task._id, // Usa `_id` como identificador único
       staffName: task.staffId?.name || "N/A", // si backend hace populate
       description: task.description,
       dueDate: new Date(task.dueDate).toLocaleDateString(), // 💥 Aquí lo formateas bien
       status: task.status,
  }));     

  const columns: GridColDef[] = [
    { field: "staffName", headerName: "Personal", minWidth: 130 },
    { field: "description", headerName: "Descripción", minWidth: 400 },
    { field: "dueDate", headerName: "Fecha Límite", minWidth: 120 },
    { field: "status", headerName: "Estado", minWidth: 140 },
    {
      field: "actions",
      headerName: "Acciones",
      minWidth: 200,
      renderCell: (params) => {
        console.log("params.row ->", params.row); // 👈 prueba temporal
        const { id, status } = params.row;
        return status === "pending" ? (
          <>
            <Tooltip title="Marcar como cumplida">
              <IconButton color="success" onClick={() => openStatusDialog(id, "completed")}>
                <DoneIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Marcar como incumplida">
              <IconButton color="error" onClick={() => openStatusDialog(id, "failed")}>
                <CloseIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Eliminar tarea">
              <IconButton color="warning" onClick={() => openDeleteDialog(id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : null;
      },
    },
    
  ];

  const columns2: GridColDef[] = [
    { field: "staffName", headerName: "Personal", minWidth: 130 },
    { field: "description", headerName: "Descripción", minWidth: 400 },
    { field: "dueDate", headerName: "Fecha Límite", minWidth: 120 },
    { field: "status", headerName: "Estado", minWidth: 150 },
  ];

  return (
    <Box sx={formContainer_v2}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
          Registrar Nueva Tarea
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Personal"
              name="staffId"
              value={formData.staffId}
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
              {staffs.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
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
              type="date"
              label="Fecha Límite"
              name="dueDate"
              value={formData.dueDate}
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
        <Box mt={2}>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={submitButton}
            >
            Agregar Tarea
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
         <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Tareas Actuales
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            <DataGrid 
              rows={rows} 
              columns={columns} 
              autoHeight 
              disableRowSelectionOnClick 
              sx={datagridStyle}
            />  
          </Box>
        </Box>

      </Paper>

      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Tareas Incumplidas
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 600 }}>
            <DataGrid 
              rows={rows2} 
              columns={columns2} 
              autoHeight disableRowSelectionOnClick 
              sx={datagridStyle}
            />
          </Box>
        </Box>

      </Paper>
      <Dialog
        isOpen={isStatusDialogOpen}
        title="Confirmar cambio de estado"
        message={`¿Estás seguro de marcar esta tarea como "${statusToUpdate === "completed" ? "cumplida" : "incumplida"}"?`}
        onClose={closeStatusDialog}
        onConfirm={confirmStatusUpdate}
      />

      <Dialog
        isOpen={isDeleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar esta tarea?"
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteTask}
      />      

    </Box>
  );
};

export default Task;

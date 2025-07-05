import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import HowToRegIcon from "@mui/icons-material/HowToReg";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PendingActionsIcon   from "@mui/icons-material/PendingActions";

import dayjs from "dayjs";

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';

import {
  fetchShifts,
  registerEntry,
  registerExit,
} from "../../store/slices/shiftSlice";

import { fetchStaffs } from "../../store/slices/staffSlice";
import { fetchTasksByVenue, markTaskAsDoneByStaff } from "../../store/slices/taskSlice";

import Dialog from "../../components/Dialog";


const Shift: React.FC = () => {
  const dispatch = useAppDispatch();
  const { staffs } = useAppSelector((state) => state.staffs);
  const { shifts } = useAppSelector((state) => state.shifts);
  const { tasks } = useAppSelector((state) => state.tasks);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carga inicial
  useEffect(() => {
    dispatch(fetchStaffs());
    dispatch(fetchShifts());
    dispatch(fetchTasksByVenue()); // ✅ para que estén disponibles en Redux
  }, [dispatch]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("[Shift] Actualizando turnos automáticamente...");
      dispatch(fetchShifts());
    }, 2 * 60 * 1000); // cada 2 minutos
  
    return () => {
      clearInterval(refreshInterval);
      console.log("[Shift] Auto-refresh detenido.");
    };
  }, [dispatch]);

  // Utilidad para saber si hay turno hoy de ese staff
  const getTodayShift = (staffName: string) => {
    const today = dayjs().startOf("day");
    return shifts.find(
      (shift) =>
        typeof shift.staffId === "object" &&
        "name" in shift.staffId &&
        shift.staffId.name.trim().toLowerCase() === staffName.trim().toLowerCase() &&
        dayjs(shift.date).isSame(today, "day")
    );
  };
  

  const handleEntry = (staffId: string) => {
    dispatch(registerEntry({ staffId })).then(() => {
      dispatch(fetchShifts()); // 🔄 recargar turnos inmediatamente
  });
  };

  const handleExit = (shiftId: string) => {
    dispatch(registerExit({ shiftId })).then(() => {
      dispatch(fetchShifts()); // 🔄 recargar turnos inmediatamente
    });
  };

  const handleMarkTaskConfirm = () => {
    if (selectedTaskId) {
      dispatch(markTaskAsDoneByStaff(selectedTaskId)).then(() => {
        dispatch(fetchTasksByVenue());
        setSelectedTaskId(null);
        setIsDialogOpen(false);
      });
    }
  };

  const handleMarkTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDialogOpen(true);
  };

  const rows = staffs
    .map((staff) => {
      const shift = getTodayShift(staff.name);
        const staffPendingTasks = tasks.filter(
          (task) => task.staffId?._id === staff._id && task.status === "pending"
        );
      return {
        id: staff._id,
        name: staff.name,
        staffId: staff._id, // ← ✅ agrega este campo explícitamente
        entryTime: shift?.entryTime
          ? dayjs(shift.entryTime).format("HH:mm:ss")
          : "-",
        exitTime: shift?.exitTime
          ? dayjs(shift.exitTime).format("HH:mm:ss")
          : "-",
        hasEntry: !!shift?.entryTime,
        hasExit: !!shift?.exitTime,
        shiftId: shift?._id || null,
        pendingTasks: staffPendingTasks.map((t) => t.description).join(", "), // 👈
        staffPendingTasks,
      };
    });

  const columns: GridColDef[] = [
  { field: "name", headerName: "Personal", flex: 1, minWidth: 150 },
  {
    field: "pendingTasks",
    headerName: "Tareas Pendientes",
    flex: 2,
    minWidth: 200,
    renderCell: (params) => (
      <span>{params.value || "Sin tareas"}</span>
    ),
  },
  {
    field: "markTasks",
    headerName: "Tareas Hechas",
    flex: 1,
    minWidth: 140,
    align: "center",
    headerAlign: "center",
    renderCell: ({ row }) => {
      const staffTasks = tasks.filter(
        (t) => t.staffId?._id === row.staffId && t.status === "pending"
      );
      if (staffTasks.length === 0) return null;

      const allMarkedByStaff = staffTasks.every(t => t.markedAsDoneByStaff);
      return (
        <Box display="flex" justifyContent="center" width="100%">
          {allMarkedByStaff ? (
            <Tooltip title="Tareas marcadas como hechas por el usuario">
              <TaskAltIcon sx={{ color: "#2e7d32" }} />
            </Tooltip>
          ) : (
            <Tooltip title="Marcar tarea como hecha">
              <IconButton
                size="small"
                onClick={() => {
                  const pendingTask = staffTasks.find(t => !t.markedAsDoneByStaff);
                  if (pendingTask?._id) handleMarkTask(pendingTask._id);
                }}
              >
                <PendingActionsIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
  },
  {
    field: "entryTime",
    headerName: "Entrada",
    minWidth: 90,
    flex: 0,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "exitTime",
    headerName: "Salida",
    minWidth: 90,
    flex: 0,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "actions",
    headerName: "Acciones",
    minWidth: 120,
    flex: 0,
    align: "center",
    headerAlign: "center",
    renderCell: ({ row }) => {
      const { staffId, hasEntry, hasExit, shiftId } = row;
      return (
        <Box display="flex" gap={1} justifyContent="center" alignItems="center" width="100%">
          {!hasEntry && (
            <Tooltip title="Registrar Entrada">
              <IconButton color="primary" onClick={() => handleEntry(staffId)}>
                <HowToRegIcon />
              </IconButton>
            </Tooltip>
          )}
          {!hasExit && hasEntry && (
            <Tooltip title="Registrar Salida">
              <IconButton color="primary" onClick={() => handleExit(shiftId)}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
          )}
          {hasEntry && hasExit && (
            <Tooltip title="Turno completado">
              <IconButton disabled>
                <CheckCircleIcon color="success" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
  },
];


  return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      maxWidth: '1000px',
      margin: '0 auto',
      padding: 2,
    }}
  >
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        width: '100%',
        overflowX: 'auto',
      }}
    >
      <Typography
        variant="h6"
        sx={{ paddingBottom: 2, color: '#333333', fontWeight: 'bold' }}
      >
        Registro de Turnos (Día Actual)
      </Typography>

      <Box sx={{ minWidth: '600px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[5, 10, 20, 100]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#37517e',
              color: '#ffffff',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row.row-with-entry': {
              backgroundColor: '#e3f2fd',
            },
            '& .MuiDataGrid-row.row-with-complete': {
              backgroundColor: '#e8f5e9',
            },
          }}
          getRowClassName={(params) =>
            params.row.hasEntry && params.row.hasExit
              ? 'row-with-complete'
              : params.row.hasEntry
              ? 'row-with-entry'
              : ''
          }
        />
      </Box>
    </Paper>

    {/* Diálogo de confirmación */}
    <Dialog
      isOpen={isDialogOpen}
      title="Confirmar tarea realizada"
      message="¿Estás seguro de marcar esta tarea como realizada?"
      onClose={() => setIsDialogOpen(false)}
      onConfirm={handleMarkTaskConfirm}
    />
  </Box>
);

};

export default Shift;

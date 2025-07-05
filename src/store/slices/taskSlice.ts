import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";


// 🔹 Modelo de Tarea
export interface Task {
  _id: string;
  staffId: {
    _id: string;
    name: string;
  };
  staffName: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed" | "failed";
  companyId: string;
  venueId: string;
  markedAsDoneByStaff?: boolean; // ← Nuevo campo
}

interface TaskState {
  tasks: Task[];
  failedTasks: Task[];
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: TaskState = {
  tasks: [],
  failedTasks: [],
  loading: false,
  successMessage: null,
  errorMessage: null,
};

export const markTaskAsDoneByStaff = createAsyncThunk<
  Task,                                      // lo que retorna
  string,                                    // el taskId que recibe
  { rejectValue: string }                   // configuración
>(
  "tasks/markTaskAsDoneByStaff",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/tasks/mark-done-by-staff", {
        taskId,
      });
      return response.data.task;
    } catch {
      return rejectWithValue("Error al marcar tarea como hecha por el staff.");
    }
  }
);


export const createTask = createAsyncThunk<
  Task,
  { staffId: string; description: string; dueDate: string },
  { rejectValue: string; state: RootState }
>("tasks/createTask", async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.post("/tasks", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error fetching Positions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// ✅ Obtener tareas por companyId y venueId

  

export const fetchTasks = createAsyncThunk<
  Task[],
  void,
  { rejectValue: string; state: RootState }
>("tasks/fetchTasks", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/tasks", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch {
    return rejectWithValue("Error al obtener tareas.");
  }
});

export const fetchTasksByVenue = createAsyncThunk<
  Task[],                            // ✅ Tipo de retorno
  void,                              // ✅ No requiere argumentos
  { state: RootState; rejectValue: string } // ✅ Tipado de thunkAPI
>(
  "tasks/fetchByVenue",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      const response = await axiosInstance.get("/tasks", {
        params: { companyId: activeCompanyId, venueId: activeVenueId },
      });

      return response.data;
    } catch  {
      return rejectWithValue("Error al obtener tareas por local.");
    }
  }
);

export const fetchFailedTasks = createAsyncThunk<
  Task[],
  void,
  { rejectValue: string; state: RootState }
>("tasks/fetchFailedTasks", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/tasks/failed", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch {
    return rejectWithValue("Error al obtener tareas incumplidas.");
  }
});

export const updateTaskStatus = createAsyncThunk<
  Task,
  { id: string; status: "completed" | "failed" },
  { rejectValue: string }
>("tasks/updateTaskStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/tasks/${id}/status`, { status });
    return response.data;
  } catch {
    return rejectWithValue("Error al actualizar la tarea.");
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tasks/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/tasks/${id}`);
    return id;
  } catch  {
    return rejectWithValue("Error al eliminar tarea");
  }
});

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
      clearMessages(state) {
        state.successMessage = null;
        state.errorMessage = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchTasks.fulfilled, (state, action) => {
          state.tasks = action.payload;
          state.loading = false;
        })
        .addCase(fetchTasksByVenue.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchTasksByVenue.fulfilled, (state, action) => {
          state.tasks = action.payload;
          state.loading = false;
        })
        .addCase(fetchTasksByVenue.rejected, (state, action) => {
          state.loading = false;
          state.errorMessage = action.payload || "Error al obtener tareas por local.";
        })
        .addCase(fetchFailedTasks.fulfilled, (state, action) => {
          state.failedTasks = action.payload;
        })
        .addCase(createTask.fulfilled, (state, action) => {
          state.tasks.unshift(action.payload);
          state.successMessage = "Tarea creada con éxito";
        })
        .addCase(updateTaskStatus.fulfilled, (state, action) => {
          state.tasks = state.tasks.map((t) =>
            t._id === action.payload._id ? action.payload : t
          );
          state.successMessage = "Estado actualizado correctamente";
        })
        .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
          state.tasks = state.tasks.filter(task => task._id !== action.payload);
          state.successMessage = "Tarea eliminada correctamente";
        })        
        .addCase(markTaskAsDoneByStaff.fulfilled, (state, action) => {
          state.tasks = state.tasks.map(task =>
            task._id === action.payload._id ? action.payload : task
          );
          state.successMessage = "Tarea marcada como hecha por el staff.";
        })        
        .addMatcher(
            (action): action is PayloadAction<string> =>
                action.type.startsWith("tasks/") && action.type.endsWith("/rejected"),
            (state, action) => {
                state.errorMessage = action.payload || "Ocurrió un error inesperado.";
        })
    },
  });
  
  export const { clearMessages } = taskSlice.actions;
  export default taskSlice.reducer;
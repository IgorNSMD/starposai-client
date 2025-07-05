import { createSlice, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

export interface Table {
  _id: string;
  name: string;
  number: number;
  position: { x: number; y: number };
  status: "available" | "occupied" | "reserved";
  roomId: string;
  shape: string; // ✅ Nuevo campo agregado  
  companyId: string;
  venueId: string;
}

interface TableState {
  tables: Table[];
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: TableState = {
  tables: [],
  loading: false,
  successMessage: null,
  errorMessage: null,
};

export const updateTableStatus = createAsyncThunk<
  { _id: string; status: "available" | "occupied" | "reserved" }, // ✅ aquí
  { tableId: string; status: "available" | "occupied" | "reserved" }, // ✅ aquí también
  { rejectValue: string }
>('tables/updateTableStatus', async ({ tableId, status }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/tables/${tableId}/status`, { status });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar estado de mesa.");
    }
    throw error;
  }
});



// 🔄 Obtener mesas por roomId
export const fetchTablesByRoom = createAsyncThunk<
  Table[],
  string,
  { rejectValue: string; state: RootState }
>('tables/fetchByRoom', async (roomId, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/tables', { params: { roomId,companyId: activeCompanyId, venueId: activeVenueId  } });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener mesas');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const fetchTables = createAsyncThunk<Table[], void, { rejectValue: string; state: RootState }>(
  "tables/fetchTables",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get("/tables", { params: { companyId: activeCompanyId, venueId: activeVenueId } });
      return response.data;
    } catch {
      return rejectWithValue("Error al obtener mesas");
    }
  }
);

export const createTable = createAsyncThunk<
Table, 
{ 
  name: string; 
  number: number; 
  position: { x: number; y: number }; 
  roomId: string;
  shape: string; 
}, { rejectValue: string; state: RootState }>(
  "tables/createTable",
  async (data, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.post("/tables", { ...data, companyId: activeCompanyId, venueId: activeVenueId });
      return response.data;
    } catch {
      return rejectWithValue("Error al crear mesa");
    }
  }
);

export const updateTable = createAsyncThunk<
  Table,
  { id: string; data: Partial<Table> },
  { rejectValue: string; state: RootState }
>("tables/updateTable", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    
    //console.log("updateTable initial...", data);

    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.put(`/tables/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar mesa");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteTable = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tables/deleteTable", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/tables/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar mesa");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const updateTablePosition = createAsyncThunk<
  Table,
  { id: string; posX: number; posY: number },
  { rejectValue: string }
>("tables/updatePosition", async ({ id, posX, posY }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/tables/${id}/position`, { posX, posY });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error actualizando posición");
    }
    return rejectWithValue("Error inesperado");
  }
});

const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    clearTableMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTablesByRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTablesByRoom.fulfilled, (state, action: PayloadAction<Table[]>) => {
        state.tables = action.payload;
        state.loading = false;
      })
      .addCase(fetchTablesByRoom.rejected, (state, action) => {
        state.errorMessage = action.payload || "Error al cargar mesas";
        state.loading = false;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.tables.push(action.payload);
        state.successMessage = "Mesa creada correctamente";
      })
      .addCase(updateTablePosition.fulfilled, (state, action: PayloadAction<Table>) => {
        const index = state.tables.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tables[index] = action.payload;
        }
        state.successMessage = "Posición actualizada";
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const idx = state.tables.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tables[idx] = action.payload;
        state.successMessage = "Mesa actualizada correctamente";
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter((t) => t._id !== action.payload);
        state.successMessage = "Mesa eliminada correctamente";
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        const index = state.tables.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tables[index].status = action.payload.status;
        }
      })
      .addMatcher(
        (action): action is PayloadAction<string> =>
          action.type.startsWith("tables/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.errorMessage = action.payload || "Error inesperado.";
        }
      );
  },
});

export const { clearTableMessages } = tableSlice.actions;
export default tableSlice.reducer;
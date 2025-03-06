import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';


// Define la interfaz para un parámetro
export interface Position {
    _id: string;
    name: string;
}

interface PositionState {
  positions: Position[]; // Agregamos las categorias
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: PositionState = {
    positions: [], // Agregamos los categorias aquí
    isLoading: false,
    errorMessage: null,
    successMessage: null,
};

export const fetchPositions = createAsyncThunk<
  Position[],
  void,
  { rejectValue: string }
>("positions/fetchPositions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/positions");
    // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
    //console.log('response.data-> ', response.data)  
    return response.data;
    

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching positions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const createPosition = createAsyncThunk<
  Position,
  { name: string; },
  { rejectValue: string }
>("positions/createPosition ", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/positions", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (positions/createPosition)');
    }
  }
});

export const updatePosition = createAsyncThunk<
  Position,
  { id: string; name: string; },
  { rejectValue: string }
>("positions/updatePosition", async ({ id, name, }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/positions/${id}`, { name, });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (positions/updatePosition)');
    }
  }
});

export const deletePosition = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("positions/deletePosition", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/positions/${id}`);
    return id; // Devuelve el ID eliminado en caso de éxito
  } catch (error) {
    // Manejo del error con `isAxiosError` desde la instancia extendida
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting Position..");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const PositionSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.fulfilled, (state, action: PayloadAction<Position[]>) => {
        state.isLoading = true;
        state.positions = action.payload;
        state.errorMessage = null;
      })
      .addCase(createPosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.positions.push(action.payload);
        state.successMessage = "Position created successfully";
        state.errorMessage = null;
      })
      .addCase(createPosition.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating Position";
      })
      .addCase(updatePosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.positions = state.positions.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        );
        state.successMessage = "Position updated successfully";
        state.errorMessage = null;
      })
      .addCase(updatePosition.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating Position";
      })
      .addCase(deletePosition.fulfilled, (state, action: PayloadAction<string>) => {
        state.positions = state.positions.filter((cat) => cat._id !== action.payload);
        state.successMessage = "Position deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deletePosition.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting Position";
      });
  },
});

export const { clearMessages } = PositionSlice.actions;
export default PositionSlice.reducer;
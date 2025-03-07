import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";

interface Position {
  _id: string;
  name: string;
}

interface Staff {
  _id: string;
  name: string;
  position: string
}

interface StaffState {
  isLoaded: boolean;
  staffs: Staff[];
  positions: Position[]; // Agregamos los permisos aquí
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: StaffState = {
  isLoaded: false,
  staffs: [],
  positions: [],
  errorMessage: null,
  successMessage: null,
};

// Thunks
export const fetchPositions = createAsyncThunk<
  Position[],
  void,
  { rejectValue: string }
>("staffs/fetchPositions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/positions");
    // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
    const data = response.data.map((position: Position) => ({
      _id: position._id, // Cambia `_id` a `id`
      name: position.name, // Conserva el campo `label`
    }));
    //console.log('data::', data)  
    return data; // Devuelve solo `id` y `label`

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching Positions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Thunks
export const fetchStaffs = createAsyncThunk<
  Staff[],
  void,
  { rejectValue: string }
>("staffs/fetchStaffs", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/staffs");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching staffs");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateStaff = createAsyncThunk<
  Staff,
  { id: string; name: string; position: string },
  { rejectValue: string }
>("staffs/updateStaff", async ({ id, name, position }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/staffs/${id}`, { name, position });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating staff");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteStaff = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("staffs/deleteStaff", async (id, { rejectWithValue }) => {
  try {
    console.log('staffs/deleteStaff->',id)
    await axiosInstance.delete(`/staffs/${id}`);
    console.log('registro eliminado ->',id)
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting staff");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

const staffSlice = createSlice({
  name: 'staffs',
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
        state.isLoaded = true;
        state.positions = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchPositions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading Positions";
      })
      .addCase(fetchStaffs.fulfilled, (state, action: PayloadAction<Staff[]>) => {
        state.isLoaded = true;
        state.staffs = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchStaffs.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading staffs";
      })
      .addCase(updateStaff.fulfilled, (state, action: PayloadAction<Staff>) => {
        state.staffs = state.staffs.map((staff) =>
          staff._id === action.payload._id ? action.payload : staff
        );
        state.successMessage = "Position updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateStaff.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating position";
      })
      .addCase(deleteStaff.fulfilled, (state, action: PayloadAction<string>) => {
        state.staffs = state.staffs.filter((staff) => staff._id !== action.payload);
        state.successMessage = "Staff deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteStaff.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting Staff";
      })
  },
});

export const { clearMessages } = staffSlice.actions;
export default staffSlice.reducer;
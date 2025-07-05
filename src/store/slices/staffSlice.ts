import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";



interface Position {
  _id: string;
  name: string;
}

interface Staff {
  _id: string;
  name: string;
  position: string | Position; // <-- ahora puede ser ID o objeto
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
  { rejectValue: string; state: RootState }  // <- aquí está el fix
>(
  "staffs/fetchPositions", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("Company ID o Venue ID no encontrados.");
      }

      const response = await axiosInstance.get("/positions", {
        params: { companyId: activeCompanyId, venueId: activeVenueId },
      });

      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error fetching Positions");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);


// Thunks
export const fetchStaffs = createAsyncThunk<
  Staff[],
  void,
  { rejectValue: string; state: RootState  }
>("staffs/fetchStaffs", async (_, { rejectWithValue, getState }) => {
  try {

    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue("Company ID o Venue ID no encontrados.");
    }

    const response = await axiosInstance.get("/staffs", {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching staffs");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 POST
export const createStaff = createAsyncThunk<
  Staff,
  { name: string; position: string },
  { rejectValue: string; state: RootState }
>('staffs/createStaff', async (data, { rejectWithValue, getState  }) => {
  try {

    // Obtenemos los valores del estado de autenticación
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue('No se pudo obtener companyId o venueId del usuario autenticado.');
    }

    // Creamos el objeto a enviar
    const payload = { 
      companyId: activeCompanyId,
      venueId: activeVenueId,
      ...data 
    };

    const response = await axiosInstance.post('/staffs', payload);
    return response.data;

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear almacén');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const updateStaff = createAsyncThunk<
  Staff,
  { id: string; name: string; position: string },
  { rejectValue: string; state: RootState }
>("staffs/updateStaff", async ({ id, name, position }, { rejectWithValue, getState }) => {
  try {

    // Obtenemos los valores del estado de autenticación
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue('No se pudo obtener companyId o venueId del usuario autenticado.');
    }    

    // Creamos el payload que se enviará al backend
    const payload = {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      name,
      position
    };

    const response = await axiosInstance.put(`/staffs/${id}`, payload);
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
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

interface Shift {
  _id: string;
  staffId: {
    _id: string;
    name: string;
  };
  companyId: string;
  venueId?: string;
  entryTime?: string;
  exitTime?: string;
  date: string;
}

interface ShiftState {
  isLoaded: boolean;
  shifts: Shift[];
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: ShiftState = {
  isLoaded: false,
  shifts: [],
  errorMessage: null,
  successMessage: null,
};

// 🔄 FETCH Shifts
export const fetchShifts = createAsyncThunk<
  Shift[],
  void,
  { rejectValue: string; state: RootState }
>("shifts/fetchShifts", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue("Company ID o Venue ID no encontrados.");
    }

    const response = await axiosInstance.get("/shifts", {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
      },
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching shifts");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// ✅ Registrar ENTRADA
export const registerEntry = createAsyncThunk<
  Shift,
  { staffId: string },
  { rejectValue: string; state: RootState }
>("shifts/registerEntry", async ({ staffId }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue("No se pudo obtener companyId o venueId.");
    }

    const payload = {
      staffId,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    };

    const response = await axiosInstance.post("/shifts/entry", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error registrando entrada");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


// ✅ Registrar SALIDA
export const registerExit = createAsyncThunk<
  Shift,
  { shiftId: string },
  { rejectValue: string; state: RootState }
>("shifts/registerExit", async ({ shiftId }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue("No se pudo obtener companyId o venueId.");
    }

    const payload = {
      shiftId,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    };

    const response = await axiosInstance.post("/shifts/exit", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error registrando salida");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

const shiftSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.fulfilled, (state, action: PayloadAction<Shift[]>) => {
        state.shifts = action.payload;
        state.isLoaded = true;
        state.errorMessage = null;
      })
      .addCase(fetchShifts.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error cargando turnos";
      })
      .addCase(registerEntry.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.shifts.unshift(action.payload);
        state.successMessage = "Entrada registrada correctamente";
        state.errorMessage = null;
      })
      .addCase(registerEntry.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error registrando entrada";
      })
      .addCase(registerExit.fulfilled, (state, action: PayloadAction<Shift>) => {
        state.shifts = state.shifts.map((s) =>
          s._id === action.payload._id ? action.payload : s
        );
        state.successMessage = "Salida registrada correctamente";
        state.errorMessage = null;
      })
      .addCase(registerExit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error registrando salida";
      });
  },
});

export const { clearMessages } = shiftSlice.actions;
export default shiftSlice.reducer;
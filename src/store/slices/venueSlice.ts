// src/store/slices/venueSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";
import { Setting } from "./settingSlice";
import managementData from "../../data/managementData.json";
import managementData2 from "../../data/managementData2.json";
import managementData3 from "../../data/managementData3.json";

// Interfaces
export interface Venue {
  _id?: string;
  companyId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface VenueSettingPayload {
  venueId: string;
  venueData: Partial<Venue>;
  settingData: {
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
    taxRate: number;
    isTaxIncluded: boolean;
  };
}

export interface VenueSettingResponse {
  venue: Venue;
  setting: {
    _id: string;
    companyId: string;
    venueId: string;
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
    taxRate: number;
    isTaxIncluded: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface VenueState {
  venues: Venue[];
  currentVenue: Venue | null;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: VenueState = {
  venues: [],
  currentVenue: null,
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

// 🔹 venueSlice.ts
export const initializeVenueData = createAsyncThunk<
  void,
  { companyId: string; venueId: string; planCode: string },
  { rejectValue: string }
>("venues/initializeVenueData", async ({ companyId, venueId, planCode }, { rejectWithValue }) => {
  try {
    // Puedes cambiar la lógica para elegir los datos según plan, etc.
    const response = await axiosInstance.post("/companies/setup", {
      companyId,
      venueId,
      data: planCode === "1" ? managementData :
            planCode === "2" ? managementData2 :
            planCode === "3" ? managementData3 :
            managementData  // 🔥 Data por defecto si no se especifica un plan
    });

    return response.data;
  } catch {
    return rejectWithValue("Error al inicializar data del local");
  }
});

// 🔹 Obtener todos los locales de la empresa
export const fetchVenues = createAsyncThunk<
  Venue[],
  void,
  { state: RootState; rejectValue: string }
>("venues/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId } = getActiveContext(getState());
    const response = await axiosInstance.get(`/venues`, {
      params: { companyId: activeCompanyId }
    });
    return response.data;
  } catch {
    return rejectWithValue("Error al obtener locales");
  }
});

export const createVenueWithSetting = createAsyncThunk<
  { venue: Venue; setting: Setting },
  Partial<Venue>,
  { state: RootState; rejectValue: string }
>("venues/createVenueWithSetting", async (venueData, { getState, rejectWithValue,   }) => {
  try {
    const { activeCompanyId } = getActiveContext(getState());

    // 1. Crear el nuevo Venue
    const venueResponse = await axiosInstance.post("/venues", {
      ...venueData,
      companyId: activeCompanyId
    });

    const venue = venueResponse.data.venue;

    // 2. Crear Setting para ese Venue
    const settingResponse = await axiosInstance.post("/settings", {
      companyId: activeCompanyId,
      venueId: venue._id,
      timezone: "UTC",
      currency: "USD",
      language: "en",
      dateFormat: "YYYY-MM-DD",
      taxRate: 0,
      isTaxIncluded: true,
    });

    const setting = settingResponse.data.setting;

    // 3. Obtener el planCode desde el estado global (ej. desde registration)
    //const planCode = getState().registration.selectedPlanCode || "1";

   // 🚀 Inicializa roles/menús/permisos del nuevo local
    // 4. Ejecutar inicialización con planCode
    // await dispatch(initializeVenueData({
    //   companyId: activeCompanyId,
    //   venueId: venue._id,
    //   planCode,
    // }));

    return { venue, setting };
  } catch {
    return rejectWithValue("Error al crear local y configuración");
  }
});


// 🔹 Crear un nuevo local
export const createVenue = createAsyncThunk<
  Venue,
  Partial<Venue>,
  { state: RootState; rejectValue: string }
>("venues/create", async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId } = getActiveContext(getState());
    const response = await axiosInstance.post("/venues", {
      ...data,
      companyId: activeCompanyId
    });
    return response.data.venue;
  } catch {
    return rejectWithValue("Error al crear local");
  }
});

// 🔹 Nuevo thunk: Actualizar Venue + Setting juntos
// 🔹 thunk bien tipado
export const updateVenueSetting = createAsyncThunk<
  VenueSettingResponse, // <-- respuesta tipada
  VenueSettingPayload,  // <-- payload tipado
  { rejectValue: string }
>("venues/updateVenueSetting", async (payload, { rejectWithValue }) => {
  try {
    console.log("Payload en thunk updateVenueSetting:", payload); // Verifica el payload aquí
    const response = await axiosInstance.put("/venues/venue-setting", payload);
    return response.data; // { venue, setting }
  } catch {
    return rejectWithValue("Error al actualizar local y configuración");
  }
});


// 🔹 Actualizar un local
export const updateVenue = createAsyncThunk<
  Venue,
  Partial<Venue>,
  { state: RootState; rejectValue: string }
>("venues/update", async (data, { rejectWithValue }) => {
  try {
    const { _id, ...updateData } = data;
    const response = await axiosInstance.put(`/venues/${_id}`, updateData);
    return response.data.venue;
  } catch {
    return rejectWithValue("Error al actualizar local");
  }
});

// 🔹 Eliminar un local
export const deleteVenue = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("venues/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/venues/${id}`);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar local");
  }
});

// Slice
const venueSlice = createSlice({
  name: "venues",
  initialState,
  reducers: {
    clearVenueMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.venues = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || "Error cargando locales";
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.venues.push(action.payload);
        state.successMessage = "Local creado exitosamente";
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        const index = state.venues.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) {
          state.venues[index] = action.payload;
        }
        state.successMessage = "Local actualizado exitosamente";
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.venues = state.venues.filter((v) => v._id !== action.payload);
        state.successMessage = "Local eliminado exitosamente";
      })
      .addCase(updateVenueSetting.fulfilled, (state) => {
        state.successMessage = "Local y configuración actualizados exitosamente.";
      })
      .addCase(createVenueWithSetting.fulfilled, (state, action) => {
        state.venues.push(action.payload.venue);
        state.successMessage = "Local y configuración creados exitosamente.";
      })
      .addMatcher(
        (action) => action.type.startsWith("venues/") && action.type.endsWith("rejected"),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.errorMessage = action.payload;
        }
      );
  },
});

export const { clearVenueMessages } = venueSlice.actions;
export default venueSlice.reducer;

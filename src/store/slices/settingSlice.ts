// store/slices/settingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

// Interfaces
export interface Setting {
  _id?: string;
  companyId: string;
  venueId?: string | null;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  taxRate: number;
  isTaxIncluded: boolean;
  contactEmail?: string;
  contactPhone?: string;
  fiscalId?: string;
  fiscalAddress?: string;
  country?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SettingState {
  settings: Setting[];
  currentSetting: Setting | null;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: SettingState = {
  settings: [],
  currentSetting: null,
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

// 🔹 Obtener configuración por venueId específico
export const fetchSettingByVenue = createAsyncThunk<
  Setting,
  { venueId: string },
  { state: RootState; rejectValue: string }
>("settings/fetchByVenue", async ({ venueId }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId } = getActiveContext(getState());

    const response = await axiosInstance.get("/settings", {
      params: { companyId: activeCompanyId, venueId },
    });

    const { setting, company } = response.data;

    const enrichedSetting: Setting = {
      ...setting,
      companyName: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    };

    return enrichedSetting;
  } catch {
    return rejectWithValue("Error al obtener configuración por venue");
  }
});


// 🔹 Obtener la configuración de empresa o local (GET /settings)
export const fetchSettingByContext = createAsyncThunk<
  Setting, // Sigue esperando un solo objeto Setting
  void,
  { state: RootState; rejectValue: string }
>("settings/fetchByContext", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/settings", {
      params: { companyId: activeCompanyId, venueId: activeVenueId || null },
    });

    const { setting, company } = response.data;

    // ⏬ Unimos company.name al campo custom "companyName" en setting
    const enrichedSetting: Setting = {
      ...setting,
      companyName: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    };

    return enrichedSetting;
  } catch {
    return rejectWithValue("Error al obtener configuración del contexto");
  }
});


// 🔹 Crear configuración (POST /settings) => Sólo para nuevos locales
export const createSetting = createAsyncThunk<
  Setting,
  Partial<Setting>,
  { state: RootState; rejectValue: string }
>("settings/create", async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.post("/settings", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data.setting; // viene en { message, setting }
  } catch {
    return rejectWithValue("Error al crear configuración");
  }
});

// 🔹 Actualizar configuración (PUT /settings)
export const updateSetting = createAsyncThunk<
  Setting,
  Partial<Setting>,
  { state: RootState; rejectValue: string }
>("settings/update", async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.put("/settings", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId || null,
    });
    return response.data.setting; // viene en { message, setting }
  } catch {
    return rejectWithValue("Error al actualizar configuración");
  }
});

// 🔹 Eliminar configuración (DELETE /settings/:id)
export const deleteSetting = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("settings/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/settings/${id}`);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar configuración");
  }
});

// Slice
const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettingByVenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSetting = action.payload;
      })
      .addCase(fetchSettingByContext.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettingByContext.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSetting = action.payload;
      })
      .addCase(fetchSettingByContext.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || "Error cargando configuración";
      })
      .addCase(createSetting.fulfilled, (state, action) => {
        state.settings.push(action.payload);
        state.successMessage = "Configuración creada exitosamente";
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        if (state.currentSetting && state.currentSetting._id === action.payload._id) {
          state.currentSetting = action.payload;
        }
        const index = state.settings.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.settings[index] = action.payload;
        state.successMessage = "Configuración actualizada exitosamente";
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.settings = state.settings.filter(s => s._id !== action.payload);
        state.successMessage = "Configuración eliminada exitosamente";
      })
      .addMatcher(
        (action) => action.type.startsWith("settings/") && action.type.endsWith("rejected"),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.errorMessage = action.payload;
        }
      );
  },
});

export const { clearSettingMessages } = settingSlice.actions;
export default settingSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

// Interfaces
interface GeneralSettings {
  companyName: string;
  currency: string;
  language: string;
}

interface GeneralSettingsState {
  settings: GeneralSettings | null;
  isLoaded: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: GeneralSettingsState = {
  settings: null,
  isLoaded: false,
  errorMessage: null,
  successMessage: null,
};

// 🔹 FETCH
export const fetchGeneralSettings = createAsyncThunk<
  GeneralSettings,
  void,
  { rejectValue: string; state: RootState }
>(
  'generalSettings/fetchGeneralSettings', 
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/general-settings/general', {
        params: { companyId: activeCompanyId, venueId: activeVenueId },
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error fetching general settings');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);


// 🔹 UPDATE
export const updateGeneralSettings = createAsyncThunk<
  GeneralSettings,
  GeneralSettings,
  { rejectValue: string; state: RootState }
>(
  'generalSettings/updateGeneralSettings',
  async (data, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.put('/general-settings/general', {
        ...data,
        companyId: activeCompanyId,
        venueId: activeVenueId,
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error updating general settings');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

// 🔹 CREATE
export const createGeneralSettings = createAsyncThunk<
  GeneralSettings,
  GeneralSettings,
  { rejectValue: string; state: RootState }
>(
  'generalSettings/createGeneralSettings',
  async (data, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.post('/general-settings/general', {
        ...data,
        companyId: activeCompanyId,
        venueId: activeVenueId,
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error creating general settings');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);



// Slice
const generalSettingsSlice = createSlice({
  name: 'generalSettings',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeneralSettings.pending, (state) => {
        state.isLoaded = false;
        state.errorMessage = null;
      })
      .addCase(fetchGeneralSettings.fulfilled, (state, action: PayloadAction<GeneralSettings>) => {
        state.isLoaded = true;
        state.settings = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchGeneralSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoaded = true;
        state.errorMessage = action.payload || 'Error fetching general settings';
      })
      .addCase(updateGeneralSettings.fulfilled, (state, action: PayloadAction<GeneralSettings>) => {
        state.settings = action.payload;
        state.successMessage = 'General settings updated successfully';
      })
      .addCase(updateGeneralSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error updating general settings';
      })
      .addCase(createGeneralSettings.fulfilled, (state, action: PayloadAction<GeneralSettings>) => {
        state.settings = action.payload;
        state.successMessage = 'General settings created successfully';
      })
      .addCase(createGeneralSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error creating general settings';
      });
  },
});

export const { clearMessages } = generalSettingsSlice.actions;
export default generalSettingsSlice.reducer;
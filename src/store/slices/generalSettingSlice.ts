import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

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

// Thunks
export const fetchGeneralSettings = createAsyncThunk<
  GeneralSettings,
  void,
  { rejectValue: string }
>("generalSettings/fetchGeneralSettings", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/settings/general");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching general settings");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateGeneralSettings = createAsyncThunk<
  GeneralSettings,
  GeneralSettings,
  { rejectValue: string }
>("generalSettings/updateGeneralSettings", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put("/settings/general", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating general settings");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const createGeneralSettings = createAsyncThunk<
  GeneralSettings,
  GeneralSettings,
  { rejectValue: string }
>("generalSettings/createGeneralSettings", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/settings/general", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error creating general settings");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const generalSettingsSlice = createSlice({
  name: "generalSettings",
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
        state.errorMessage = action.payload || "Error fetching general settings";
      })
      .addCase(updateGeneralSettings.pending, (state) => {
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(updateGeneralSettings.fulfilled, (state, action: PayloadAction<GeneralSettings>) => {
        state.settings = action.payload;
        state.successMessage = "General settings updated successfully";
      })
      .addCase(updateGeneralSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating general settings";
      })
      .addCase(createGeneralSettings.pending, (state) => {
        state.errorMessage = null;
        state.successMessage = null;
      })
      .addCase(createGeneralSettings.fulfilled, (state, action: PayloadAction<GeneralSettings>) => {
        state.settings = action.payload;
        state.successMessage = "General settings created successfully";
      })
      .addCase(createGeneralSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating general settings";
      });
  },
});

export const { clearMessages } = generalSettingsSlice.actions;
export default generalSettingsSlice.reducer;
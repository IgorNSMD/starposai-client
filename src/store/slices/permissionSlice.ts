import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import axios from "axios";

// Interfaces
interface Permission {
  id: string;
  key: string;
  description: string;
}

interface PermissionState {
  isLoaded: boolean;
  permissions: Permission[];
  permissionInfo: Permission | null;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: PermissionState = {
  isLoaded: false,
  permissions: [],
  permissionInfo: null,
  errorMessage: null,
  successMessage: null,
};

// Función para extraer mensajes de error
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Error de Axios";
  }
  return "Error desconocido";
};

// Thunks
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/permissions");
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchPermissionById = createAsyncThunk<
  Permission,
  string,
  { rejectValue: string }
>("permissions/fetchPermissionById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/permissions/${id}`);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const createPermission = createAsyncThunk<
  Permission,
  { key: string; description: string },
  { rejectValue: string }
>("permissions/createPermission", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/permissions", data);
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const updatePermission = createAsyncThunk<
  Permission,
  { id: string; key: string; description: string },
  { rejectValue: string }
>("permissions/updatePermission", async ({ id, key, description }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/permissions/${id}`, { key, description });
    return response.data;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const deletePermission = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("permissions/deletePermission", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/permissions/${id}`);
    return id;
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

// Slice
const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.isLoaded = true;
        state.permissions = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchPermissions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading permissions";
      })
      .addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.permissions.push(action.payload);
        state.successMessage = "Permission created successfully";
        state.errorMessage = null;
      })
      .addCase(createPermission.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating permission";
      })
      .addCase(updatePermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.permissions = state.permissions.map((perm) =>
          perm.id === action.payload.id ? action.payload : perm
        );
        state.successMessage = "Permission updated successfully";
        state.errorMessage = null;
      })
      .addCase(updatePermission.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating permission";
      })
      .addCase(deletePermission.fulfilled, (state, action: PayloadAction<string>) => {
        state.permissions = state.permissions.filter((perm) => perm.id !== action.payload);
        state.successMessage = "Permission deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deletePermission.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting permission";
      });
  },
});

export const { clearMessages } = permissionSlice.actions;
export default permissionSlice.reducer;
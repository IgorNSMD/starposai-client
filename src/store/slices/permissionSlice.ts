import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Interfaces
interface Permission {
  _id: string;
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


// Thunks
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/permissions");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (permissions/fetchPermissions)');
    }
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
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (permissions/fetchPermissionById)');
    }
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
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (permissions/createPermission)');
    }
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
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (permissions/updatePermission)');
    }
  }
});

export const deletePermission = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("permissions/deletePermission", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/permissions/${id}`);
    return id; // Devuelve el ID eliminado en caso de éxito
  } catch (error) {
    // Manejo del error con `isAxiosError` desde la instancia extendida
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting permission");
    }
    return rejectWithValue("Unknown error occurred");
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
          perm._id === action.payload._id ? action.payload : perm
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
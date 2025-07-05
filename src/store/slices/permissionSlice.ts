import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

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
  { rejectValue: string; state: RootState }
>("permissions/fetchPermissions", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.get(`/permissions`, {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "(permissions/fetchPermissions)");
    }
    return rejectWithValue("Error desconocido");
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
  { rejectValue: string; state: RootState }
>("permissions/createPermission", async (data, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const payload = {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      ...data,
    };

    const response = await axiosInstance.post("/permissions", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "(permissions/createPermission)");
    }
    return rejectWithValue("Error desconocido al crear el permiso.");
  }
});


export const updatePermission = createAsyncThunk<
  Permission,
  { id: string; key: string; description: string; global?: boolean },
  { rejectValue: string; state: RootState }
>("permissions/updatePermission", async ({ id, key, description, global = false }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const payload = {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      key,
      description,
      global,
    };

    const response = await axiosInstance.put(`/permissions/${id}`, payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "(permissions/updatePermission)");
    }
    return rejectWithValue("Error desconocido al actualizar el permiso.");
  }
});


export const deletePermission = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("permissions/deletePermission", async (id, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    await axiosInstance.delete(`/permissions/${id}`, {
      data: { companyId: activeCompanyId, venueId: activeVenueId },
    });

    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar el permiso.");
    }
    return rejectWithValue("Error desconocido al eliminar el permiso.");
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
        state.permissions = state.permissions.filter((perm) => perm._id !== action.payload);
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
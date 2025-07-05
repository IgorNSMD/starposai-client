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

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

interface RoleState {
    isLoaded: boolean;
    roles: Role[];
    roleInfo: Role | null;
    permissions: Permission[]; // Agregamos los permisos aquí
    errorMessage: string | null;
    successMessage: string | null;
  }

const initialState: RoleState = {
  isLoaded: false,
  roles: [],
  roleInfo: null,
  permissions: [],
  errorMessage: null,
  successMessage: null,
};

// Thunks
// Thunks
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string; state: RootState }
>("permissions/fetchPermissions", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/permissions", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching permissions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Thunks
export const fetchRoles = createAsyncThunk<
  Role[],
  { companyId: string; venueId?: string },
  { rejectValue: string }
>("roles/fetchRoles", async ({ companyId, venueId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/roles", {
      params: { companyId, venueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching roles");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const createRole = createAsyncThunk<
  Role,
  { name: string; permissions: string[] },
  { rejectValue: string; state: RootState }
>("roles/createRole", async (data, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const payload = { ...data, companyId: activeCompanyId, venueId: activeVenueId };
    const response = await axiosInstance.post("/roles", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error creating role");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const updateRole = createAsyncThunk<
  Role,
  { id: string; name: string; permissions: string[] },
  { rejectValue: string; state: RootState }
>("roles/updateRole", async ({ id, name, permissions }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const payload = { name, permissions, companyId: activeCompanyId, venueId: activeVenueId };
    const response = await axiosInstance.put(`/roles/${id}`, payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating role");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteRole = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("roles/deleteRole", async (id, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    await axiosInstance.delete(`/roles/${id}`, {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting role");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.isLoaded = true;
        state.roles = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchRoles.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading roles";
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles.push(action.payload);
        state.successMessage = "Role created successfully";
        state.errorMessage = null;
      })
      .addCase(createRole.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating role";
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles = state.roles.map((role) =>
          role._id === action.payload._id ? action.payload : role
        );
        state.successMessage = "Role updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateRole.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating role";
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<string>) => {
        state.roles = state.roles.filter((role) => role._id !== action.payload);
        state.successMessage = "Role deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteRole.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting role";
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.errorMessage = null;
      })
  },
});

export const { clearMessages } = roleSlice.actions;
export default roleSlice.reducer;
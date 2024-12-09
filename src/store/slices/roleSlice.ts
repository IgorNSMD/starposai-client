import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

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
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/permissions");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error fetching permisions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Thunks
export const fetchRoles = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>("roles/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/roles");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching roles");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const createRole = createAsyncThunk<
  Role,
  { name: string; permissions: string[] },
  { rejectValue: string }
>("roles/createRole", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/roles", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error creating role");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateRole = createAsyncThunk<
  Role,
  { id: string; name: string; permissions: string[] },
  { rejectValue: string }
>("roles/updateRole", async ({ id, name, permissions }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/roles/${id}`, { name, permissions });
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
  { rejectValue: string }
>("roles/deleteRole", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/roles/${id}`);
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
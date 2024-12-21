import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";

interface Role {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string
}

interface UserState {
  isLoaded: boolean;
  users: User[];
  userInfo: Role | null;
  roles: Role[]; // Agregamos los permisos aquí
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  isLoaded: false,
  users: [],
  userInfo: null,
  roles: [],
  errorMessage: null,
  successMessage: null,
};

// Thunks
export const fetchRoles = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>("users/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/roles");
    // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
    const data = response.data.map((role: Role) => ({
      _id: role._id, // Cambia `_id` a `id`
      name: role.name, // Conserva el campo `label`
    }));
    //console.log('data::', data)  
    return data; // Devuelve solo `id` y `label`

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching roles");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Thunks
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/users");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching users");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; name: string; email: string; role: string },
  { rejectValue: string }
>("users/updateUser", async ({ id, name, email, role }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, { name, email, role });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating user");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting user");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

const userSlice = createSlice({
  name: 'users',
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
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoaded = true;
        state.users = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading users";
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        state.successMessage = "Role updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating role";
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
        state.successMessage = "User deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting user";
      })
  },
});

export const { clearMessages } = userSlice.actions;
export default userSlice.reducer;
// 📂 src/redux/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance';


export interface NewUser {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  password?: string
}

// 🔹 Estado inicial
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Thunk multiempresa
export const fetchUsers = createAsyncThunk<
  User[], // Tipo de retorno
  { companyId: string; venueId?: string }, // Parámetros que recibe
  { rejectValue: string } // Error personalizado
>("users/fetchUsers", async ({ companyId, venueId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/users", {
      params: {
        companyId,
        venueId,
      },
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching users");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const registerUser = createAsyncThunk<
  User, // Tipo de retorno
  { userData: NewUser; companyId: string; venueId?: string }, // Parámetros
  { rejectValue: string } // Tipo de error
>("user/registerUser", async ({ userData, companyId, venueId }, { rejectWithValue }) => {
  try {
    // 🔹 Construimos el payload con estructura multiempresa
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      companyVenues: [
        {
          companyId,
          venueId,
          role: userData.role,
        }
      ]
    };

    const response = await axiosInstance.post("/users/register", payload);
    
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al registrar usuario");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateUser = createAsyncThunk<
  User,
  {
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    companyId: string;
    venueId?: string;
  },
  { rejectValue: string }
>("users/updateUser", async ({ id, companyId, venueId, ...data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, {
      ...data,
      companyId,
      venueId,
    });
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
  { id: string; companyId: string; venueId?: string },
  { rejectValue: string }
>("users/deleteUser", async ({ id, companyId, venueId }, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/users/${id}`, {
      params: { companyId, venueId }
    });
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting user");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 Slice de usuario
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
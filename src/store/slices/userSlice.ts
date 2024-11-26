import { createSlice, createAsyncThunk, SerializedError } from '@reduxjs/toolkit';
import axios from 'axios';

interface UserState {
  user: string | null;
  token: string | null;
  loading: boolean;
  error: string | SerializedError | null; // Ajuste en el tipo de error
  isAuthenticated: boolean; // Asegúrate de que esta propiedad esté aquí
}

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false, // Valor inicial
};

export const loginUser = createAsyncThunk<
  { user: string; token: string },
  { email: string; password: string },
  { rejectValue: string }
>(
  'user/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/login', userData);
      return response.data;
    } catch {
      return rejectWithValue('Error al iniciar sesión');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false; 
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true; 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido';
        state.isAuthenticated = false; 
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
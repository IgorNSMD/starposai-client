import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  userInfo: { id: string; email: string; role: string } | null;
  token: string | null;
  errorMessage: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userInfo: null,
  token: null,
  errorMessage: null,
};

// Thunk para registrar usuario
export const registerUser = createAsyncThunk<
  void, // El caso `fulfilled` no devuelve datos (puede ser `void`)
  { name: string; email: string; password: string }, // Argumentos del thunk
  { rejectValue: string } // Tipo del valor en caso de error
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    await axios.post('http://localhost:4000/api/users/register', userData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Verifica si el error es de Axios y accede a las propiedades específicas
      return rejectWithValue(error.response?.data?.message || 'Error al registrar usuario');
    }
  }
});

// Thunk para iniciar sesión
export const loginUser = createAsyncThunk<
  { token: string; id: string; email: string; role: string }, // Tipo para el caso `fulfilled`
  { email: string; password: string }, // Argumentos del thunk
  { rejectValue: string } // Tipo para el caso `rejected`
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:4000/api/users/login', credentials);
    return response.data; // Supongamos que la API devuelve `{ token, id, email, role }`
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Verifica si el error es de Axios y accede a las propiedades específicas
      return rejectWithValue(error.response?.data?.message || 'Error al registrar usuario');
    }
  }
});

// Slice de autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Registro exitoso no utiliza `action`, se puede omitir
      .addCase(registerUser.fulfilled, (state) => {
        state.errorMessage = null;
      })
      // Registro fallido
      .addCase(registerUser.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error desconocido'; // Maneja el caso en que `payload` sea `undefined`
      })
      // Login exitoso
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userInfo = { id: action.payload.id, email: action.payload.email, role: action.payload.role };
        state.errorMessage = null;
      })
      // Login fallido
      .addCase(loginUser.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error desconocido al iniciar sesión';
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
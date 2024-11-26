import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define la estructura de los datos de autenticación
interface AuthState {
  user: { id: string; name: string; email: string } | null; // Cambia según los datos reales
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define el estado inicial
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: Boolean(localStorage.getItem('user')),
  isLoading: false,
  error: null,
};

// Define el tipo del payload esperado en el login
interface LoginPayload {
  id: string;
  name: string;
  email: string;
}

// Define las credenciales para login
interface LoginCredentials {
  email: string;
  password: string;
}

// Async Thunk para login
export const login = createAsyncThunk<
  LoginPayload, // Tipo de retorno esperado en caso de éxito
  LoginCredentials, // Tipo de los argumentos esperados
  { rejectValue: string } // Tipo del valor devuelto en caso de error
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data: LoginPayload = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

// Slice para manejar la autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginPayload>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || 'Error desconocido';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
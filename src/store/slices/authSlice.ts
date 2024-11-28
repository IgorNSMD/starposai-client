import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import axiosInstance from '../../api/axiosInstance';

interface AuthState {
  isAuthenticated: boolean;
  userInfo: { id: string; email: string; role: string } | null;
  token: string | null;
  errorMessage: string | null;
  successMessage: string | null; // Nuevo campo para mensajes de éxito
}

const initialState: AuthState = {
  isAuthenticated: false,
  userInfo: null,
  token: null,
  errorMessage: null,
  successMessage: null, // Inicializado como `null`
};

// Interfaz para los argumentos del thunk
interface RegisterUserArgs {
  name: string;
  email: string;
  password: string;
}

// Interfaz para el payload del login exitoso
interface LoginSuccessPayload {
  token: string;
  id: string;
  email: string;
  role: string;
}

// Thunk para registrar usuario
export const registerUser = createAsyncThunk<
  void, // El caso `fulfilled` no devuelve datos (puede ser `void`)
  RegisterUserArgs, // Argumentos del thunk
  { rejectValue: string } // Tipo del valor en caso de error
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    console.log('axios.post...',userData)
    console.log('Base URL:', axiosInstance.defaults.baseURL);
    await axiosInstance.post('/users/register', userData);
    console.log('save data...')
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al registrar usuario');
    }
  }
});

// Thunk para iniciar sesión
export const loginUser = createAsyncThunk<
  LoginSuccessPayload, // Tipo para el caso `fulfilled`
  { email: string; password: string }, // Argumentos del thunk
  { rejectValue: string } // Tipo para el caso `rejected`
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/login', credentials);
    return response.data; // Supongamos que la API devuelve `{ token, id, email, role }`
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar sesión');
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
    clearErrorMessage(state) {
      state.errorMessage = null; // Limpia el mensaje de error
    },
    clearSuccessMessage(state) {
      state.successMessage = null; // Limpia el mensaje de éxito
    },
    clearMessages(state){
      state.errorMessage = null
      state.successMessage = null; // Limpia el mensaje de éxito
  },
  },
  extraReducers: (builder) => {
    builder
      // Registro exitoso no utiliza `action`, se puede omitir
      .addCase(registerUser.fulfilled, (state) => {
        state.successMessage = 'Registro exitoso'; // Mensaje de éxito
        state.errorMessage = null;
      })
      // Registro fallido
      .addCase(registerUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error desconocido'; // Maneja el caso en que `payload` sea `undefined`
        state.successMessage = null; // Asegura que el mensaje de éxito esté limpio
      })
      // Login exitoso
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginSuccessPayload>) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userInfo = {
          id: action.payload.id,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.errorMessage = null;
        state.successMessage = 'Inicio de sesión exitoso'; // Mensaje de éxito
      })
      // Login fallido
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error desconocido al iniciar sesión';
        state.successMessage = null; // Limpia el mensaje de éxito
      });
  },
});

export const { logout, clearErrorMessage, clearSuccessMessage, clearMessages } = authSlice.actions;
export default authSlice.reducer;
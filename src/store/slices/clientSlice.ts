import { createSlice, createAsyncThunk  } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export interface Client {
  _id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  status: 'active' | 'inactive';
}

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: ClientState = {
  clients: [],
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

export const searchClients = createAsyncThunk<
  Client[],
  { name?: string; rut?: string },
  { rejectValue: string }
>('clients/search', async (filters, thunkAPI) => {
  try {
    console.log('(searchClients) ->', filters)
    const response = await axiosInstance.get('/clients/search', {
      params: { ...filters, status: 'active' }, // Asegúrate de incluir el estado 'active'
    });

    console.log('response.data', response.data)

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Error al buscar clients'
      );
    }
  }
});

// ** Fetch all clients
export const fetchClients = createAsyncThunk<Client[], { status?: string }>(
  'clients/fetchClients',
  async ({ status } = {}, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/clients', {
        params: { status }, // Pasar los parámetros de consulta
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al obtener los clientes');
      }
    }
  }
);

// ** Create a client
export const createClient = createAsyncThunk<Client, Partial<Client>>(
  'clients/create',
  async (clientData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/clients', clientData);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al crear el cliente');
      }
    }
  }
);

// ** Update a client
export const updateClient = createAsyncThunk<Client, { id: string; data: Partial<Client> }>(
  'clients/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al actualizar el cliente');
      }
    }
  }
);

// ** Delete a client (logical delete)
export const changeClientStatus = createAsyncThunk<Client, { id: string; status: 'active' | 'inactive' }>(
  'clients/changeStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(`/clients/${id}/status`, { status });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al cambiar el estado del cliente');
      }
    }
  }
);

// Slice de clientes
const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload);
        state.successMessage = 'Cliente creado exitosamente';
        state.errorMessage = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        state.successMessage = 'Cliente actualizado exitosamente';
        state.errorMessage = null;
      })
      .addCase(changeClientStatus.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index].status = action.payload.status;
        }
      })
      .addCase(searchClients.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(searchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload; // Actualiza los clientes con el resultado de la búsqueda
      })
      .addCase(searchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })      
      .addMatcher(
        (action): action is { type: string; payload: string } => action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.errorMessage = action.payload;
        }
      );
  },
});

export const { clearMessages } = clientSlice.actions;

export default clientSlice.reducer;

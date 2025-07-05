import { createSlice, createAsyncThunk  } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { getActiveContext } from '../../utils/getActiveContext';
import { RootState } from '../store';

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

// 🔹 Buscar clientes
export const searchClients = createAsyncThunk<
  Client[],
  { name?: string; rut?: string },
  { rejectValue: string; state: RootState }
>('clients/search', async (filters, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.get('/clients/search', {
      params: { ...filters, companyId: activeCompanyId, venueId: activeVenueId, status: 'active' },
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar clientes');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// 🔹 Obtener clientes
export const fetchClients = createAsyncThunk<
  Client[],
  { status?: string },
  { rejectValue: string; state: RootState }
>('clients/fetchClients', async ({ status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.get('/clients', {
      params: { companyId: activeCompanyId, venueId: activeVenueId, status },
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener los clientes');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// 🔹 Crear cliente
export const createClient = createAsyncThunk<
  Client,
  Partial<Client>,
  { rejectValue: string; state: RootState }
>('clients/create', async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.post('/clients', {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear el cliente');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// 🔹 Actualizar cliente
export const updateClient = createAsyncThunk<
  Client,
  { id: string; data: Partial<Client> },
  { rejectValue: string; state: RootState }
>('clients/update', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.put(`/clients/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data.client;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar el cliente');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// 🔹 Cambiar estado
export const changeClientStatus = createAsyncThunk<
  Client,
  { id: string; status: 'active' | 'inactive' },
  { rejectValue: string; state: RootState }
>('clients/changeStatus', async ({ id, status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.patch(`/clients/${id}/status`, {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      status,
    });

    return response.data.client;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al cambiar el estado del cliente');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// Slice
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
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        state.successMessage = 'Cliente actualizado exitosamente';
      })
      .addCase(changeClientStatus.fulfilled, (state, action) => {
        const updatedClient = action.payload;
        state.clients = state.clients.filter(client => client._id !== updatedClient._id);
        state.successMessage = 'Cliente desactivado exitosamente';
      })
      .addCase(searchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = action.payload;
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

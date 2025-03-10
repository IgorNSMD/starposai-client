import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Modelo de Proveedor
export interface Provider {
  _id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  status: 'active' | 'inactive';
}

// Estado inicial
interface ProviderState {
  providers: Provider[];
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: ProviderState = {
  providers: [],
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

export const searchProviders = createAsyncThunk<
  Provider[],
  { name?: string; rut?: string },
  { rejectValue: string }
>('providers/search', async (filters, thunkAPI) => {
  try {
    //console.log('(searchProviders) ->', filters)
    const response = await axiosInstance.get('/providers/search', {
      params: { ...filters, status: 'active' }, // Asegúrate de incluir el estado 'active'
    });

    //console.log('response.data', response.data)

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Error al buscar providers'
      );
    }
  }
});

// Thunks
export const fetchProviders = createAsyncThunk<Provider[], { status?: string }>(
  'providers/fetchProviders',
  async ({ status } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/providers', {
        params: { status }, // Pasar los parámetros de consulta
      });
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error fetching providers");
         }
        return rejectWithValue("Unknown error occurred");
    }
  }
);

export const createProvider = createAsyncThunk<Provider, Partial<Provider>>(
  'providers/create',
  async (providerData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/providers', providerData);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            //console.log('error.response?.data?.message ->', error.response?.data?.message)
            return rejectWithValue(error.response?.data?.message || " Error create provider");
         }
        return rejectWithValue("Unknown error occurred");
    }
  }
);

export const updateProvider = createAsyncThunk<Provider, { id: string; data: Partial<Provider> }>(
  'providers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/providers/${id}`, data);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error update provider");
         }
        return rejectWithValue("Unknown error occurred");
    }
  }
);

export const changeProviderStatus = createAsyncThunk<
  Provider,
  { id: string; status: 'active' | 'inactive' }
>('providers/changeStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/providers/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error change provider");
     }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(createProvider.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.providers.push(action.payload);
        state.successMessage = 'Proveedor creado con éxito';
        state.errorMessage = null;
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(updateProvider.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(updateProvider.fulfilled, (state, action) => {
        const index = state.providers.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.providers[index] = action.payload;
        }
        state.successMessage = 'Proveedor actualizado con éxito';
        state.errorMessage = null;
      })
      .addCase(updateProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      // Change Provider Status
      .addCase(changeProviderStatus.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })      
      .addCase(changeProviderStatus.fulfilled, (state, action) => {
        const index = state.providers.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.providers[index].status = action.payload.status;
        }
      })
      .addCase(changeProviderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(searchProviders.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(searchProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload; // Actualiza los productos con el resultado de la búsqueda
      })
      .addCase(searchProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { clearMessages } = providerSlice.actions;
export default providerSlice.reducer;
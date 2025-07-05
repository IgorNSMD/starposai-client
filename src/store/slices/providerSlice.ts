import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from '../store';
import { getActiveContext } from '../../utils/getActiveContext';

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
  isTaxIncluded?: boolean; // ✅ Nuevo campo opcional
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

// Thunks
export const fetchProviders = createAsyncThunk<
  Provider[],
  void,
  { state: RootState; rejectValue: string }
>('providers/fetchProviders', async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/providers', {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching providers');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const createProvider = createAsyncThunk<
  Provider,
  Partial<Provider>,
  { state: RootState; rejectValue: string }
>('providers/create', async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.post('/providers', {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error creating provider');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const updateProvider = createAsyncThunk<
  Provider,
  { id: string; data: Partial<Provider> },
  { state: RootState; rejectValue: string }
>('providers/update', async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.put(`/providers/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error updating provider');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const changeProviderStatus = createAsyncThunk<
  Provider,
  { id: string; status: 'active' | 'inactive' },
  { state: RootState; rejectValue: string }
>('providers/changeStatus', async ({ id, status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.patch(`/providers/${id}/status`, {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      status,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error changing provider status');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const searchProviders = createAsyncThunk<
  Provider[],
  { name?: string; rut?: string },
  { rejectValue: string; state: RootState }
>('providers/search', async (filters, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/providers/search', {
      params: { ...filters, companyId: activeCompanyId, venueId: activeVenueId, status: 'active' },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error searching providers');
    }
    return rejectWithValue('Unknown error occurred');
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
      })
      .addCase(fetchProviders.fulfilled, (state, action: PayloadAction<Provider[]>) => {
        state.isLoading = false;
        state.providers = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Error fetching providers';
      })
      .addCase(createProvider.fulfilled, (state, action: PayloadAction<Provider>) => {
        state.providers.push(action.payload);
        state.successMessage = 'Proveedor creado con éxito';
      })
      .addCase(createProvider.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error creating provider';
      })
      .addCase(updateProvider.fulfilled, (state, action: PayloadAction<Provider>) => {
        const index = state.providers.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.providers[index] = action.payload;
        }
        state.successMessage = 'Proveedor actualizado con éxito';
      })
      .addCase(updateProvider.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error updating provider';
      })
      .addCase(changeProviderStatus.fulfilled, (state, action: PayloadAction<Provider>) => {
        const index = state.providers.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.providers[index].status = action.payload.status;
        }
      })
      .addCase(changeProviderStatus.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error changing status';
      })
      .addCase(searchProviders.fulfilled, (state, action: PayloadAction<Provider[]>) => {
        state.providers = action.payload;
      })
      .addCase(searchProviders.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error searching providers';
      });
  },
});

export const { clearMessages } = providerSlice.actions;
export default providerSlice.reducer;

// src/store/slices/taxRateSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Interfaz para TaxRate
export interface TaxRate {
  _id: string;
  name: string;
  country: string;
  type: 'PurchaseOrder' | 'SalesOrder';
  rate: number;
  appliesTo: string[]; // ← ✅ AÑADIR ESTA LÍNEA
  isActive: boolean;
}

// Estado inicial del slice
interface TaxRateState {
  taxRates: TaxRate[];
  loading: boolean;
  error: string | null;
}

const initialState: TaxRateState = {
  taxRates: [],
  loading: false,
  error: null,
};

// Thunk para obtener todos los taxRates
export const fetchTaxRates = createAsyncThunk<TaxRate[]>(
  'taxRates/fetchTaxRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/taxrates');
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || '(taxRates/fetchTaxRates)');
      }
    }
  }
);

// Crear slice
const taxRateSlice = createSlice({
  name: 'taxRates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTaxRates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTaxRates.fulfilled, (state, action: PayloadAction<TaxRate[]>) => {
      state.loading = false;
      state.taxRates = action.payload;
    });
    builder.addCase(fetchTaxRates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Exportar reducer
export const taxRateReducer = taxRateSlice.reducer;
export default taxRateSlice.reducer;

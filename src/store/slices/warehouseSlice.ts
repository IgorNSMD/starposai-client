import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export interface Warehouse {
  _id: string;
  name: string;
}

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  error: null,
};

// Thunk para obtener los almacenes activos
export const fetchWarehouses = createAsyncThunk('warehouses/fetch', async (_, { rejectWithValue }) => {
  try {
    console.log('fetchWarehouses initial...')
    const response = await axiosInstance.get('/warehouses');
    console.log('fetchWarehouses response.data', response.data)
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        console.log('fetchWarehouses axiosInstance.isAxiosError?.(error)', error.response?.data?.message)
        return rejectWithValue(error.response?.data?.message || "Error al obtener almacenes");
      }
      console.log('fetchWarehouses Unknown error occurred')
      return rejectWithValue("Unknown error occurred");        

  }
});

const warehouseSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default warehouseSlice.reducer;
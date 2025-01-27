import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Definir interfaces
export interface InventoryMovement {
  _id: string;
  productId: { _id: string; name: string };
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
}

interface InventoryMovementState {
  movements: InventoryMovement[];
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

// Estado inicial
const initialState: InventoryMovementState = {
  movements: [],
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

// Thunks
export const fetchInventoryMovements = createAsyncThunk<
  InventoryMovement[],
  { productId?: string; type?: string },
  { rejectValue: string }
>('inventoryMovements/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/inventory-movements', { params: filters });
    return response.data.movements;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error fetching inventory movements');
    }
  }
});

export const createInventoryMovement = createAsyncThunk<
  InventoryMovement,
  Partial<InventoryMovement>,
  { rejectValue: string }
>('inventoryMovements/create', async (movementData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/inventory-movements/create', movementData);
    return response.data.movement;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error creating inventory movements');
    }
  }
});

// Slice
const inventoryMovementSlice = createSlice({
  name: 'inventoryMovements',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryMovements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInventoryMovements.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.isLoading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryMovements.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Error fetching inventory movements';
      })
      .addCase(createInventoryMovement.fulfilled, (state, action: PayloadAction<InventoryMovement>) => {
        state.movements.push(action.payload);
        state.successMessage = 'Inventory movement created successfully';
      })
      .addCase(createInventoryMovement.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error creating inventory movement';
      });
  },
});

export const { clearMessages } = inventoryMovementSlice.actions;
export default inventoryMovementSlice.reducer;
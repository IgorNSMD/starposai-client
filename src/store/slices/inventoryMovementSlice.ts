import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const API_URL = '/api/inventory/movements';

// Interfaces para tipado
interface InventoryMovement {
  _id: string;
  warehouse: string;
  referenceId: string;
  referenceType: 'Product' | 'Kit';
  sourceType: 'PurchaseOrder' | 'SalesOrder' | 'Manual' | 'Adjustment' | 'Disassembly' | 'Return';
  sourceId?: string;
  type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'disassembly';
  quantity: number;
  reason?: string;
  linkedMovementId?: string;
  status: 'pending' | 'validated' | 'cancelled';
  date: string;
  createdBy: string;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  kitComponents?: { productId: string; quantity: number }[];
}

interface InventoryState {
  movements: InventoryMovement[];
  loading: boolean;
  error: string | null;
}

// Obtener movimientos de inventario
export const fetchInventoryMovements = createAsyncThunk<
  InventoryMovement[],
  void,
  { rejectValue: string }
>('inventory/fetchMovements', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data.movements;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener movimientos ");
    }
    return rejectWithValue("Unknown error occurred");    
  }
});

// Crear un nuevo movimiento de inventario
export const createInventoryMovement = createAsyncThunk<
  InventoryMovement,
  Partial<InventoryMovement>,
  { rejectValue: string }
>('inventory/createMovement', async (movementData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_URL, movementData);
    return response.data.movement;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al crear movimiento");
    }
    return rejectWithValue("Unknown error occurred");    
  }
});

// Actualizar un movimiento de inventario
export const updateInventoryMovement = createAsyncThunk<
  InventoryMovement,
  { id: string; updateData: Partial<InventoryMovement> },
  { rejectValue: string }
>('inventory/updateMovement', async ({ id, updateData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, updateData);
    return response.data.movement;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al actualizar movimiento");
    }
    return rejectWithValue("Unknown error occurred");    
  }
});

// Eliminar un movimiento de inventario
export const deleteInventoryMovement = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('inventory/deleteMovement', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar movimiento");
    }
    return rejectWithValue("Unknown error occurred");    
  }
});

const initialState: InventoryState = {
  movements: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryMovements.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryMovements.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Error desconocido';
      })
      .addCase(createInventoryMovement.fulfilled, (state, action: PayloadAction<InventoryMovement>) => {
        state.movements.push(action.payload);
      })
      .addCase(updateInventoryMovement.fulfilled, (state, action: PayloadAction<InventoryMovement>) => {
        const index = state.movements.findIndex(mov => mov._id === action.payload._id);
        if (index !== -1) {
          state.movements[index] = action.payload;
        }
      })
      .addCase(deleteInventoryMovement.fulfilled, (state, action: PayloadAction<string>) => {
        state.movements = state.movements.filter(mov => mov._id !== action.payload);
      });
  }
});

export const { clearMessages } = inventorySlice.actions;
export default inventorySlice.reducer;
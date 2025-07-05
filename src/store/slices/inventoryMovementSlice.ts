import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { getActiveContext } from '../../utils/getActiveContext';
import { RootState } from '../store';

export interface GenericOutputParams {
  companyId: string;
  venueId: string;
  userId: string;
  sourceType: 'Loss' | 'SelfConsumption';
  reason?: string;
  movementType: 'Output';
  items: {
    productId: string;
    quantity: number;
  }[];
}

// Interfaces para tipado
interface InventoryMovement {
  _id: string;
  venueId?: string;
  warehouse: string;
  referenceId: string;
  referenceType: 'Product' | 'Kit';
  sourceType: 'PurchaseOrder' | 'SalesOrder' | 'Manual' | 'Adjustment' | 'Disassembly' | 'Return'| 'Transfer';
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

export interface InventoryReviewItem {
  id: string;
  referenceId: string;  
  referenceType: 'Product' | 'Kit';
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  revisedQuantity?: number;
  difference?: number;
}

interface InventoryState {
  movements: InventoryMovement[];
  reviewStock: InventoryReviewItem[]; // 👈 nuevo campo
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const inventoryInitialState: InventoryState = {
  movements: [],
  reviewStock: [], // 👈 inicializar
  loading: false,
  errorMessage: null,
  successMessage: null,
};

export const createOutput = createAsyncThunk<
  InventoryMovement[], // respuesta del backend
  Omit<GenericOutputParams, 'companyId' | 'venueId' | 'userId'>, // lo que recibe el thunk (sin contexto)
  { state: RootState; rejectValue: string }
>('inventory/createOutput', async (data, { getState, rejectWithValue }) => {
  const { activeCompanyId, activeVenueId, activeUserId } = getActiveContext(getState());

  try {
    const payload: GenericOutputParams = {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
      userId: activeUserId,
      movementType: 'Output',
    };

    const response = await axiosInstance.post('/inventory-movements', payload);

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error createOutput');
    }
    return rejectWithValue('Error al registrar salida de inventario');
  }
});



export const fetchInventoryReviewStock = createAsyncThunk<
  InventoryReviewItem[],
  void,
  { state: RootState; rejectValue: string }
>(
  'inventory/fetchReviewStock',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/inventory-movements/review-stock', {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
        },
      });
      return response.data.reviewStock;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al cargar stock para revisión');
      }
      return rejectWithValue('Error desconocido');
    }
  }
);

export const createInventoryTransfer = createAsyncThunk<
  InventoryMovement[], // la respuesta será un array con dos movimientos
  Partial<InventoryMovement>,
  { state: RootState; rejectValue: string }
>(
  'inventory/createTransfer',
  async (movementData, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.post('/inventory-movements', {
        ...movementData,
        sourceType: 'Transfer',
        companyId: activeCompanyId,
        venueId: activeVenueId,
      });
      return response.data.movements; // 👈 entrada y salida
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al registrar transferencia');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

export const fetchInventoryDisassembly = createAsyncThunk<
  InventoryMovement[],
  void,
  { state: RootState; rejectValue: string }
>(
  'inventory/fetchInventoryDisassembly',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/inventory-movements', {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
          type: 'disassembly',
        },
      });
      return response.data.movements;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al obtener ajustes');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

export const fetchInventoryTranfers = createAsyncThunk<
  InventoryMovement[],
  void,
  { state: RootState; rejectValue: string }
>(
  'inventory/fetchInventoryTrasnfers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/inventory-movements', {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
          type: 'transfer',
        },
      });
      return response.data.movements;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al obtener ajustes');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

export const fetchInventoryAdjustments = createAsyncThunk<
  InventoryMovement[],
  void,
  { state: RootState; rejectValue: string }
>(
  'inventory/fetchAdjustments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/inventory-movements', {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
          type: 'adjustment',
        },
      });
      return response.data.movements;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al obtener ajustes');
      }
      return rejectWithValue('Unknown error');
    }
  }
);

// Obtener movimientos de inventario (Multiempresa)
export const fetchInventoryMovements = createAsyncThunk<
  InventoryMovement[],
  void,
  { state: RootState; rejectValue: string }
>(
  'inventory/fetchMovements',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/inventory-movements', {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId, 
        },
      });
      return response.data.movements;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al obtener movimientos');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

// Crear un nuevo movimiento de inventario (Multiempresa)
export const createInventoryMovement = createAsyncThunk<
  InventoryMovement,
  Partial<InventoryMovement>,
  { state: RootState; rejectValue: string }
>(
  'inventory/createMovement',
  async (movementData, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.post('/inventory-movements', {
        ...movementData,
        companyId: activeCompanyId,
        venueId: activeVenueId, 
      });
      return response.data.movement;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al crear movimiento');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

// Actualizar un movimiento de inventario (Multiempresa)
export const updateInventoryMovement = createAsyncThunk<
  InventoryMovement,
  { id: string; updateData: Partial<InventoryMovement> },
  { state: RootState; rejectValue: string }
>(
  'inventory/updateMovement',
  async ({ id, updateData }, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.put(`/inventory-movements/${id}`, {
        ...updateData,
        companyId: activeCompanyId,
        venueId: activeVenueId, 
      });
      return response.data.movement;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al actualizar movimiento');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

// Eliminar un movimiento de inventario (Multiempresa)
export const deleteInventoryMovement = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>(
  'inventory/deleteMovement',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      await axiosInstance.delete(`/inventory-movements/${id}`, {
        params: {  
          companyId: activeCompanyId,
          venueId: activeVenueId,           
         }
      });
      return id;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error al eliminar movimiento');
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);


// Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: inventoryInitialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryDisassembly.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryDisassembly.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryTranfers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryTranfers.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryAdjustments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryAdjustments.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryAdjustments.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Error al cargar ajustes';
      })
      .addCase(fetchInventoryMovements.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(fetchInventoryMovements.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchInventoryMovements.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Error al obtener movimientos';
      })
      .addCase(createInventoryMovement.fulfilled, (state, action: PayloadAction<InventoryMovement>) => {
        state.movements.push(action.payload);
        state.successMessage = 'Movimiento creado con éxito';
      })
      .addCase(updateInventoryMovement.fulfilled, (state, action: PayloadAction<InventoryMovement>) => {
        const index = state.movements.findIndex(mov => mov._id === action.payload._id);
        if (index !== -1) {
          state.movements[index] = action.payload;
        }
        state.successMessage = 'Movimiento actualizado con éxito';
      })
      .addCase(deleteInventoryMovement.fulfilled, (state, action: PayloadAction<string>) => {
        state.movements = state.movements.filter(mov => mov._id !== action.payload);
        state.successMessage = 'Movimiento eliminado con éxito';
      })
      .addCase(createInventoryTransfer.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.movements.push(...action.payload);
        state.successMessage = 'Transferencia registrada con éxito';
      })
      .addCase(fetchInventoryReviewStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryReviewStock.fulfilled, (state, action: PayloadAction<InventoryReviewItem[]>) => {
        state.reviewStock = action.payload;
        state.loading = false;
      })
      .addCase(fetchInventoryReviewStock.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Error al cargar stock para revisión';
      })
      .addCase(createOutput.pending, (state) => {
        state.loading = true;
        state.errorMessage = null;
      })
      .addCase(createOutput.fulfilled, (state, action: PayloadAction<InventoryMovement[]>) => {
        state.loading = false;
        state.successMessage = 'Salida registrada con éxito';
        state.movements.push(...action.payload); // si deseas almacenarlas
      })
      .addCase(createOutput.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Error al registrar salida';
      })
  }
});

export const { clearMessages } = inventorySlice.actions;
export default inventorySlice.reducer;

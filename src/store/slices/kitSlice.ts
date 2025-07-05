import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { getActiveContext } from '../../utils/getActiveContext';
import { RootState } from '../store';

// Interfaces
interface KitComponent {
  product: string | { _id: string }; // ✅ Permite ambos tipos
  productName: string
  quantity: number;
}

export interface Kit {
  _id: string;
  name: string;
  cost: number;
  stock: number; // <-- Nuevo
  provider?: string; // ✅ NUEVO
  initialWarehouse?: string; // ✅ NUEVO
  taxRate?: string; // ✅ NUEVO
  components: KitComponent[];
  status: "active" | "inactive";
}

interface KitState {
  isLoaded: boolean;
  kits: Kit[];
  kitInfo: Kit | null;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: KitState = {
  isLoaded: false,
  kits: [],
  kitInfo: null,
  errorMessage: null,
  successMessage: null,
};

// Obtener kits activos
export const fetchKitsByStatus = createAsyncThunk<
  Kit[],
  void,
  { state: RootState; rejectValue: string }
>('kits/fetchKitsByStatus', async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/kits', {
      params: { 
        status: 'active',       
        companyId: activeCompanyId,
        venueId: activeVenueId, 
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching kits');
    }
    return rejectWithValue('Unknown error occurred');
  }
});



// Obtener todos los kits
export const fetchKits = createAsyncThunk<
  Kit[],
  void,
  { state: RootState; rejectValue: string }
>('kits/fetchKits', async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/kits', {
      params: {       
        companyId: activeCompanyId,
        venueId: activeVenueId, 
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching kits');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// Crear kit
export const createKit = createAsyncThunk<
  Kit,
  { name: string; cost: number; stock: number; provider?: string; initialWarehouse: string; taxRate: string; components: KitComponent[] },
  { state: RootState; rejectValue: string }
>('kits/createKit', async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.post('/kits', {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error creating kit');
    }
    return rejectWithValue('Unknown error occurred');
  }
});



// Thunk para actualizar un Kit (Multiempresa)
// Actualizar kit
export const updateKit = createAsyncThunk<
  Kit,
  { id: string; name: string; cost: number; stock: number; provider?: string; initialWarehouse: string; taxRate: string; components: KitComponent[] },
  { state: RootState; rejectValue: string }
>('kits/updateKit', async ({ id, ...data }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.put(`/kits/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error updating kit');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// Thunk para eliminar un Kit (Multiempresa)
export const deleteKit = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('kits/deleteKit', async (id, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    await axiosInstance.delete(`/kits/${id}`, {
      params: {  
        companyId: activeCompanyId,
        venueId: activeVenueId, 
      },
    });
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting kit');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// Slice
const kitSlice = createSlice({
  name: 'kits',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKits.fulfilled, (state, action: PayloadAction<Kit[]>) => {
        state.isLoaded = true;
        state.kits = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchKits.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error loading kits';
      })
      .addCase(createKit.fulfilled, (state, action: PayloadAction<Kit>) => {
        state.kits.push(action.payload);
        state.successMessage = 'Kit created successfully';
        state.errorMessage = null;
      })
      .addCase(createKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error creating kit';
      })
      .addCase(updateKit.fulfilled, (state, action: PayloadAction<Kit>) => {
        state.kits = state.kits.map((kit) =>
          kit._id === action.payload._id ? action.payload : kit
        );
        state.successMessage = 'Kit updated successfully';
        state.errorMessage = null;
      })
      .addCase(updateKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error updating kit';
      })
      .addCase(deleteKit.fulfilled, (state, action: PayloadAction<string>) => {
        state.kits = state.kits.filter((kit) => kit._id !== action.payload);
        state.successMessage = 'Kit deleted successfully';
        state.errorMessage = null;
      })
      .addCase(deleteKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || 'Error deleting kit';
      });
  },
});

export const { clearMessages } = kitSlice.actions;
export default kitSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

export interface Warehouse {
  _id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  description?: string;
  companyId: string;
  venueId?: string;
  createdBy: string;
  createdAt: string;
}

export interface NewWarehouse {
  name: string;
  location: string;
  status?: 'active' | 'inactive';
  description?: string;
}

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  errorMessage: null,
  successMessage: null,
};

// Thunk para obtener los almacenes activos (Multiempresa)
export const fetchWarehouses = createAsyncThunk<Warehouse[], void, { rejectValue: string; state: RootState }>
('warehouses/fetch', 
  async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue("Company ID o Venue ID no encontrados.");
    }

    const response = await axiosInstance.get('/warehouses', {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        status: 'active'
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener almacenes");
    }
    return rejectWithValue("Unknown error occurred");        
  }
});

// 🔹 POST
export const createWarehouse = createAsyncThunk<
  Warehouse,
  { name: string; location: string; description?: string; },
  { rejectValue: string; state: RootState }
>('warehouses/createWarehouse', async (data, { rejectWithValue, getState  }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue('No se pudo obtener companyId o venueId del usuario autenticado.');
    }

    const payload = { 
      companyId: activeCompanyId,
      venueId: activeVenueId,
      ...data 
    };

    const response = await axiosInstance.post('/warehouses', payload);
    return response.data;

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear almacén');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

// 🔹 PUT
export const updateWarehouse = createAsyncThunk<
  Warehouse,
  { id: string; name: string; location: string; description?: string; },
  { rejectValue: string; state: RootState }
>('warehouses/updateWarehouse', 
  async ({ id, name, location, description }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    if (!activeCompanyId || !activeVenueId) {
      return rejectWithValue('No se pudo obtener companyId o venueId del usuario autenticado.');
    }    

    const payload = {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      name,
      location,
      description
    };

    const response = await axiosInstance.put(`/warehouses/${id}`, payload);

    return response.data.warehouse;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar almacén');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


// 🔹 DELETE
export const deleteWarehouse = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('warehouses/deleteWarehouse', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/warehouses/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar almacén');
    }
    return rejectWithValue('Unknown error occurred');
  }
});


const warehouseSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {
    resetWarehouseMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
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
        state.errorMessage = action.payload || null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.push(action.payload);
        state.successMessage = 'Almacén creado con éxito';
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex(w => w._id === action.payload._id);
        if (index !== -1) state.warehouses[index] = action.payload;
        state.successMessage = 'Almacén actualizado con éxito';
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter(w => w._id !== action.payload);
        state.successMessage = 'Almacén eliminado con éxito';
      });
  },
});

export default warehouseSlice.reducer;
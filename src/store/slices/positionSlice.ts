import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from '../store';
import { getActiveContext } from '../../utils/getActiveContext';

// Define la interfaz para un parámetro
export interface Position {
    _id: string;
    name: string;
}

interface PositionState {
  positions: Position[]; // Agregamos las categorias
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: PositionState = {
    positions: [], // Agregamos los categorias aquí
    isLoading: false,
    errorMessage: null,
    successMessage: null,
};

// Thunks
export const fetchPositions = createAsyncThunk<
  Position[],
  void,
  { rejectValue: string; state: RootState }
>('positions/fetchPositions', async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.get('/positions', {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching positions');
    }
    return rejectWithValue('Unknown error occurred');
  }
});



export const createPosition = createAsyncThunk<
  Position,
  { name: string },
  { rejectValue: string; state: RootState }
>('positions/createPosition', async ({ name }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.post('/positions', {
      name,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error creating position');
    }
    return rejectWithValue('Unknown error');
  }
});


export const updatePosition = createAsyncThunk<
  Position,
  { id: string; name: string },
  { rejectValue: string; state: RootState }
>('positions/updatePosition', async ({ id, name }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.put(`/positions/${id}`, {
      name,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error updating position');
    }
    return rejectWithValue('Unknown error');
  }
});


export const deletePosition = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('positions/deletePosition', async (id, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    await axiosInstance.delete(`/positions/${id}`, {
      data: { companyId: activeCompanyId, venueId: activeVenueId },
    });

    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting position');
    }
    return rejectWithValue('Unknown error');
  }
});



// Slice
const positionSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action: PayloadAction<Position[]>) => {
        state.isLoading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload || 'Error fetching positions';
      })
      .addCase(createPosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.positions.push(action.payload);
        state.successMessage = 'Position created successfully';
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error creating position';
      })
      .addCase(updatePosition.fulfilled, (state, action: PayloadAction<Position>) => {
        state.positions = state.positions.map((pos) =>
          pos._id === action.payload._id ? action.payload : pos
        );
        state.successMessage = 'Position updated successfully';
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error updating position';
      })
      .addCase(deletePosition.fulfilled, (state, action: PayloadAction<string>) => {
        state.positions = state.positions.filter((pos) => pos._id !== action.payload);
        state.successMessage = 'Position deleted successfully';
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error deleting position';
      });
  },
});

export const { clearMessages } = positionSlice.actions;
export default positionSlice.reducer;
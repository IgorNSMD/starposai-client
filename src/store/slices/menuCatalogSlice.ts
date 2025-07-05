import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from '../store';
import { getActiveContext } from '../../utils/getActiveContext';
import { MenuCatalog } from '../types/menuCatalogTypes';

interface MenuCatalogState {
  menus: MenuCatalog[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuCatalogState = {
  menus: [],
  loading: false,
  error: null,
};

export const fetchMenuCatalogs = createAsyncThunk<MenuCatalog[], void, { state: RootState, rejectValue: string }>(
  'menuCatalog/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get('/menuCatalogs', {
        params: { companyId: activeCompanyId, venueId: activeVenueId }
      });
      return response.data;
    } catch  {
      return rejectWithValue('Error fetching menu catalogs');
    }
  }
);

export const createMenuCatalog = createAsyncThunk<
  MenuCatalog,
  FormData,
  { state: RootState; rejectValue: string }
>(
  'menuCatalog/create',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      // Agregamos companyId y venueId al FormData
      formData.append('companyId', activeCompanyId);
      if (activeVenueId) formData.append('venueId', activeVenueId);

      const response = await axiosInstance.post('/menuCatalogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch {
      return rejectWithValue('Error creating menu catalog');
    }
  }
);



export const updateMenuCatalog = createAsyncThunk<
  MenuCatalog,
  { id: string; data: FormData }, // <- 🔁 CAMBIA AQUÍ
  { state: RootState; rejectValue: string }
>(
  'menuCatalog/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      data.append('companyId', activeCompanyId);
      if (activeVenueId) data.append('venueId', activeVenueId);

      const response = await axiosInstance.put(`/menuCatalogs/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch {
      return rejectWithValue('Error updating menu catalog');
    }
  }
);


export const deleteMenuCatalog = createAsyncThunk<string, string, { rejectValue: string }>(
  'menuCatalog/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/menuCatalogs/${id}`);
      return id;
    } catch  {
      return rejectWithValue('Error deleting menu catalog');
    }
  }
);

const menuCatalogSlice = createSlice({
  name: 'menuCatalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuCatalogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuCatalogs.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenuCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(createMenuCatalog.fulfilled, (state, action) => {
        state.menus.push(action.payload);
      })
      .addCase(updateMenuCatalog.fulfilled, (state, action) => {
        const index = state.menus.findIndex((menu) => menu._id === action.payload._id);
        if (index !== -1) {
          state.menus[index] = action.payload;
        }
      })
      .addCase(deleteMenuCatalog.fulfilled, (state, action) => {
        state.menus = state.menus.filter((menu) => menu._id !== action.payload);
      });
  },
});

export default menuCatalogSlice.reducer;
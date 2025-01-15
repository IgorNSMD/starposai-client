import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export interface Product {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  status: 'active' | 'inactive';
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchProducts = createAsyncThunk<Product[]>('products/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/products');
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al obtener productos');
    }
    
  }
});

export const createProduct = createAsyncThunk<Product, Partial<Product>>(
  'products/create',
  async (productData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/products', productData);
      return response.data;
    } catch (error ) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al crear productos');
        }
    }
  }
);

export const updateProduct = createAsyncThunk<Product, { id: string; data: Partial<Product> }>(
  'products/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al actualizar producto');
        }        
    }
  }
);

export const changeProductStatus = createAsyncThunk<
  Product,
  { id: string; status: 'active' | 'inactive' }
>('products/changeStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await axiosInstance.patch(`/products/${id}/status`, { status });
    return response.data.product;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error al cambiar el estado del producto');
    }
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(changeProductStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeProductStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index].status = action.payload.status;
        }
      })
      .addCase(changeProductStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;
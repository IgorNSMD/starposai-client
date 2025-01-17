import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Define la interfaz para un parámetro
export interface Parameter {
  _id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
}

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
  categories: Category[]; // Agregamos las categorias
  parameters: Parameter[]; // Agregamos los parametros
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: ProductState = {
  products: [],
  categories: [], // Agregamos los categorias aquí
  parameters: [],
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

export const fetchParameters = createAsyncThunk<Parameter[]>(
  'product/fetchParameters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/parameters");
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || ' (parameters/fetchParameters)');
        }
    }
  }
);

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("product/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/categories");
    // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
    return response.data;
    //console.log('data::', data)  

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching roles");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

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
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.successMessage = "Product created successfully";
        state.errorMessage = null;        
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.successMessage = "Product updated successfully";
        state.errorMessage = null;
      })
      .addCase(changeProductStatus.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
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
        state.errorMessage = action.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = true;
        state.categories = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.errorMessage = action.payload || "Error loading roles";
      })
      .addCase(fetchParameters.fulfilled, (state, action: PayloadAction<Parameter[]>) => {
        state.isLoading = false;
        state.parameters = action.payload;
      })
      .addCase(fetchParameters.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })

  },
});

export default productSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { getActiveContext } from '../../utils/getActiveContext';
import { RootState } from '../store';
import { TaxRate } from './taxRateSlice'; // ✅ importa correctamente el tipo

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

export interface ProductComponent {
  product: string | { _id: string }; // ✅ Permite ambos tipos
  productName: string;
  quantity: number;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  initialWarehouse?: string;
  provider?: string;
  image?: string;
  type: 'product' | 'recipe' | 'kit';
  components?: ProductComponent[];
  status: 'active' | 'inactive';
  taxRate?: string;
  
  // 🔽 Nuevos campos:
  taxRatePurchase?: string | TaxRate; // impuesto aplicado al costo
  costTax?: number;         // impuesto calculado
  costWithTax?: number;     // costo + impuesto

  taxRateSale?: string;     // impuesto aplicado al precio
  priceTax?: number;        // impuesto calculado
  priceWithTax?: number;    // precio + impuesto

  unitPurchase?: string;
  unitFactor?: number;

  disableSales: boolean; // si es true, no se puede vender este producto
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
  { rejectValue: string; state: RootState }
>('product/fetchCategories', async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/categories', {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching categories');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const searchProducts = createAsyncThunk<
  Product[],
  { sku?: string; name?: string; category?: string },
  { rejectValue: string; state: RootState }
>('products/search', async (filters, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/products/search', {
      params: { ...filters, status: 'active', companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar productos');
    }
  }
});

export const fetchProductsSales = createAsyncThunk<
  Product[],
  { status?: string },
  { state: RootState; rejectValue: string }
>('products/fetchProductsSales', async ({ status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/products/sales', {
      params: { companyId: activeCompanyId, venueId: activeVenueId, status },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener productos');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const fetchProducts = createAsyncThunk<
  Product[],
  { status?: string },
  { state: RootState; rejectValue: string }
>('products/fetchAll', async ({ status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get('/products', {
      params: { companyId: activeCompanyId, venueId: activeVenueId, status },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener productos');
    }
    return rejectWithValue('Unknown error occurred');
  }
});

export const createProduct = createAsyncThunk<
  Product,
  FormData,
  { rejectValue: string; state: RootState }
>('products/create', async (formData, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    formData.append('companyId', activeCompanyId);
    formData.append('venueId', activeVenueId);

    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.product;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear producto');
    }
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; formData: FormData },
  { rejectValue: string; state: RootState }
>('products/update', async ({ id, formData }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    formData.append('companyId', activeCompanyId);
    formData.append('venueId', activeVenueId);

    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.product;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar producto');
    }
  }
});

export const changeProductStatus = createAsyncThunk<
  Product,
  { id: string; status: 'active' | 'inactive' },
  { rejectValue: string; state: RootState }
>('products/changeStatus', async ({ id, status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.patch(`/products/${id}/status`, { status, companyId: activeCompanyId, venueId: activeVenueId });
    return response.data.product;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al cambiar el estado del producto');
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
        state.successMessage = 'Product created successfully';
        state.errorMessage = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.successMessage = 'Product updated successfully';
        state.errorMessage = null;
      })
      .addCase(changeProductStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index].status = action.payload.status;
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.errorMessage = action.payload || 'Error loading categories';
      })
      .addCase(fetchParameters.fulfilled, (state, action: PayloadAction<Parameter[]>) => {
        state.parameters = action.payload;
      })
      .addCase(fetchParameters.rejected, (state, action) => {
        state.errorMessage = action.payload as string;
      })
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(fetchProductsSales.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchProductsSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsSales.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export default productSlice.reducer;
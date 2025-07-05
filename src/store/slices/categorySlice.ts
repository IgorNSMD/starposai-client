import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { getActiveContext } from "../../utils/getActiveContext";
import { RootState } from "../store";

// Define la interfaz para un parámetro
export interface Category {
    _id: string;
    name: string;
    description: string;
    prefix: string;
    companyId: string;
    venueId?: string;
    parentId?: string;
}

interface CategoryState {
  categories: Category[]; // Agregamos las categorias
  categoriesRoot: Category[];
  subcategories: Category[]; // 👈 nuevo estado
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}


const initialState: CategoryState = {
    categories: [], // Agregamos los categorias aquí
    categoriesRoot: [],
    subcategories: [], // 👈 nuevo estado
    isLoading: false,
    errorMessage: null,
    successMessage: null,
};

export const fetchSubcategories = createAsyncThunk<
  Category[],
  string, // parentId
  { rejectValue: string; state: RootState }
>("categories/fetchSubcategories", async (parentId, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId } = getActiveContext(getState());
    const response = await axiosInstance.get("/categories/by-parent", {
      params: { companyId: activeCompanyId, parentId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al cargar subcategorías.");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const fetchCategoriesRoot = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string; state: RootState }
>("categories/fetchCategoriesRoot", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    const response = await axiosInstance.get("/categories/root", {
      params: { companyId: activeCompanyId, venueId: activeVenueId }
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching recipe categories root");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 GET
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string; state: RootState }
>('categories/fetchCategories', async (_, { rejectWithValue, getState }) => {
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


// 🔹 POST
export const createCategory = createAsyncThunk<
  Category,
  { name: string; description: string; prefix: string; parentId?: string },
  { rejectValue: string; state: RootState }
>('categories/createCategory', async (data, { rejectWithValue, getState }) => {
  try {
    //console.log("Creating category with data:", data);
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const payload = {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    };

    const response = await axiosInstance.post("/categories", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error creating category');
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 PUT
export const updateCategory = createAsyncThunk<
  Category,
  { id: string; name: string; description: string; prefix: string; parentId?: string },
  { rejectValue: string; state: RootState }
>('categories/updateCategory', async ({ id, ...data }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const payload = {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    };

    const response = await axiosInstance.put(`/categories/${id}`, payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error updating category');
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 DELETE
export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('categories/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting category');
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = true;
        state.categories = action.payload;
        state.errorMessage = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
        state.successMessage = "Category created successfully";
        state.errorMessage = null;
      })
      .addCase(createCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating category";
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories = state.categories.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        );
        state.successMessage = "Category updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating category";
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
        state.successMessage = "Category deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting category";
      })
      .addCase(fetchCategoriesRoot.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categoriesRoot = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchCategoriesRoot.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus..";
      })
      .addCase(fetchSubcategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.subcategories = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchSubcategories.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error cargando subcategorías.";
      });
  },
});

export const { clearMessages } = categorySlice.actions;
export default categorySlice.reducer;
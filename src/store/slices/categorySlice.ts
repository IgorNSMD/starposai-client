import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';


// Define la interfaz para un parámetro
export interface Category {
    _id: string;
    name: string;
    description: string;
    prefix: string;
}

interface CategoryState {
  categories: Category[]; // Agregamos las categorias
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
    categories: [], // Agregamos los categorias aquí
    isLoading: false,
    errorMessage: null,
    successMessage: null,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/categories");
    // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
    return response.data;
    //console.log('data::', data)  

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error fetching categories");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const createCategory = createAsyncThunk<
  Category,
  { name: string; description: string; prefix: string },
  { rejectValue: string }
>("categories/createCategory ", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/categories", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (categories/createCategory)');
    }
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; name: string; description: string; prefix: string },
  { rejectValue: string }
>("categories/updateCategory", async ({ id, name, description, prefix }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, { name, description, prefix });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || ' (categories/updateCategory)');
    }
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("categories/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
    return id; // Devuelve el ID eliminado en caso de éxito
  } catch (error) {
    // Manejo del error con `isAxiosError` desde la instancia extendida
    if (axiosInstance.isAxiosError && axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting category..");
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
        state.errorMessage = action.payload || "Error deleting Category";
      });
  },
});

export const { clearMessages } = categorySlice.actions;
export default categorySlice.reducer;
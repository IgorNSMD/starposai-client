import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


export interface RecipeCategory {
  _id: string;
  name: string;
  description: string;
  parentId: string;
}


export interface RecipeCategoryState {
    isLoaded: boolean;
    isRecipeCategoryLoaded: boolean,
    recipeCategories: RecipeCategory[];
    recipeCategoriesRoot: RecipeCategory[];
    errorMessage: string | null;
    successMessage: string | null;
}
  

const initialState: RecipeCategoryState = {
  isLoaded: false,
  isRecipeCategoryLoaded: false,
  recipeCategories: [],
  recipeCategoriesRoot: [],
  errorMessage: null,
  successMessage: null,
};


// Async Thunks con tipos definidos
export const fetchRecipeCategoriesRoot = createAsyncThunk<RecipeCategory[], void, { rejectValue: string }>(
  "RecipeCategory/fetchRecipeCategoriesRoot",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/recipecategories/root");
      
      // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
      const data = response.data.map((menu: RecipeCategory) => ({
        id: menu._id, // Cambia `_id` a `id`
        name: menu.name, // Conserva el campo `label`
        description: menu.description, // Conserva el campo `label`
        parentId: menu.parentId, // Conserva el campo `label`
      }));
      //console.log('data::', data)  
      return data; // Devuelve solo `id` y `label`
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error fetching Menus Root");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);


// Thunks
export const fetchRecipeCategories = createAsyncThunk<
  RecipeCategory[],
  void,
  { rejectValue: string }
>("RecipeCategory/fetchRecipeCategories", async (_, { rejectWithValue }) => {
  try {
    //console.log('inicio..fetchMenus')
    //console.log('Base URL:', axiosInstance.defaults.baseURL);
    const response = await axiosInstance.get("/recipecategories");
    //console.log('response.data (fetchMenus) -> ',response.data)
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      console.log('error en axiosInstance -> ', error.response?.data?.message)
      return rejectWithValue(error.response?.data?.message || " Error fetching recipecategories");
    }
    console.log('error..axios')
    return rejectWithValue("Unknown error occurred");
  }
});

export const createRecipeCategory = createAsyncThunk<
 RecipeCategory,
  { name: string; description: string; parentId: string },
  { rejectValue: string }
>("RecipeCategory/createRecipeCategory", async (data, { rejectWithValue }) => {
  try {

    const response = await axiosInstance.post("/recipecategories", data );

    return response.data;

  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error creating menu");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateRecipeCategory = createAsyncThunk<
RecipeCategory,
  { id: string; name: string; description: string; parentId: string; },
  { rejectValue: string }
>("RecipeCategory/updateRecipeCategory", async ({ id, name, description, parentId,  }, { rejectWithValue }) => {
  try {
    console.log('Inicio actualización menu...');
    // Enviar los datos como multipart/form-data
    const response = await axiosInstance.put(`/recipecategories/${id}`, { name, description, parentId });

    console.log('Respuesta del servidor: ', response.data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating menu");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const deleteRecipeCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("RecipeCategory/deleteRecipeCategory", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/recipecategories/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting RecipeCategory");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


// Slice
const actionSlice = createSlice({
  name: "recipecategories",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipeCategories.fulfilled, (state, action: PayloadAction<RecipeCategory[]>) => {
        state.recipeCategories = action.payload;
        state.isRecipeCategoryLoaded = true; // Marca como cargado solo este dato
        state.errorMessage = null;
      })
      .addCase(fetchRecipeCategories.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus";
      })
      .addCase(createRecipeCategory.fulfilled, (state, action: PayloadAction<RecipeCategory>) => {
        state.recipeCategories.push(action.payload);
        state.successMessage = "Action created successfully";
        state.errorMessage = null;
      })
      .addCase(createRecipeCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating role";
      })
      .addCase(updateRecipeCategory.fulfilled, (state, action: PayloadAction<RecipeCategory>) => {
        state.recipeCategories = state.recipeCategories.map((rC) =>
            rC._id === action.payload._id ? action.payload : rC
        );
        state.successMessage = "RecipeCategory updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateRecipeCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating role";
      })
      .addCase(deleteRecipeCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.recipeCategories = state.recipeCategories.filter((rC) => rC._id !== action.payload);
        state.successMessage = "RecipeCategory deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteRecipeCategory.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting role";
      })
      .addCase(fetchRecipeCategoriesRoot.fulfilled, (state, action: PayloadAction<RecipeCategory[]>) => {
        state.recipeCategoriesRoot = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchRecipeCategoriesRoot.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus..";
      });

  },
});

export const { clearMessages } = actionSlice.actions;
export default actionSlice.reducer;
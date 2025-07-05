import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

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
export const fetchRecipeCategoriesRoot = createAsyncThunk<
  RecipeCategory[],
  void,
  { rejectValue: string; state: RootState }
>("RecipeCategory/fetchRecipeCategoriesRoot", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    const response = await axiosInstance.get("/recipecategories/root", {
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


// Thunks
export const fetchRecipeCategories = createAsyncThunk<
  RecipeCategory[],
  void,
  { rejectValue: string; state: RootState }
>("RecipeCategory/fetchRecipeCategories", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    const response = await axiosInstance.get("/recipecategories", {
      params: { companyId: activeCompanyId, venueId: activeVenueId }
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching recipecategories");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const createRecipeCategory = createAsyncThunk<
  RecipeCategory,
  { name: string; description: string; parentId: string },
  { rejectValue: string; state: RootState }
>("RecipeCategory/createRecipeCategory", async (data, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    const response = await axiosInstance.post("/recipecategories", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error creating recipe category");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


export const updateRecipeCategory = createAsyncThunk<
  RecipeCategory,
  { id: string; name: string; description: string; parentId: string },
  { rejectValue: string; state: RootState }
>("RecipeCategory/updateRecipeCategory", async ({ id, ...data }, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    const response = await axiosInstance.put(`/recipecategories/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating recipe category");
    }
    return rejectWithValue("Unknown error occurred");
  }
});



export const deleteRecipeCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("RecipeCategory/deleteRecipeCategory", async (id, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    if (!activeCompanyId) return rejectWithValue("Company ID no disponible");

    await axiosInstance.delete(`/recipecategories/${id}`, {
      data: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting recipe category");
    }
    return rejectWithValue("Unknown error occurred");
  }
});



// Slice
const recipeCategorySlice = createSlice({
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

export const { clearMessages } = recipeCategorySlice.actions;
export default recipeCategorySlice.reducer;
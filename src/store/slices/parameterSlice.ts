import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";

// Define la interfaz para un parámetro
export interface Parameter {
  _id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
}

// Define el estado inicial para el slice
interface ParameterState {
  parameters: Parameter[];
  parametersByCategory: Record<string, Parameter[]>; // 🔹 cambia a objeto por categoría
  loading: boolean;
  error: string | null;
}

const initialState: ParameterState = {
  parameters: [],
  parametersByCategory: {}, // ← antes era [], ahora es {}
  loading: false,
  error: null,
};


// Async thunk para obtener todos los parámetros
export const fetchParameters = createAsyncThunk<Parameter[]>(
  'parameters/fetchParameters',
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

export const fetchParametersByCategory = createAsyncThunk<Parameter[], string, { rejectValue: string }>(
  "parameters/fetchParametersByCategory",
  async (category, { rejectWithValue }) => {
    try {
      //console.log('(fetchParametersByCategory)category->',category)
      const response = await axiosInstance.get(`/parameters/category/${category}`);

      //console.log('response.data', response.data)
      return response.data; // Devuelve los menús asociados al rol
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error fetching menus by role");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

// Async thunk para agregar un nuevo parámetro
export const addParameter = createAsyncThunk<
  Parameter,
  { category: string; key: string; value: string; description?: string }
>(
  'parameters/addParameter',
  async (newParameter, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/parameters", newParameter);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || ' (parameters/addParameter)');
        }
    }
  }
);

// Async thunk para actualizar un parámetro
export const updateParameter = createAsyncThunk<
  Parameter,
  { id: string; category: string; key: string; value: string; description?: string }
>(
  'parameters/updateParameter',
  async (updatedParameter, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/parameters/${updatedParameter.id}`, updatedParameter);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || ' (parameters/updateParameter)');
        }
    }
  }
);

// Async thunk para eliminar un parámetro
export const deleteParameter = createAsyncThunk<string, string>(
    'parameters/deleteParameter',
    async (id: string, { rejectWithValue }) => { // Se define el tipo de `id` explícitamente
      try {
        await axiosInstance.delete(`/parameters/${id}`);
        return id; // Retorna el id eliminado para actualizar el estado
      } catch (error) {
        if (axiosInstance.isAxiosError && axiosInstance.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message || ' (parameters/deleteParameter)');
        }
        return rejectWithValue('Error desconocido');
      }
    }
  );

// Crear el slice de parámetros
const parameterSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch parameters
    builder.addCase(fetchParameters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchParameters.fulfilled, (state, action: PayloadAction<Parameter[]>) => {
      state.loading = false;
      state.parameters = action.payload;
    });
    builder.addCase(fetchParameters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add parameter
    builder.addCase(addParameter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addParameter.fulfilled, (state, action: PayloadAction<Parameter>) => {
      state.loading = false;
      state.parameters.push(action.payload);
    });
    builder.addCase(addParameter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update parameter
    builder.addCase(updateParameter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateParameter.fulfilled, (state, action: PayloadAction<Parameter>) => {
      state.loading = false;
      const index = state.parameters.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.parameters[index] = action.payload;
      }
    });
    builder.addCase(updateParameter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete parameter
    builder.addCase(deleteParameter.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteParameter.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.parameters = state.parameters.filter((p) => p._id !== action.payload);
    });
    builder.addCase(deleteParameter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch parameters by category
    builder.addCase(fetchParametersByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchParametersByCategory.fulfilled, (state, action) => {
      state.loading = false;
      const category = action.meta.arg; // ← "Currency" o "Language"
      state.parametersByCategory[category] = action.payload;
    });
    builder.addCase(fetchParametersByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Exportar el reducer
export const parameterReducer = parameterSlice.reducer;

// Reducer por defecto
export default parameterSlice.reducer;
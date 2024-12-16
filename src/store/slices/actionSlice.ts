import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Interfaces
interface Permission {
  _id: string;
  key: string;
  description: string;
}

interface Action {
  _id: string;
  name: string;
  permissions: Permission[];
}

interface ActionState {
    isLoaded: boolean;
    actions: Action[];
    actionInfo: Action | null;
    permissions: Permission[]; // Agregamos los permisos aquí
    errorMessage: string | null;
    successMessage: string | null;
  }

const initialState: ActionState = {
  isLoaded: false,
  actions: [],
  actionInfo: null,
  permissions: [],
  errorMessage: null,
  successMessage: null,
};

// Thunks
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/permissions");
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error fetching permisions");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Thunks
export const fetchActions = createAsyncThunk<
  Action[],
  void,
  { rejectValue: string }
>("actions/fetchActions", async (_, { rejectWithValue }) => {
  try {
    //console.log('inicio..fetchActions')
    //console.log('Base URL:', axiosInstance.defaults.baseURL);
    const response = await axiosInstance.get("/actions");
    //console.log('response.data -> ',response.data)
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      console.log('error en axiosInstance -> ', error.response?.data?.message)
      return rejectWithValue(error.response?.data?.message || " Error fetching actions");
    }
    console.log('error..axios')
    return rejectWithValue("Unknown error occurred");
  }
});

export const createAction = createAsyncThunk<
  Action,
  { name: string; permissions: string[] },
  { rejectValue: string }
>("actions/createAction", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/actions", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error creating action");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateAction = createAsyncThunk<
  Action,
  { id: string; name: string; permissions: string[] },
  { rejectValue: string }
>("actions/updateAction", async ({ id, name, permissions }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/actions/${id}`, { name, permissions });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating action");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteAction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("actions/deleteAction", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/roles/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting role");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const actionSlice = createSlice({
  name: "actions",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActions.fulfilled, (state, action: PayloadAction<Action[]>) => {
        state.isLoaded = true;
        state.actions = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchActions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading roles";
      })
      .addCase(createAction.fulfilled, (state, action: PayloadAction<Action>) => {
        state.actions.push(action.payload);
        state.successMessage = "Action created successfully";
        state.errorMessage = null;
      })
      .addCase(createAction.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating role";
      })
      .addCase(updateAction.fulfilled, (state, action: PayloadAction<Action>) => {
        state.actions = state.actions.map((act) =>
          act._id === action.payload._id ? action.payload : act
        );
        state.successMessage = "Role updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateAction.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating role";
      })
      .addCase(deleteAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.actions = state.actions.filter((act) => act._id !== action.payload);
        state.successMessage = "Role deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteAction.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting role";
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.errorMessage = null;
      })
  },
});

export const { clearMessages } = actionSlice.actions;
export default actionSlice.reducer;
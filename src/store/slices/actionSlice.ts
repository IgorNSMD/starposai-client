import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

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
  companyId: string;
  venueId?: string;
  global?: boolean;
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
Permission[], void, 
{ rejectValue: string; state: RootState }>(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("Company ID o Venue ID no encontrados.");
      }

      const response = await axiosInstance.get(`/permissions`, {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
        },
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || ' (permissions/fetchPermissions)');
      }
      return rejectWithValue("Error desconocido");
    }
  }
);

export const fetchActions = createAsyncThunk<
  Action[],
  void,
  { rejectValue: string; state: RootState }
>(
  "actions/fetchActions",
  async (_, { rejectWithValue, getState }) => {
    try {
      // 🔍 Obtener companyId y venueId del estado global (Redux)
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("No se pudo obtener companyId o venueId del usuario autenticado.");
      }

      // 🔍 Realizar la solicitud GET al backend con los parámetros necesarios
      const response = await axiosInstance.get("/actions", { 
        params: { 
          companyId: activeCompanyId, 
          venueId: activeVenueId 
        } 
      });

      return response.data;

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al obtener las acciones.");
      }
      return rejectWithValue("Ocurrió un error desconocido al obtener las acciones.");
    }
  }
);


export const createAction = createAsyncThunk<
  Action,
  { name: string; permissions: string[]; global?: boolean },
  { rejectValue: string; state: RootState }
>(
  "actions/createAction",
  async ({ name, permissions, global }, { rejectWithValue, getState }) => {
    try {

      // 🔍 Obtener companyId y venueId del estado global (Redux)
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("No se pudo obtener companyId o venueId del usuario autenticado.");
      }

      // 🔍 Realizar la solicitud POST al backend
      const response = await axiosInstance.post("/actions", {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        name,
        permissions,
        global
      });

      return response.data.action;

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al crear la acción.");
      }
      return rejectWithValue("Ocurrió un error desconocido al crear la acción.");
    }
  }
);

export const updateAction = createAsyncThunk<
  Action,
  { id: string; name: string; permissions: string[]; global?: boolean },
  { rejectValue: string; state: RootState }
>(
  "actions/updateAction",
  async ({ id, name, permissions, global }, { rejectWithValue, getState }) => {
    try {
      // 🔍 Obtener companyId y venueId desde el estado global (Redux)
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("No se pudo obtener companyId o venueId del usuario autenticado.");
      }

      // 🔍 Realizar la solicitud PUT al backend
      const response = await axiosInstance.put(`/actions/${id}`, {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        name,
        permissions,
        global
      });

      return response.data.action;

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al actualizar la acción.");
      }
      return rejectWithValue("Ocurrió un error desconocido al actualizar la acción.");
    }
  }
);

export const deleteAction = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>(
  "actions/deleteAction",
  async (id, { rejectWithValue, getState }) => {
    try {
      // 🔍 Obtener companyId y venueId del estado global (Redux)
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());

      if (!activeCompanyId || !activeVenueId) {
        return rejectWithValue("No se pudo obtener companyId o venueId del usuario autenticado.");
      }

      // 🔍 Realizar la solicitud DELETE al backend con companyId y venueId en el body
      await axiosInstance.delete(`/actions/${id}`, {
        data: { companyId: activeCompanyId, venueId: activeVenueId }
      });

      return id;  // Devuelve el ID de la acción eliminada para actualizar el estado global

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al eliminar la acción.");
      }
      return rejectWithValue("Ocurrió un error desconocido al eliminar la acción.");
    }
  }
);




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
        state.errorMessage = action.payload || "Error loading actions";
      })
      .addCase(createAction.fulfilled, (state, action: PayloadAction<Action>) => {
        state.actions.push(action.payload);
        state.successMessage = "Action created successfully";
        state.errorMessage = null;
      })
      .addCase(updateAction.fulfilled, (state, action: PayloadAction<Action>) => {
        state.actions = state.actions.map((act) =>
          act._id === action.payload._id ? action.payload : act
        );
        state.successMessage = "Action updated successfully";
        state.errorMessage = null;
      })
      .addCase(deleteAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.actions = state.actions.filter((act) => act._id !== action.payload);
        state.successMessage = "Action deleted successfully";
        state.errorMessage = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.errorMessage = null;
      });
  },
});

export const { clearMessages } = actionSlice.actions;
export default actionSlice.reducer;
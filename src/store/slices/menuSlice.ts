import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Interfaces
interface Permission {
  _id: string;
  key: string;
  description: string;
}

interface MenuRoot {
  _id: string; // ID en la base de datos
  label: string; // Nombre del menú
}

interface Menu {
  _id: string;
  label: string;
  parentId: string;
  order: number;  
  path: string; // Ruta del menú (e.g., '/productos')
  icon: string;
  permissions: Permission[];
  menusRoot: MenuRoot[];
}

interface MenuState {
    isLoaded: boolean;
    menus: Menu[];
    menuInfo: Menu | null;
    permissions: Permission[]; // Agregamos los permisos aquí
    menusRoot: MenuRoot[];
    errorMessage: string | null;
    successMessage: string | null;
}

interface MenuRoot {
  _id: string; // ID en la base de datos
  label: string; // Nombre del menú
}
  

const initialState: MenuState = {
  isLoaded: false,
  menus: [],
  menuInfo: null,
  permissions: [],
  menusRoot: [],
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

// Async Thunks con tipos definidos
export const fetchMenusRoot = createAsyncThunk<MenuRoot[], void, { rejectValue: string }>(
  "menu/fetchMenusRoot",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menus/root");
      
      // Mapea los datos para que incluyan solo `id` y `label` con el tipo definido
      const data = response.data.map((menu: MenuRoot) => ({
        id: menu._id, // Cambia `_id` a `id`
        label: menu.label, // Conserva el campo `label`
      }));

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
export const fetchMenus = createAsyncThunk<
  Menu[],
  void,
  { rejectValue: string }
>("actions/fetchMenus", async (_, { rejectWithValue }) => {
  try {
    //console.log('inicio..fetchActions')
    //console.log('Base URL:', axiosInstance.defaults.baseURL);
    const response = await axiosInstance.get("/menus");
    //console.log('response.data -> ',response.data)
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      console.log('error en axiosInstance -> ', error.response?.data?.message)
      return rejectWithValue(error.response?.data?.message || " Error fetching menus");
    }
    console.log('error..axios')
    return rejectWithValue("Unknown error occurred");
  }
});

export const createMenu = createAsyncThunk<
  Menu,
  { label: string; parentId: string, order: number, path: string, icon: string, permissions: string[] },
  { rejectValue: string }
>("menus/createMenu", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/menus", data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || " Error creating menu");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const updateMenu = createAsyncThunk<
  Menu,
  { id: string; label: string; parentId: string; order: number; path: string; icon: string; permissions: string[] },
  { rejectValue: string }
>("menus/updateAction", async ({ id, label, parentId, order, path, icon, permissions }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/actions/${id}`, { label, parentId, order, path, icon, permissions });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating menu");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

export const deleteMenu = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("actions/deleteAction", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/menus/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error deleting menu");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// Slice
const actionSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenus.fulfilled, (state, action: PayloadAction<Menu[]>) => {
        state.isLoaded = true;
        state.menus = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchMenus.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading roles";
      })
      .addCase(createMenu.fulfilled, (state, action: PayloadAction<Menu>) => {
        state.menus.push(action.payload);
        state.successMessage = "Action created successfully";
        state.errorMessage = null;
      })
      .addCase(createMenu.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating role";
      })
      .addCase(updateMenu.fulfilled, (state, action: PayloadAction<Menu>) => {
        state.menus = state.menus.map((menu) =>
          menu._id === action.payload._id ? action.payload : menu
        );
        state.successMessage = "Role updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateMenu.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating role";
      })
      .addCase(deleteMenu.fulfilled, (state, action: PayloadAction<string>) => {
        state.menus = state.menus.filter((menu) => menu._id !== action.payload);
        state.successMessage = "Role deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteMenu.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting role";
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchMenusRoot.fulfilled, (state, action: PayloadAction<MenuRoot[]>) => {
        state.menusRoot = action.payload;
        state.errorMessage = null;
      })
  },
});

export const { clearMessages } = actionSlice.actions;
export default actionSlice.reducer;
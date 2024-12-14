// Reducer y Slice para Redux
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Define la interfaz para el menú
interface Menu {
    id: string;
    label: string;
    path: string;
    icon: string;
    parentId: string | null;
    subMenus?: Menu[];
}
  
// Define la interfaz para el estado del slice
interface MenuState {
    menus: Menu[];
    menusRoot: Menu[];
    loading: boolean;
    error: string | null;
}
  
// Estado inicial con tipado explícito
const initialState: MenuState = {
    menus: [],
    menusRoot: [],
    loading: false,
    error: null,
};

// Async Thunks con tipos definidos
export const fetchMenusRoot = createAsyncThunk<Menu[], void, { rejectValue: string }>(
  "menu/fetchMenusRoot",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menus/root");
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
          return rejectWithValue(error.response?.data?.message || " Error fetching Menus Root");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

export const fetchMenus = createAsyncThunk<Menu[], void, { rejectValue: string }>(
    "menu/fetchMenus",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get("/menus");
        return response.data;
      } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error fetching Menus");
        }
        return rejectWithValue("Unknown error occurred");
      }
    }
);

export const createMenu = createAsyncThunk<Menu, Omit<Menu, "id">, { rejectValue: string }>(
    "menu/createMenu",
    async (menuData, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post("/api/menus", menuData);
        return response.data;
      } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error create Menu");
        }
        return rejectWithValue("Unknown error occurred");
      }
    }
);

export const updateMenu = createAsyncThunk<Menu, Menu, { rejectValue: string }>(
    "menu/updateMenu",
    async (menuData, { rejectWithValue }) => {
      try {
        const { id, ...rest } = menuData;
        const response = await axiosInstance.put(`/api/menus/${id}`, rest);
        return response.data;
      } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error update Menu");
        }
        return rejectWithValue("Unknown error occurred");
      }
    }
);
  

export const deleteMenu = createAsyncThunk<string, string, { rejectValue: string }>(
    "menu/deleteMenu",
    async (id, { rejectWithValue }) => {
      try {
        await axiosInstance.delete(`/api/menus/${id}`);
        return id;
      } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error delete Menu");
        }
        return rejectWithValue("Unknown error occurred");
      }
    }
  );

// Slice
const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchMenusRoot.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMenusRoot.fulfilled, (state, action) => {
          state.loading = false;
          state.menusRoot = action.payload;
        })
        .addCase(fetchMenusRoot.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error fetching menus root";
        })
        .addCase(fetchMenus.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchMenus.fulfilled, (state, action) => {
          state.loading = false;
          state.menus = action.payload;
        })
        .addCase(fetchMenus.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error fetching menus";
        })
        .addCase(createMenu.fulfilled, (state, action) => {
          state.menus.push(action.payload);
        })
        .addCase(updateMenu.fulfilled, (state, action) => {
          const index = state.menus.findIndex((menu) => menu.id === action.payload.id);
          if (index !== -1) {
            state.menus[index] = action.payload;
          }
        })
        .addCase(deleteMenu.fulfilled, (state, action) => {
          state.menus = state.menus.filter((menu) => menu.id !== action.payload);
        });
    },
  });

export default menuSlice.reducer;
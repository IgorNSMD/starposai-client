import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Interfaces
interface Permission {
  _id: string;
  key: string;
  description: string;
}

interface MenuRoute {
  id: string; // ID en la base de datos
  path: string; // Ruta del menú (e.g., '/productos')
  label: string; // Nombre del menú
  component: string; // Nombre del componente menu
  parentId: string;
}

interface MenuRoot {
  id: string; // ID en la base de datos
  label: string; // Nombre del menú
}

interface Menu {
  _id: string;
  label: string;
  component: string;
  parentId: string;
  sequence: number;  
  path: string; // Ruta del menú (e.g., '/productos')
  icon: string;
  divider: boolean;
  permissions: Permission[];
}

interface MenuRole {
  _id: string;
  label: string;
  component: string;
  parentId: string;
  order: number;  
  path: string; // Ruta del menú (e.g., '/productos')
  icon: string;
  divider: boolean;
  permissions: Permission[];
  subMenu?: MenuRole[];
}

interface MenuTree {
  _id: string;
  label: string;
  component: string;
  parentId: string;
  order: number;  
  path: string; // Ruta del menú (e.g., '/productos')
  icon: string;
  divider: boolean;
  permissions: Permission[];
  subMenu?: MenuTree[];
}


interface MenuState {
    isLoaded: boolean;
    menus: Menu[];
    menuInfo: Menu | null;
    permissions: Permission[]; // Agregamos los permisos aquí
    menusRoot: MenuRoot[];
    menusRoute: MenuRoute[];
    menusRoles: MenuRole[];
    menusTrees: MenuTree[];
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
  menusRoute: [],
  menusRoles: [],
  menusTrees: [],
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

export const fetchMenuRoutes = createAsyncThunk<MenuRoute[], void, { rejectValue: string }>(
  "menu/fetchMenuRoutes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menus/routes");
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        console.log('error en axiosInstance -> ', error.response?.data?.message)
        return rejectWithValue(error.response?.data?.message || " Error fetching menus routes");
      }
      console.log('error..axios')
      return rejectWithValue("Unknown error occurred");
    }
  }
);

export const fetchMenuByRole = createAsyncThunk<MenuRole[], string, { rejectValue: string }>(
  "menu/fetchMenuByRole",
  async (role, { rejectWithValue }) => {
    try {
      console.log('(fetchMenuByRole)role->',role)
      const response = await axiosInstance.get(`/menus/role/${role}`);
      return response.data; // Devuelve los menús asociados al rol
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error fetching menus by role");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

export const fetchMenuTree = createAsyncThunk<
MenuTree[],
void,
{ rejectValue: string }
>("actions/fetchMenuTree", async (_, { rejectWithValue }) => {
    try {
      console.log('fetchMenuTree')
      const response = await axiosInstance.get(`/menus/tree`);
      return response.data; // Devuelve los menús asociados al rol
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error fetching menus tree");
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
  { label: string; component: string; parentId: string, sequence: number, path: string, icon: string | File, divider:boolean, permissions: string[] },
  { rejectValue: string }
>("menus/createMenu", async (data, { rejectWithValue }) => {
  try {

    console.log('inicio..createMenu')
    const formData = new FormData();
    formData.append("label", data.label);
    formData.append("component", data.component);
    formData.append("parentId", data.parentId);
    formData.append("sequence", data.sequence.toString());
    formData.append("path", data.path);
    formData.append("divider", JSON.stringify(data.divider));
    formData.append("icon", data.icon); // Archivo
    data.permissions.forEach((perm, index) => formData.append(`permissions[${index}]`, perm));

    const response = await axiosInstance.post("/menus", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log('response.data ', response.data)

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
  { id: string; label: string; component: string; parentId: string; sequence: number; path: string; icon: string | File; divider: boolean; permissions: string[] },
  { rejectValue: string }
>("menus/updateMenu", async ({ id, label, component, parentId, sequence, path, icon, divider, permissions }, { rejectWithValue }) => {
  try {
    console.log('Inicio actualización menu...');

    // Crear el FormData
    const formData = new FormData();
    formData.append("label", label);
    formData.append("component", component);
    formData.append("parentId", parentId);
    formData.append("sequence", sequence.toString());
    formData.append("path", path);
    formData.append("divider", JSON.stringify(divider));

    // Añadir el archivo si es un File
    if (icon instanceof File) {
      formData.append("icon", icon);
    } else {
      formData.append("icon", icon); // Ruta existente si no se actualiza
    }

    // Añadir permisos
    permissions.forEach((perm, index) => formData.append(`permissions[${index}]`, perm));

    // Enviar los datos como multipart/form-data
    const response = await axiosInstance.put(`/menus/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log('Respuesta del servidor: ', response.data);
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
        state.errorMessage = action.payload || "Error loading menus";
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
      .addCase(fetchMenusRoot.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus..";
      })

      .addCase(fetchMenuRoutes.fulfilled, (state, action: PayloadAction<MenuRoute[]>) => {
        state.menusRoute = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchMenuRoutes.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus..";
      })
      .addCase(fetchMenuByRole.fulfilled, (state, action: PayloadAction<MenuRole[]>) => {
        state.menusRoles = action.payload;
        state.isLoaded = true;
        state.errorMessage = null;
      })
      .addCase(fetchMenuByRole.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus";
      })
      .addCase(fetchMenuTree.fulfilled, (state, action: PayloadAction<MenuTree[]>) => {
        state.menusTrees = action.payload;
        state.isLoaded = true;
        state.errorMessage = null;
      })
      .addCase(fetchMenuTree.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus";
      });

  },
});

export const { clearMessages } = actionSlice.actions;
export default actionSlice.reducer;
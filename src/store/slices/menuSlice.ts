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
  icon: string | File; // Ahora acepta una string o un archivo File
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
  icon: string | File; // Ahora acepta una string o un archivo File
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
  icon: string | File; // Ahora acepta una string o un archivo File
  divider: boolean;
  permissions: Permission[];
  subMenu?: MenuTree[];
}


interface MenuState {
    isLoaded: boolean;
    isMenuLoaded: boolean,
    isMenuByRoleLoaded: boolean,
    isMenuTreeLoaded: boolean    
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
  isMenuLoaded: false,
  isMenuByRoleLoaded: false,
  isMenuTreeLoaded: false,  
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
// Modificar los Thunks para que reciban `companyId` y `venueId` desde el frontend

export const fetchPermissions = createAsyncThunk<
  Permission[],
  { companyId: string; venueId?: string },
  { rejectValue: string }
>('permissions/fetchPermissions', async ({ companyId, venueId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/permissions', {
      params: { companyId, venueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching permissions');
    }
    return rejectWithValue('Unknown error occurred');
  }
});



// Async Thunks con tipos definidos
export const fetchMenusRoot = createAsyncThunk<
  MenuRoot[],
  { companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "menu/fetchMenusRoot",
  async ({ companyId, venueId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menus/root", {
        params: { companyId, venueId },
      });

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


export const fetchMenuRoutes = createAsyncThunk<
  MenuRoute[],
  { companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "menu/fetchMenuRoutes",
  async ({ companyId, venueId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/menus/routes", {
        params: { companyId, venueId },
      });
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        console.log('error en axiosInstance -> ', error.response?.data?.message);
        return rejectWithValue(error.response?.data?.message || "Error fetching menus routes");
      }
      console.log('error..axios');
      return rejectWithValue("Unknown error occurred");
    }
  }
);


export const fetchMenuByRole = createAsyncThunk<
  MenuRole[],
  { role: string; companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "menu/fetchMenuByRole",
  async ({ role, companyId, venueId }, { rejectWithValue }) => {
    try {
      //console.log('(fetchMenuByRole)role->', role);
      const response = await axiosInstance.get(`/menus/role/${role}`, {
        params: { companyId, venueId },
      });
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
  { companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "actions/fetchMenuTree",
  async ({ companyId, venueId }, { rejectWithValue }) => {
    try {
      //console.log('fetchMenuTree');
      const response = await axiosInstance.get(`/menus/tree`, {
        params: { companyId, venueId },
      });
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
  { companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "actions/fetchMenus",
  async ({ companyId, venueId }, { rejectWithValue }) => {
    try {
      //console.log('Inicio fetchMenus');
      const response = await axiosInstance.get("/menus", {
        params: { companyId, venueId },
      });
      //console.log('response.data (fetchMenus) -> ', response.data);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        console.log('Error en axiosInstance -> ', error.response?.data?.message);
        return rejectWithValue(error.response?.data?.message || "Error fetching menus");
      }
      console.log('Error desconocido al intentar obtener los menús.');
      return rejectWithValue("Unknown error occurred");
    }
  }
);


export const createMenu = createAsyncThunk<
  Menu,
  { companyId: string; venueId?: string; label: string; component: string; parentId: string, sequence: number, path: string, icon: string | File, divider:boolean, permissions: string[] },
  { rejectValue: string }
>(
  "menus/createMenu",
  async ({ companyId, venueId, ...data }, { rejectWithValue }) => {
    try {
      console.log('Inicio createMenu (Multiempresa)');

      const formData = new FormData();
      formData.append("companyId", companyId);
      if (venueId) formData.append("venueId", venueId);
      formData.append("label", data.label);
      formData.append("component", data.component);
      formData.append("parentId", data.parentId);
      formData.append("sequence", data.sequence.toString());
      formData.append("path", data.path);
      formData.append("divider", JSON.stringify(data.divider));
      
      if (data.icon instanceof File) {
        formData.append("icon", data.icon); // Archivo
      } else {
        formData.append("icon", data.icon); // Ruta como string
      }

      data.permissions.forEach((perm, index) => formData.append(`permissions[${index}]`, perm));

      const response = await axiosInstance.post("/menus", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('response.data (createMenu): ', response.data);
      return response.data;

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error creating menu");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);


export const updateMenu = createAsyncThunk<
  Menu,
  { id: string; companyId: string; venueId?: string; label: string; component: string; parentId: string; sequence: number; path: string; icon: string | File; divider: boolean; permissions: string[] },
  { rejectValue: string }
>(
  "menus/updateMenu",
  async ({ id, companyId, venueId, ...data }, { rejectWithValue }) => {
    try {
      //console.log('Inicio actualización menu (Multiempresa)...');

      const formData = new FormData();
      formData.append("companyId", companyId);
      if (venueId) formData.append("venueId", venueId);
      formData.append("label", data.label);
      formData.append("component", data.component);
      formData.append("parentId", data.parentId);
      formData.append("sequence", data.sequence.toString());
      formData.append("path", data.path);
      formData.append("divider", JSON.stringify(data.divider));

      // Añadir el archivo si es un File o mantener la ruta existente
      if (data.icon instanceof File) {
        formData.append("icon", data.icon);
      } else {
        formData.append("icon", data.icon); 
      }

      // Añadir permisos
      data.permissions.forEach((perm, index) => formData.append(`permissions[${index}]`, perm));

      const response = await axiosInstance.put(`/menus/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('Respuesta del servidor (updateMenu): ', response.data);
      return response.data;

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error updating menu");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

export const deleteMenu = createAsyncThunk<
  string,
  { id: string; companyId: string; venueId?: string },
  { rejectValue: string }
>(
  "actions/deleteMenu",
  async ({ id, companyId, venueId }, { rejectWithValue }) => {
    try {

      await axiosInstance.delete(`/menus/${id}`, {
        params: { companyId, venueId },
      });

      return id; // Devolvemos el ID para actualizar el state

    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error deleting menu");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);


const areAllMenusLoaded = (state: MenuState) => {
  return state.isMenuLoaded && state.isMenuByRoleLoaded && state.isMenuTreeLoaded;
};

// Slice
const menuSlice = createSlice({
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
        state.menus = action.payload;
        state.isMenuLoaded = true; // Marca como cargado solo este dato
        state.isLoaded = areAllMenusLoaded(state); // Actualiza isLoaded solo si todos están listos
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
        state.isMenuByRoleLoaded = true; // Marca como cargado solo este dato
        state.isLoaded = areAllMenusLoaded(state); // Actualiza isLoaded solo si todos están listos        
        state.errorMessage = null;
      })
      .addCase(fetchMenuByRole.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus";
      })
      .addCase(fetchMenuTree.fulfilled, (state, action: PayloadAction<MenuTree[]>) => {
        state.menusTrees = action.payload;
        state.isLoaded = areAllMenusLoaded(state); // Actualiza isLoaded solo si todos están listos
        state.isMenuTreeLoaded = true;
        state.errorMessage = null;
      })
      .addCase(fetchMenuTree.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading menus";
      });

  },
});

export const { clearMessages } = menuSlice.actions;
export default menuSlice.reducer;
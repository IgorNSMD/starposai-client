import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Interfaces
interface KitComponent {
  product: string | { _id: string }; // ✅ Permite ambos tipos
  quantity: number;
}

interface Kit {
  _id: string;
  name: string;
  components: KitComponent[];
  status: "active" | "inactive";
}

interface KitState {
  isLoaded: boolean;
  kits: Kit[];
  kitInfo: Kit | null;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: KitState = {
  isLoaded: false,
  kits: [],
  kitInfo: null,
  errorMessage: null,
  successMessage: null,
};

// Thunks
export const fetchKits = createAsyncThunk<Kit[], void, { rejectValue: string }>(
  "kits/fetchKits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/kits");
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching kits');
        }
    }
  }
);

export const createKit = createAsyncThunk<Kit, { name: string; components: KitComponent[] }, { rejectValue: string }>(
  "kits/createKit",
  async (data, { rejectWithValue }) => {
    try {
      console.log('data-createKit: ', data);

      // Asegurar que la clave se llama `product` y no `productId`
      const formattedData = {
        name: data.name,
        components: data.components.map(comp => ({
          product: comp.product, // 🛠️ Corrige `productId` a `product`
          quantity: comp.quantity,
        }))
      };

      const response = await axiosInstance.post("/kits", formattedData);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || 'Error creating kit');
      }        
    }
  }
);


export const updateKit = createAsyncThunk<Kit, { id: string; name: string; components: KitComponent[] }, { rejectValue: string }>(
  "kits/updateKit",
  async ({ id, name, components }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/kits/${id}`, { name, components });
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || 'Error updating kit');
        }                
    }
  }
);

export const deleteKit = createAsyncThunk<string, string, { rejectValue: string }>(
  "kits/deleteKit",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/kits/${id}`);
      return id;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || "Error deleting kit")
        }                        
        return rejectWithValue("Unknown error occurred");
    }
  }
);

// Slice
const kitSlice = createSlice({
  name: "kits",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKits.fulfilled, (state, action: PayloadAction<Kit[]>) => {
        state.isLoaded = true;
        state.kits = action.payload;
        state.errorMessage = null;
      })
      .addCase(fetchKits.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error loading kits";
      })
      .addCase(createKit.fulfilled, (state, action: PayloadAction<Kit>) => {
        state.kits.push(action.payload);
        state.successMessage = "Kit created successfully";
        state.errorMessage = null;
      })
      .addCase(createKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error creating kit";
      })
      .addCase(updateKit.fulfilled, (state, action: PayloadAction<Kit>) => {
        state.kits = state.kits.map((kit) => (kit._id === action.payload._id ? action.payload : kit));
        state.successMessage = "Kit updated successfully";
        state.errorMessage = null;
      })
      .addCase(updateKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error updating kit";
      })
      .addCase(deleteKit.fulfilled, (state, action: PayloadAction<string>) => {
        state.kits = state.kits.filter((kit) => kit._id !== action.payload);
        state.successMessage = "Kit deleted successfully";
        state.errorMessage = null;
      })
      .addCase(deleteKit.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.errorMessage = action.payload || "Error deleting kit";
      });
  },
});

export const { clearMessages } = kitSlice.actions;
export default kitSlice.reducer;
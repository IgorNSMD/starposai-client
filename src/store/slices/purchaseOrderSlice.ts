import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export interface Provider {
  _id: string;
  name: string;
}

// Definimos un tipo general para los items de la PO
export interface PurchaseOrderItem {
  type: "product" | "kit" | "service";
  referenceId?: string; // ID de producto o kit, si aplica
  name: string; // Nombre del producto, kit o servicio
  quantity?: number; // No es obligatorio para servicios
  unitPrice: number;
  subtotal: number;
  kitComponents?: {
    product: string; // ID del producto
    productName: string;
    quantity: number;
  }[];
}

// 🔹 Definir la interfaz de una Orden de Compra (PO)
export interface PurchaseOrder {
  _id: string;
  orderNumber?: string;  // 👈 Agregar orderNumber opcional
  provider: string;  // ✅ Ahora espera solo el `_id`
  items: PurchaseOrderItem[];
  total: number;
  estimatedDeliveryDate: string;
  status: "pending" | "partial" | "received" | "inactive";
  createdBy?: string;
  createdAt?: string;  // 👈 Agregar este campo opcionalmente
}

// 🔹 Definir el estado inicial
interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  purchaseOrderDetail: PurchaseOrder | null;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: PurchaseOrderState = {
  purchaseOrders: [],
  purchaseOrderDetail: null,
  isLoading: false,
  errorMessage: null,
  successMessage: null,
};

// ✅ AsyncThunk para obtener una PO por su Order Number
export const fetchPurchaseOrderByNumber = createAsyncThunk<PurchaseOrder, string>(
  "purchaseOrders/fetchByNumber",
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/purchase-orders/order-number/${orderNumber}`);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error fetching PO");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);

// ✅ AsyncThunk para obtener todas las PO
export const fetchPurchaseOrders = createAsyncThunk<PurchaseOrder[], void, { rejectValue: string }>(
  "purchaseOrders/fetchPurchaseOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/purchase-orders");
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {
            return rejectWithValue(error.response?.data?.message || " Error change PO");
         }
        return rejectWithValue("Unknown error occurred");
    }
  }
);

// ✅ AsyncThunk para crear una nueva PO
export const createPurchaseOrder = createAsyncThunk<
  PurchaseOrder,
  { provider: string; items: PurchaseOrderItem[]; estimatedDeliveryDate?: string },
  { rejectValue: string }
>("purchaseOrders/createPurchaseOrder", async (data, { rejectWithValue }) => {
  try {
    //console.log('createPurchaseOrder..')
    const response = await axiosInstance.post("/purchase-orders", data);
    return {
      ...response.data,
      createdAt: response.data.createdAt, // 👈 Asegurar que createdAt se guarde
      status: response.data.status, // 👈 Asegurar que createdAt se guarde
    };
} catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error create PO");
     }
    return rejectWithValue("Unknown error occurred");
}
});

// ✅ AsyncThunk para actualizar una PO
export const updatePurchaseOrder = createAsyncThunk<
  PurchaseOrder,
  { id: string; provider: string; items: PurchaseOrderItem[]; estimatedDeliveryDate?: string },
  { rejectValue: string }
>("purchaseOrders/updatePurchaseOrder", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    
    console.log("🔍 updatePurchaseOrder -> ID recibido:", id); // <-- Agrega este log
    console.log("🔍 updatePurchaseOrder -> Data enviada:", data); // <-- Agrega este log

    if (!id) {
      console.error("❌ Error: ID no recibido en el thunk.");
      return rejectWithValue("El ID de la orden es requerido.");
    }

    const response = await axiosInstance.put(`/purchase-orders/${id}`, data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error update PO");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


// ✅ AsyncThunk para cambiar el estado de una PO
export const changePurchaseOrderStatus = createAsyncThunk<
  PurchaseOrder,
  { id: string; status: "pending" | "partial" | "received" | "inactive" }
>("purchaseOrders/changeStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error change PO");
     }
    return rejectWithValue("Unknown error occurred");
  }
});

// 📌 Creación del Slice
const purchaseOrderSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    clearMessages(state) {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchaseOrders = action.payload;
        //console.log("✅ Ordenes de compra en Redux:", action.payload); // <-- Verificar si contienen _id
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.push(action.payload);
        state.successMessage = "Purchase Order created successfully";
        state.errorMessage = null;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        console.log('createPurchaseOrder.rejected...')
        if (Array.isArray(action.payload)) {
          // 📌 Si el backend devuelve errores en un array, los concatenamos
          state.errorMessage = action.payload.map((err) => `❌ ${err.msg}`).join("\n");
        } else {
          state.errorMessage = `❌ ${action.payload}`;
        }
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex((po) => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        state.successMessage = "Purchase Order updated successfully";
        state.errorMessage = null;
      })
      .addCase(changePurchaseOrderStatus.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex((po) => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index].status = action.payload.status;
        }
        state.successMessage = "Status updated successfully";
        state.errorMessage = null;
      })
      .addCase(fetchPurchaseOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchPurchaseOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("✅ Orden encontrada:", action.payload);
      })
      .addCase(fetchPurchaseOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      });
  },
});

export const { clearMessages } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
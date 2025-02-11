import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 🔹 Definir la interfaz de un Producto dentro de la PO
interface POProduct {
  productId: string; // 🔹 Ahora directamente el ID del producto
  sku: string;
  name: string;
  genericProduct?: string; // Si es un producto genérico
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Provider {
  _id: string;
  name: string;
}

// 🔹 Definir la interfaz de una Orden de Compra (PO)
export interface PurchaseOrder {
  _id: string;
  orderNumber?: string;  // 👈 Agregar orderNumber opcional
  provider: string;  // ✅ Ahora espera solo el `_id`
  products: POProduct[];
  total: number;
  estimatedDeliveryDate: string;
  status: "pending" | "partial" | "received" | "inactive";
  createdBy?: string;
  createdAt?: string;  // 👈 Agregar este campo opcionalmente
}

// 🔹 Definir el estado inicial
interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: PurchaseOrderState = {
  purchaseOrders: [],
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
export const fetchPurchaseOrders = createAsyncThunk<PurchaseOrder[]>(
  "purchaseOrders/fetchAll",
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
  Partial<PurchaseOrder>
>("purchaseOrders/create", async (purchaseOrderData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/purchase-orders", purchaseOrderData);
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
  { id: string; data: Partial<Omit<PurchaseOrder, "provider">> & { provider: string } }
>("purchaseOrders/update", async ({ id, data }, { rejectWithValue }) => {
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
        console.log("✅ Ordenes de compra en Redux:", action.payload); // <-- Verificar si contienen _id
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
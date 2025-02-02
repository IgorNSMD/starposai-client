import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 🔹 Definir la interfaz de un Producto dentro de la PO
interface POProduct {
  productId?: string; // Si es un producto registrado
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
  provider: Provider; // 👈 Ahora es un objeto con `_id` y `name`
  products: POProduct[];
  total: number;
  estimatedDeliveryDate: string;
  status: "pending" | "partial" | "received" | "inactive";
  createdBy?: string;
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
    return response.data;
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
  { id: string; data: Partial<PurchaseOrder> }
>("purchaseOrders/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/purchase-orders/${id}`, data);
    return response.data;
} catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || " Error update PO");
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
      });
  },
});

export const { clearMessages } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
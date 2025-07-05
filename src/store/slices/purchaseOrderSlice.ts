import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";
import { TaxRate } from './taxRateSlice'; // ✅ importa correctamente el tipo

export interface Provider {
  _id: string;
  name: string;
}

// Definimos un tipo general para los items de la PO
export interface PurchaseOrderItem {
  type: "Product" | "Kit" | "Service";
  referenceId?: string; // ID de producto o kit, si aplica
  sku: string;
  name: string; // Nombre del producto, kit o servicio
  quantity?: number; // No es obligatorio para servicios
  receivedQuantity?: number; // No es obligatorio para
  cost: number;
  unitPrice: number;
  subtotal: number;
  initialWarehouse?: string; // 👈 Nuevo campo para almacén planificado
  taxRate?: string | TaxRate; // ✅ esta es la línea clave
  taxAmount?: number;
  unitPurchase?: string;
  unitFactor?: number;
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
  provider: string | Provider; // 👈 esto permite que venga como string o como objeto
  items: PurchaseOrderItem[];
  total: number;
  estimatedDeliveryDate: string;
  status: "pending" | "partial" | "received" | "inactive";
  isTaxIncluded?: boolean; // ✅ Nuevo campo opcional
  createdBy?: string;
  createdAt?: string;  // 👈 Agregar este campo opcionalmente
  wasSent?: boolean; // ← nuevo campo
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
// 🔹 Obtener PO por número
export const fetchPurchaseOrderByNumber = createAsyncThunk<
  PurchaseOrder,
  { orderNumber: string },
  { rejectValue: string; state: RootState }
>("purchaseOrders/fetchByNumber", async ({ orderNumber }, { getState, rejectWithValue }) => {
  try {
    //console.log("🔍 Buscando PO por número:", orderNumber);
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get(`/purchase-orders/order-number/${orderNumber}`, {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    //console.log("✅ Orden de compra encontrada:", response.data);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching PO by number");
    }
    return rejectWithValue("Unknown error occurred");
  }
});



// 🔹 Obtener todas las POs
export const fetchPurchaseOrders = createAsyncThunk<
  PurchaseOrder[],
  void,
  { rejectValue: string; state: RootState }
>("purchaseOrders/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/purchase-orders", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error fetching POs");
    }
    return rejectWithValue("Unknown error occurred");
  }
});



// 🔹 Crear nueva PO
export const createPurchaseOrder = createAsyncThunk<
  PurchaseOrder,
  {
    provider: string;
    items: PurchaseOrderItem[];
    total: number;
    estimatedDeliveryDate?: string;
    createdBy?: string;
  },
  { rejectValue: string; state: RootState }
>("purchaseOrders/create", async (data, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.post("/purchase-orders", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data.purchaseOrder;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error creating PO");
    }
    return rejectWithValue("Unknown error occurred");
  }
});


// 🔹 Actualizar PO
export const updatePurchaseOrder = createAsyncThunk<
  PurchaseOrder,
  {
    id: string;
    provider: string;
    items: PurchaseOrderItem[];
    total: number;
    estimatedDeliveryDate?: string;
  },
  { rejectValue: string; state: RootState }
>("purchaseOrders/update", async ({ id, ...data }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.put(`/purchase-orders/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error updating PO");
    }
    return rejectWithValue("Unknown error occurred");
  }
});



// ✅ AsyncThunk para cambiar el estado de una PO
export const changePurchaseOrderStatus = createAsyncThunk<
  PurchaseOrder,
  { id: string; status: "pending" | "partial" | "received" | "inactive" },
  { rejectValue: string }
>("purchaseOrders/changeStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error changing PO status");
    }
    return rejectWithValue("Unknown error occurred");
  }
});

// 🔹 Marcar PO como enviada
export const markPurchaseOrderAsSent = createAsyncThunk<
  PurchaseOrder,
  { id: string },
  { rejectValue: string }
>("purchaseOrders/markAsSent", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.patch(`/purchase-orders/${id}/mark-sent`);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al marcar como enviada");
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
        state.purchaseOrderDetail = action.payload; // ✅ Actualiza el detalle
        state.successMessage = "Purchase Order created successfully";
        state.errorMessage = null;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        //console.log('createPurchaseOrder.rejected...')
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
      .addCase(fetchPurchaseOrderByNumber.fulfilled, (state,) => {
        state.isLoading = false;
        //console.log("✅ Orden encontrada:", action.payload);
      })
      .addCase(fetchPurchaseOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload as string;
      })
      .addCase(markPurchaseOrderAsSent.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex(po => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
        if (state.purchaseOrderDetail?._id === action.payload._id) {
          state.purchaseOrderDetail = action.payload;
        }
        state.successMessage = "Orden marcada como enviada";
      })
      .addCase(markPurchaseOrderAsSent.rejected, (state, action) => {
        state.errorMessage = action.payload || "Error al marcar como enviada";
      });
  },
});

export const { clearMessages } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
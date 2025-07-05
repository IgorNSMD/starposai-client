import { createSlice, createAsyncThunk, PayloadAction  } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

interface DayCloseSummary {
  date: string;
  cashTotal: number;
  cardTotal: number;
  closedBy: string;
  closedAt: string;
}

export interface SaleItem {
  productId: string | { _id: string };
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PartialPayment {
  amount: number;
  cashierId: string;
  paidAt: string;
}

export interface Sale {
  _id: string;
  companyId: string;
  venueId: string;
  staffId: string | { _id: string; name: string };
  tableId?: string | { _id: string; name: string };
  orderNumber: number; // ✅ agrega esto
  clientName?: string;
  saleItems: SaleItem[];
  payment: {
    method: "cash" | "card";
    cardType?: "debit" | "credit";
    total: number;
    amountPaid: number;
    change?: number;
  };

  partialPayments: PartialPayment[]; // 🟦 nuevo campo agregado

  status: "pending" | "in_progress" | "partial" | "paid" | "cancelled";
  isTakeAway?: boolean; // ✅ permite marcar si es para llevar

  createdAt: string;
  updatedAt: string;
}

export interface NewSale {
  staffId: string;
  tableId?: string;
  clientName?: string;
  saleItems: SaleItem[];
  payment: {
    method: "cash" | "card";
    cardType?: "debit" | "credit";
    total: number;
    amountPaid: number;
    change: number;
  };
  partialPayments?: PartialPayment[]; // 🟦 campo opcional
  status: "pending" | "in_progress" | "partial" | "paid" | "cancelled";
  isTakeAway?: boolean; // ✅ permite marcar si es para llevar
}

interface SaleState {
  sales: Sale[];
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  dayCloseSummary?: DayCloseSummary | null; // 🟦 nuevo campo opcional
  cashRegisterSessionOpen?: boolean;
}

const initialState: SaleState = {
  sales: [],
  loading: false,
  errorMessage: null,
  successMessage: null,
  dayCloseSummary: null, // 🟦 inicializar
  cashRegisterSessionOpen: undefined, // <-- importante
};

export const checkCashRegisterSession = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string; state: RootState }
>("sales/checkCashRegisterSession", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId, activeUserId } = getActiveContext(getState());
    const response = await axiosInstance.get("/cash-register-session/check", {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        userId: activeUserId,
      },
    });
    
    const session = response.data.session;
    const today = new Date().toISOString().split("T")[0];
    const openedDate = session?.openedAt?.split("T")[0];

    if (!session || session.status !== "open" || openedDate !== today) {
      return false;
    }

    return true;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error checkCashRegisterSession.");
    }
    return rejectWithValue("Error al verificar sesión de caja.");
  }
});


export const openCashRegisterSession = createAsyncThunk<
  { message: string },
  { initialAmount: number },
  { rejectValue: string; state: RootState }
>("sales/openCashRegisterSession", async ({ initialAmount }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId, activeUserId } = getActiveContext(getState());
    const response = await axiosInstance.post("/cash-register-session/open-session", {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      cashierId: activeUserId,
      initialAmount,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al abrir sesión de caja.");
    }
    throw error;
  }
});

export const fetchSaleById = createAsyncThunk<
  Sale,
  string,
  { rejectValue: string; state: RootState }
>(
  "sales/fetchSaleById",
  async (saleId, { rejectWithValue, getState }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get(`/sales/${saleId}`, {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
        },
      });

      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al obtener venta por ID.");
      }
      throw error;
    }
  }
);


export const registerPartialPayment = createAsyncThunk<
  {
    saleId: string;
    partialPayments: Sale["partialPayments"];
    payment: Sale["payment"];
    status: Sale["status"];
  },
  {
    saleId: string;
    amount: number;
  },
  { rejectValue: string; state: RootState }
>(
  "sales/registerPartialPayment",
  async ({ saleId, amount }, { rejectWithValue, getState }) => {
    try {
      //console.log('registerPartialPayment initial...')
      const { activeCompanyId, activeVenueId, activeUserId } = getActiveContext(getState());

      const response = await axiosInstance.post(`/sales/${saleId}/partial-payment`, {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        cashierId: activeUserId,
        amount,
      });

      return {
        saleId,
        partialPayments: response.data.partialPayments,
        payment: response.data.updatedPayment,
        status: response.data.status,
      };
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error al registrar pago parcial.");
      }
      throw error;
    }
  }
);




export const deleteSale = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("sales/deleteSale", async (saleId, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    await axiosInstance.delete(`/sales/${saleId}`, {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
      },
    });

    return saleId;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al eliminar la venta.");
    }
    throw error;
  }
});


export const closeDaySales = createAsyncThunk<
  DayCloseSummary,
  void,
  { rejectValue: string; state: RootState }
>("sales/closeDaySales", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId, activeUserId  } = getActiveContext(getState());
    const response = await axiosInstance.post(`/sales/close-day`, {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      userId: activeUserId, // 👈 ¡esto es clave!
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al cerrar el día.");
    }
    throw error;
  }
});


export const closeSale = createAsyncThunk<
  Sale,
  { 
    saleId: string; 
    payment: { 
      method: "cash" | "card"; 
      amountPaid: number;
      change?: number; // ✅ permite incluirlo cuando se necesite 
    } },
  { rejectValue: string; state: RootState }
>("sales/closeSale", async ({ saleId, payment }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/sales/${saleId}/close`, { payment });
    return response.data.sale;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al cerrar venta.");
    }
    throw error;
  }
});


export const createSale = createAsyncThunk<
  Sale,
  NewSale,
  { rejectValue: string; state: RootState }
>("sales/createSale", async (data, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId, activeUserId  } = getActiveContext(getState());
    const payload = {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
      userId: activeUserId, // 👈 ¡esto es clave!
    };

    const response = await axiosInstance.post("/sales", payload);
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al registrar venta.");
    }
    throw error;
  }
});

export const fetchSales = createAsyncThunk<
  Sale[],
  void,
  { rejectValue: string; state: RootState }
>("sales/fetchSales", async (_, { rejectWithValue, getState }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/sales", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al obtener ventas.");
    }
    throw error;
  }
});

export const cancelSale = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>("sales/cancelSale", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/sales/${id}`);
    return id;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al cancelar la venta.");
    }
    throw error;
  }
});

export const addItemsToSale = createAsyncThunk<
  Sale,
  { saleId: string; saleItems: SaleItem[] },
  { rejectValue: string; state: RootState }
>("sales/addItemsToSale", async ({ saleId, saleItems }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.put(`/sales/${saleId}/add-items`, {
      companyId: activeCompanyId,
      venueId: activeVenueId,
      saleItems,
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || "Error al agregar ítems a la venta.");
    }
    throw error;
  }
});

const saleSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    resetSaleMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.unshift(action.payload);
        state.successMessage = "Venta registrada con éxito";
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex((s) => s._id === action.payload);
        if (index !== -1) state.sales[index].status = "cancelled";
        state.successMessage = "Venta cancelada correctamente";
      })
      .addCase(addItemsToSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.sales[index] = action.payload;
        state.successMessage = "Ítems agregados correctamente a la venta";
      })
      .addCase(closeSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.sales[index] = action.payload;
        state.successMessage = "Venta marcada como pagada.";
      })
      .addCase(closeDaySales.fulfilled, (state, action) => {
        state.dayCloseSummary = action.payload;
        state.successMessage = "Día cerrado correctamente.";
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter(s => s._id !== action.payload);
        state.successMessage = "Venta eliminada correctamente";
      })
      .addCase(registerPartialPayment.fulfilled, (state, action) => {
        const index = state.sales.findIndex(s => s._id === action.payload.saleId);
        if (index !== -1) {
          state.sales[index].partialPayments = action.payload.partialPayments;
          state.sales[index].payment = action.payload.payment;
          state.sales[index].status = action.payload.status;
          state.successMessage = "Pago parcial registrado correctamente.";
        }
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        const index = state.sales.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        } else {
          state.sales.unshift(action.payload); // Por si no estaba aún cargada
        }
      })
      .addCase(openCashRegisterSession.fulfilled, (state) => {
        state.cashRegisterSessionOpen = true;
      })
      .addCase(checkCashRegisterSession.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.cashRegisterSessionOpen = action.payload;
      })
      .addCase(checkCashRegisterSession.rejected, (state) => {
        state.cashRegisterSessionOpen = false;
      });
  },
});

export const { resetSaleMessages } = saleSlice.actions;
export default saleSlice.reducer;

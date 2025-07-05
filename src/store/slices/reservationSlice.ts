// src/store/slices/reservationSlice.ts
import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";
import { ReservationInput } from "../types/reservationTypes";

// Interfaces
export interface Reservation {
  _id: string;
  customerName: string;
  contactInfo: string;
  tableId: string | { _id: string; name: string }; // 👈 Ajuste aquí
  roomId: string | { _id: string; name: string };   // 👈 Ajuste aquí
  numberOfPeople: number;
  reservationDate: string;
  reservationTime: string;
  status: "reserved" | "cancelled" | "completed" | "confirmed" | "pending";
  companyId: string;
  venueId: string;
}

interface ReservationState {
  reservations: Reservation[];
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  loading: false,
  errorMessage: null,
  successMessage: null,
};

// 🔹 GET: Obtener reservas por empresa/local
export const fetchReservations = createAsyncThunk<
  Reservation[],
  void,
  { state: RootState; rejectValue: string }
>("reservations/fetchReservations", async (_, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const response = await axiosInstance.get("/reservations", {
      params: { companyId: activeCompanyId, venueId: activeVenueId },
    });
    return response.data;
  } catch  {
    return rejectWithValue("Error al obtener reservas");
  }
});

// 🔹 POST: Crear nueva reserva
export const createReservation = createAsyncThunk<
  Reservation,
  ReservationInput,
  { state: RootState; rejectValue: string }
>("reservations/create", async (data, { rejectWithValue, getState }) => {
  try {

    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.post("/reservations", {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch  {
    return rejectWithValue("Error al crear la reserva");
  }
});


// 🔹 PUT: Actualizar estado
export const updateReservation = createAsyncThunk<
  Reservation,
  { id: string; data: ReservationInput },
  { state: RootState; rejectValue: string }
>("reservations/updateReservation", async ({ id, data }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.put(`/reservations/${id}`, {
      ...data,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });
    return response.data;
  } catch {
    return rejectWithValue("Error al actualizar la reserva");
  }
});

// 🔹 PUT: Actualizar solo el estado de la reserva
export const updateReservationStatus = createAsyncThunk<
  Reservation,
  { id: string; status: "pending" | "confirmed" | "cancelled" },
  { state: RootState; rejectValue: string }
>("reservations/updateStatus", async ({ id, status }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const response = await axiosInstance.put(`/reservations/${id}/status`, {
      status,
      companyId: activeCompanyId,
      venueId: activeVenueId,
    });

    return response.data;
  } catch {
    return rejectWithValue("Error al actualizar estado de reserva");
  }
});


// 🔹 DELETE: Eliminar reserva
export const deleteReservation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reservations/deleteReservation", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/reservations/${id}`);
    return id;
  } catch {
    return rejectWithValue("Error al eliminar reserva");
  }
});

const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    clearReservationMessages: (state) => {
      state.errorMessage = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.reservations.push(action.payload);
        state.successMessage = "Reserva creada con éxito";
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.reservations = state.reservations.filter(r => r._id !== action.payload);
        state.successMessage = "Reserva eliminada";
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.reservations[index] = action.payload;
        state.successMessage = "Reserva actualizada con éxito";
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        state.successMessage = "Estado de reserva actualizado con éxito";
      });
  },
});

export const { clearReservationMessages } = reservationSlice.actions;
export default reservationSlice.reducer;
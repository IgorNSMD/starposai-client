import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../store";
import { getActiveContext } from "../../utils/getActiveContext";

export interface Room {
  _id: string;
  name: string;
  description?: string;
  companyId: string;
  venueId: string;
}

interface RoomState {
  rooms: Room[];
  loading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const initialState: RoomState = {
  rooms: [],
  loading: false,
  successMessage: null,
  errorMessage: null,
};

export const fetchRooms = createAsyncThunk<Room[], void, { rejectValue: string; state: RootState }>(
  "rooms/fetchRooms",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.get("/rooms", { params: { companyId: activeCompanyId, venueId: activeVenueId } });
      return response.data;
    } catch {
      return rejectWithValue("Error al obtener salones");
    }
  }
);

export const createRoom = createAsyncThunk<Room, { name: string; description?: string }, { rejectValue: string; state: RootState }>(
  "rooms/createRoom",
  async (data, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.post("/rooms", { ...data, companyId: activeCompanyId, venueId: activeVenueId });
      return response.data;
    } catch {
      return rejectWithValue("Error al crear salón");
    }
  }
);

export const updateRoom = createAsyncThunk<
  Room,
  { id: string; name: string; description?: string },
  { rejectValue: string; state: RootState }
>(
  'rooms/updateRoom',
  async ({ id, name, description }, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      const response = await axiosInstance.put(`/rooms/${id}`, {
        name,
        description,
        companyId: activeCompanyId,
        venueId: activeVenueId,
      });
      return response.data;
    } catch {
      return rejectWithValue('Error al actualizar salón');
    }
  }
);

export const deleteRoom = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>(
  'rooms/deleteRoom',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { activeCompanyId, activeVenueId } = getActiveContext(getState());
      await axiosInstance.delete(`/rooms/${id}`, {
        params: {
          companyId: activeCompanyId,
          venueId: activeVenueId,
        },
      });
      return id;
    } catch {
      return rejectWithValue('Error al eliminar salón');
    }
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    clearRoomMessages(state) {
      state.successMessage = null;
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.loading = false;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        state.successMessage = "Salón creado correctamente";
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.rooms.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        state.successMessage = 'Salón actualizado correctamente';
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter((r) => r._id !== action.payload);
        state.successMessage = 'Salón eliminado correctamente';
      })
  },
});

export const { clearRoomMessages } = roomSlice.actions;
export default roomSlice.reducer;
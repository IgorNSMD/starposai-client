// 📂 src/redux/slices/companySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axiosInstance from '../../api/axiosInstance';
import { ICompany, IVenue, ISubscription } from "../types/companyTypes";

// 🔹 Estado inicial
interface CompanyState {
  company: ICompany | null;
  venue: IVenue | null;
  subscription: ISubscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  company: null,
  venue: null,
  subscription: null,
  loading: false,
  error: null,
};

// 🔹 Nuevo Thunk para obtener empresa por ID
export const fetchCompanyById = createAsyncThunk(
  "company/fetchCompanyById",
  async (companyId: string, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Error al obtener empresa");
      }
      return thunkAPI.rejectWithValue("Unknown error occurred");
    }
  }
);

// 🔹 Thunk para registrar empresa y local
export const registerCompany = createAsyncThunk(
  "company/registerCompany",
  async (companyData: Partial<ICompany> & { password: string }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/companies", companyData);
      return response.data;
    } catch (error) {
        if (axiosInstance.isAxiosError?.(error)) {  
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Error al registrar la empresa");
        }
        return thunkAPI.rejectWithValue("Unknown error occurred");    
    }
  }
);

// 🔹 Slice de empresa
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetCompanyState: (state) => {
      state.company = null;
      state.venue = null;
      state.subscription = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.company;
        state.venue = action.payload.venue;
        state.subscription = action.payload.subscription;
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.company;
        state.venue = action.payload.venues?.[0] || null;
        state.subscription = action.payload.company?.activeSubscription || null;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
  },
});

export const { resetCompanyState } = companySlice.actions;
export default companySlice.reducer;
export const selectActiveSubscription = (state: RootState) => state.company.subscription;
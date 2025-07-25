// dashboardSlice.ts
import { createSlice, createAsyncThunk,  } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { RootState } from '../store';
import { getActiveContext } from '../../utils/getActiveContext';

// Agrega este tipo si no lo tienes
type DashboardRange = 'today' | 'month' | 'year';


export interface DashboardKpis {
  sales: number;
  revenue: number;
  itemsSold: number;
  percentageSales: number;
  percentageRevenue: number;  
  percentageItemsSold: number;

}

interface DashboardChartPoint {
  time: string;
  sales: number;
  revenue: number;
  itemsSold: number;
}

export interface DashboardActivity {
  time: string;
  desc: string;
  color: string;
  type?: string; // ← ✅ nuevo campo opcional para evitar error TS
}

interface DashboardState {
  kpis: DashboardKpis | null;
  activity: DashboardActivity[];
  chart: DashboardChartPoint[]; // ✅ nuevo
  isLoadingKpis: boolean;
  isLoadingActivity: boolean;
  isLoadingChart: boolean; // ✅ nuevo
  errorMessage: string | null;
}

const initialState: DashboardState = {
  kpis: null,
  activity: [],
  chart: [], // ✅ nuevo
  isLoadingKpis: false,
  isLoadingActivity: false,
  isLoadingChart: false, // ✅ nuevo
  errorMessage: null,
};

export const fetchDashboardKpis = createAsyncThunk<
  DashboardKpis,
  { range: 'today' | 'month' | 'year' },
  { state: RootState; rejectValue: string }
>('dashboard/fetchDashboardKpis', async ({ range }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const state = getState();

    const parameters = state.parameters.parameters;
    const currentSetting = state.settings.currentSetting;

    const countryKey = (currentSetting?.country || "").toLowerCase();
    const countryParam = parameters.find(
      p => p.category === 'Country' && p.key.toLowerCase() === countryKey
    );

    const country = countryParam?.key || 'ES'; // Fallback a 'ES' si no se encuentra

    const response = await axiosInstance.get('/dashboard/kpis', {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        range,
        country,
      },
    });
    
    console.log("✅ KPIs response:", response.data); // 👈 agregalo

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching KPIs');
    }
    return rejectWithValue('Unknown error fetching KPIs');
  }
});

export const fetchDashboardChart = createAsyncThunk<
  DashboardChartPoint[],
  { range: DashboardRange },
  { state: RootState; rejectValue: string }
>('dashboard/fetchChart', async ({ range }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());

    const state = getState();

    const parameters = state.parameters.parameters;
    const currentSetting = state.settings.currentSetting;

    const countryKey = (currentSetting?.country || "").toLowerCase();
    const countryParam = parameters.find(
      p => p.category === 'Country' && p.key.toLowerCase() === countryKey
    );

    const country = countryParam?.key || 'ES';    

    const response = await axiosInstance.get('/dashboard/chart', {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        range,
        country,
      },
    });
    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener gráfico');
    }
    return rejectWithValue('Error desconocido');
  }
});


// ✅ CORRIGE esta definición:
export const fetchDashboardActivity = createAsyncThunk<
  DashboardActivity[],                     // Tipo de respuesta
  { range: DashboardRange },              // Argumento que recibe el thunk
  { state: RootState; rejectValue: string }
>('dashboard/fetchActivity', async ({ range }, { getState, rejectWithValue }) => {
  try {
    const { activeCompanyId, activeVenueId } = getActiveContext(getState());
    const state = getState();

    const parameters = state.parameters.parameters;
    const currentSetting = state.settings.currentSetting;

    const countryKey = (currentSetting?.country || "").toLowerCase();
    const countryParam = parameters.find(
      p => p.category === 'Country' && p.key.toLowerCase() === countryKey
    );

    const country = countryParam?.key || 'ES';

    const response = await axiosInstance.get('/dashboard/activity', {
      params: {
        companyId: activeCompanyId,
        venueId: activeVenueId,
        range,
        country,
      },
    });

    console.log("✅ Activity response:", response.data);

    return response.data;
  } catch (error) {
    if (axiosInstance.isAxiosError?.(error)) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener actividad');
    }
    return rejectWithValue('Error desconocido');
  }
});


const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardMessages(state) {
      state.errorMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKpis.pending, (state) => {
        state.isLoadingKpis = true;
        state.errorMessage = null;
      })
      .addCase(fetchDashboardKpis.fulfilled, (state, action) => {
        state.isLoadingKpis = false;
        state.kpis = action.payload;
      })
      .addCase(fetchDashboardKpis.rejected, (state, action) => {
        state.isLoadingKpis = false;
        state.errorMessage = action.payload || 'Error loading KPIs';
      })
      .addCase(fetchDashboardActivity.pending, (state) => {
        state.isLoadingActivity = true;
        state.errorMessage = null;
      })
      .addCase(fetchDashboardActivity.fulfilled, (state, action) => {
        state.isLoadingActivity = false;
        state.activity = action.payload;
      })
      .addCase(fetchDashboardActivity.rejected, (state, action) => {
        state.isLoadingActivity = false;
        state.errorMessage = action.payload || 'Error loading activity';
      })
      .addCase(fetchDashboardChart.pending, (state) => {
        state.isLoadingChart = true;
        state.errorMessage = null;
      })
      .addCase(fetchDashboardChart.fulfilled, (state, action) => {
        state.isLoadingChart = false;
        state.chart = action.payload;
      })
      .addCase(fetchDashboardChart.rejected, (state, action) => {
        state.isLoadingChart = false;
        state.errorMessage = action.payload || 'Error loading chart';
      })
  },
});

export const { clearDashboardMessages } = dashboardSlice.actions;

export default dashboardSlice.reducer;
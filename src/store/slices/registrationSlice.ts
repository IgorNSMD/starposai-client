import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axiosInstance from "../../api/axiosInstance";
import managementData from "../../data/managementData.json";
import managementData2 from "../../data/managementData2.json";
import managementData3 from "../../data/managementData3.json";

// 📌 Definir la estructura del estado del formulario de registro
interface RegistrationState {
  company: {
    name: string;
    email: string;
    phone?: string;
    currency: string;
    address?: string;
  };
  venue: {
    name: string;
    email: string;
    password: string;
    phone: string;     // 🔥 Nuevo
    address: string;   // 🔥 Nuevo
    currency: string;  // 🔥 Nuevo
    sameAsCompany: boolean;
  };
  user: {
    name: string;
    email: string;
    password: string;
  };
  selectedRole: string; // 👈 Nuevo campo para el rol seleccionado
  selectedPlanCode: string; // 👈 Nuevo campo para el código de plan  
  selectedPaymentMethod: string; // 👈 Nuevo campo para el método de pago
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

// 📌 Estado inicial del formulario
const initialState: RegistrationState = {
  company: { name: "", email: "", phone: "", currency: "", address: "" },
  venue: { name: "",  email: "",  password: "", phone: "", address: "", currency: "", sameAsCompany: true, },
  user: { name: "", email: "", password: "" },
  selectedRole: "", // 👈 Inicialización
  selectedPlanCode: "", // 👈 Inicialización
  selectedPaymentMethod: "", // 👈 Inicialización
  status: "idle",
};


// 📌 Acción para enviar datos al backend
export const submitRegistration = createAsyncThunk(
  "registration/submit",
  async (_, { getState, rejectWithValue }) => {
    try {

      console.log('submitRegistration p0')
      const state = getState() as RootState;
      const selectedPlanCode = state.registration.selectedPlanCode

      const subscription = {
        planCode: selectedPlanCode, // o busca el _id real si ya los tienes cargados
        paymentMethod: state.registration.selectedPaymentMethod,
        status: "active",
        trialActive: false,
        paymentStatus: "paid",
        lastPaymentDate: new Date(),
        renewalDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // suma 30 días
      };

      console.log('submitRegistration p1:', selectedPlanCode)

      // Enviar todo en una sola petición
      const response = await axiosInstance.post("/companies/", {
        company: state.registration.company,
        venue: state.registration.venue,
        user: {
          email: state.registration.venue.email,
          password: state.registration.venue.password,
          roleName: state.registration.selectedRole
        },
        subscriptionData: subscription,
        data: selectedPlanCode === "1" ? managementData :
              selectedPlanCode === "2" ? managementData2 :
              selectedPlanCode === "3" ? managementData3 :
              managementData  // 🔥 Data por defecto si no se especifica un plan
      });

      console.log('submitRegistration p2')

      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error submitRegistration.");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);




export const submitRegistration_old = createAsyncThunk(
  "registration/submit",
  async (_, { getState, rejectWithValue }) => {
    try {

      console.log('submitRegistration p0')
      const state = getState() as RootState;

      console.log('submitRegistration p1')

      // Enviar todo en una sola petición
      const response = await axiosInstance.post("/companies/", {
        company: state.registration.company,
        venue: state.registration.venue,
        user: {
          email: state.registration.venue.email,
          password: state.registration.venue.password, // Agregar el campo de contraseña
          roleName: state.registration.selectedRole  // 🔥 Pasar el rol seleccionado
        },
        subscriptionPlan: "basic",
      });

      console.log('submitRegistration p2')

      const { company, venue } = response.data;
      // 🔍 2. Enviar datos masivos del archivo management.json
      await axiosInstance.post("/companies/setup/", {
        companyId: company._id,
        venueId: venue._id,
        data: managementData
      });

      console.log('submitRegistration p3')

      return response.data;
    } catch (error) {
      if (axiosInstance.isAxiosError?.(error)) {
        return rejectWithValue(error.response?.data?.message || "Error submitRegistration.");
      }
      return rejectWithValue("Unknown error occurred");
    }
  }
);


// 📌 Slice de Redux para manejar el registro
const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setCompanyData: (state, action: PayloadAction<Partial<RegistrationState["company"]>>) => {
      state.company = { ...state.company, ...action.payload };
    },
    setVenueData: (state, action: PayloadAction<Partial<RegistrationState["venue"]>>) => {
      state.venue = { ...state.venue, ...action.payload };
    },
    setUserData: (state, action: PayloadAction<Partial<RegistrationState["user"]>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    setSelectedRole: (state, action: PayloadAction<string>) => {  // 👈 Dejar que el slice maneje esta acción
      console.log("Redux - 🔍 Acción setSelectedRole recibida con:", action.payload);
      state.selectedRole = action.payload;

      //console.log("✅ Estado actualizado:", JSON.stringify(state));
    },
    setSelectedPlanCode: (state, action: PayloadAction<string>) => {
      state.selectedPlanCode = action.payload;
    },    
    setSelectedPaymentMethod: (state, action: PayloadAction<string>) => {
      state.selectedPaymentMethod = action.payload;
    },
    resetRegistration: () => {
      return initialState; // 🔹 Resetea el estado al inicial
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRegistration.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitRegistration.fulfilled, (state) => {
        state.status = "success";
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload as string;
      });
  },
});

// 📌 Exportar acciones y reducer
export const { 
  setCompanyData, 
  setVenueData, 
  setUserData, 
  setSelectedRole,  // ✅ Ahora se exporta directamente desde registrationSlice
  setSelectedPlanCode, 
  setSelectedPaymentMethod, // 👈 Aquí
  resetRegistration 
} = registrationSlice.actions;

export default registrationSlice.reducer;

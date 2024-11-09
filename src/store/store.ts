// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './redux/userSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Exporta el tipo de estado raíz para usarlo en los selectores
export type RootState = ReturnType<typeof store.getState>;

// Exporta el tipo de dispatch para usarlo en los hooks personalizados si los creas
export type AppDispatch = typeof store.dispatch;

export default store;
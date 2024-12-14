// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice'; // authReducer persistido
import permissionReducer from './slices/permissionSlice'; // Importa el nuevo reducer de permisos
import roleReducer from './slices/roleSlice'; // Importa el nuevo reducer de permisos
import menuReducer from './slices/menuSlice'; // Importa el nuevo reducer de menus

// Configuración de persistencia
const persistConfig = {
  key: 'auth', // Solo persiste el reducer de autenticación
  storage,
};

// Reducer persistido
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Configuración del store
const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Usamos el reducer persistido
    user: userReducer, // Reducer normal
    permissions: permissionReducer, // Reducer para permisos
    roles: roleReducer, // Reducer para roles
    menus: menuReducer, // Reducer para roles
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignora el chequeo de serialización para redux-persist
    }),
});

// Configuración del persistor
export const persistor = persistStore(store);

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Exportamos el store por defecto
export default store;
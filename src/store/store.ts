// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice'; // authReducer persistido
import permissionReducer from './slices/permissionSlice'; // Importa el nuevo reducer de permisos
import roleReducer from './slices/roleSlice'; // Importa el nuevo reducer de permisos
import menuReducer from './slices/menuSlice'; // Importa el nuevo reducer de menus
import actionReducer from './slices/actionSlice'; // Importa el nuevo reducer de actions
import parameterReducer  from './slices/parameterSlice'; // Ajusta la ruta según tu estructura
import generalSettingReducer  from './slices/generalSettingSlice'; // Ajusta la ruta según tu estructura
import productReducer  from './slices/productSlice'; // Ajusta la ruta según tu estructura
import categoryReducer  from './slices/categorySlice'; // Ajusta la ruta según tu estructura
import providerReducer  from './slices/providerSlice'; // Ajusta la ruta según tu estructura
import clientReducer from './slices/clientSlice';
import inventoryMovementsReducer from './slices/inventoryMovementSlice';

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
    users: userReducer, // Reducer normal
    permissions: permissionReducer, // Reducer para permisos
    roles: roleReducer, // Reducer para roles
    menus: menuReducer, // Reducer para menus
    actions: actionReducer, // Reducer para actions
    parameters: parameterReducer, // Reducer para actions
    generalSettings: generalSettingReducer, // Reducer para actions
    products: productReducer, // Reducer para actions
    categories: categoryReducer, // Reducer para actions
    providers: providerReducer, // Reducer para actions
    clients: clientReducer, // Reducer para actions
    inventorymovements: inventoryMovementsReducer, // Reducer para actions
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
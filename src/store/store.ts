// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import userReducer from './backup/userSlice';
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
import purchaseOrderReducer from "./slices/purchaseOrderSlice"; 
import kitReducer from "./slices/kitSlice"; 
import warehouseReducer from './slices/warehouseSlice';
import positionReducer from './slices/positionSlice';
import staffReducer from './slices/staffSlice';
import recipeCategoriesReducer from './slices/recipeCategorySlice';
import companyReducer from "./slices/companySlice";
import registrationReducer from "./slices/registrationSlice";
import shiftReducer from "./slices/shiftSlice";
import taskReducer from "./slices/taskSlice";
import roomReducer from "./slices/roomSlice";
import tableReducer from "./slices/tableSlice";
import reservationReducer from "./slices/reservationSlice";
import menuCatalogReducer from "./slices/menuCatalogSlice";
import settingReducer from "./slices/settingSlice";
import venueReducer from "./slices/venueSlice";
import taxRateReducer from "./slices/taxRateSlice";
import saleReducer from "./slices/saleSlice"; // Importa el nuevo reducer de ventas|
import dashboardReducer from "./slices/dashboardSlice"; // Importa el nuevo reducer de ventas|

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
    purchaseorders: purchaseOrderReducer, // Reducer para actions
    kits: kitReducer,
    warehouses: warehouseReducer,
    positions: positionReducer,
    staffs: staffReducer,
    recipeCategories: recipeCategoriesReducer,
    company: companyReducer,
    registration: registrationReducer,
    shifts: shiftReducer,
    tasks: taskReducer,
    rooms: roomReducer,
    tables: tableReducer,
    reservations: reservationReducer,
    menuCatalogs: menuCatalogReducer,
    settings: settingReducer,
    venues: venueReducer, // Reducer para actions
    taxRates: taxRateReducer, 
    sales: saleReducer, // Reducer para acciones de ventas
    dashboards: dashboardReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Ignora el chequeo de serialización para redux-persist
    }),
});

//console.log("🎬 Store inicializado con estado:", JSON.stringify(store.getState()));

// Configuración del persistor
export const persistor = persistStore(store);

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Exportamos el store por defecto
export default store;
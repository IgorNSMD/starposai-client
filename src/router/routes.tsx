import { Suspense  } from "react"; 
import { useRoutes } from 'react-router-dom';
import { CircularProgress } from "@mui/material";

import PrivateRoute from "./PrivateRoute";

import HomeLayout from "../layout/HomeLayout";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Permissions from "../pages/management/Permissions";
import Roles from "../pages/management/Roles";
import Menus from "../pages/management/Menus";
import Actions from "../pages/management/Actions";
import Users from "../pages/management/User";
import Setting from "../pages/setting/Setting";
import Product from "../pages/masterdata/Product";
import Category from "../pages/masterdata/Category";
import Provider from "../pages/masterdata/Provider";
import Client from "../pages/masterdata/Client";
import InventoryMovement from "../pages/inventory/InventoryMovement";
import PurchaseOrder from "../pages/purchasing/PurchaseOrder";
import PurchaseOrdersList from "../pages/purchasing/PurchaseOrderList";
import Kit from "../pages/masterdata/Kit";
import SelectorModalTest from "../pages/testing/SelectorModalTest";

const routes = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/admin',
    element: (
      <PrivateRoute isAuthenticated={true}>
        <Suspense fallback={<CircularProgress />}>
            <AdminLayout />
        </Suspense>
      </PrivateRoute>
    ),
    children: [
      // Subrutas dentro de "/admin"
      { path: 'setting', element: <Setting /> },
      {
        path: 'inventory',
        children: [
          { path: 'movements', element: <InventoryMovement /> },
        ],
      },
      {
        path: 'purchasing',
        children: [
          { path: 'po', element: <PurchaseOrder /> },
          { path: 'view', element: <PurchaseOrdersList /> },
          { path: 'test', element: <SelectorModalTest /> },
        ],
      },
      {
        path: 'management',
        children: [
          { path: 'permissions', element: <Permissions /> },
          { path: 'actions', element: <Actions /> },
          { path: 'roles', element: <Roles /> },
          { path: 'menus', element: <Menus /> },
          { path: 'users', element: <Users /> },
        ],
      },
      {
        path: 'masterdata',
        children: [
          { path: 'product', element: <Product /> },
          { path: 'kit', element: <Kit /> },
          { path: 'category', element: <Category /> },
          { path: 'provider', element: <Provider /> },
          { path: 'client', element: <Client /> },
        ],
      },
    ],
  },
];

export default function AppRoutes() {
    return useRoutes(routes);
}
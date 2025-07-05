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
import Product from "../pages/masterdata/Product";
import Category from "../pages/masterdata/Category";
import Provider from "../pages/masterdata/Provider";
import Client from "../pages/masterdata/Client";
import InventoryMovement from "../pages/inventory/InventoryMovement";
import PurchaseOrder from "../pages/purchasing/PurchaseOrder";
import PurchaseOrdersList from "../pages/purchasing/PurchaseOrderList";
import Kit from "../pages/masterdata/Kit";
import SelectorModalTest from "../pages/testing/SelectorModalTest";
import InventoryMovementsList from "../pages/inventory/InventoryMovementList";
import Position from "../pages/staff/Position";
import Staff from "../pages/staff/Staff";
import RecipeCategory from "../pages/sales/RecipeCategory";
import RegisterCompany from "../pages/auth/RegisterCompany";
import Warehouse from "../pages/setting/Warehouse";
import Shift from "../pages/staff/Shift";
import Task from "../pages/staff/Task";
import Rooms from "../pages/setting/Rooms";
import Tables from "../pages/setting/Tables";
import TableCanvas from "../pages/setting/TableCanvas";
import Reservation from "../pages/sales/Reservation";
import MenuCatalog from "../pages/sales/MenuCatalog";
import GeneralSettings from "../pages/setting/Settings";
import BlankOutlet from "../layout/BlankOutlet";
import TransferInventory from "../pages/inventory/TransferInventory";
import KitDisassembly from "../pages/inventory/KitDisassembly";

import InventoryReviewPage from "../pages/inventory/InventoryReviewPage";
import SalePOS from "../pages/sales/SalePOS";

const routes = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/registerCompany', element: <RegisterCompany /> },
  
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
      { 
        path: 'sales',  
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
        children: [
          { path: 'reservation', element: <Reservation /> },
          { path: 'recipeCategory', element: <RecipeCategory /> },
          { path: 'menuCatalog', element: <MenuCatalog /> },
          { path: 'salespos', element: <SalePOS /> },
        ]
      },      
      { 
        path: 'setting',  
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
        children: [
          { path: 'warehouse', element: <Warehouse /> },
          { path: 'rooms', element: <Rooms /> },
          { path: 'tables', element: <Tables /> },
          { path: 'tablescanvas', element: <TableCanvas /> },
          { path: 'general', element: <GeneralSettings /> },
        ]
      },
      {
        path: 'inventory',
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
        children: [
          { path: 'movements', element: <InventoryMovement /> },
          { path: 'view', element: <InventoryMovementsList /> },
          { path: 'transfer', element: <TransferInventory /> },
          { path: 'disassembly', element: <KitDisassembly /> },
          { path: 'Review', element: <InventoryReviewPage /> },
        ],
      },
      {
        path: 'staff',
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
        children: [
          { path: 'staff', element: <Staff /> },
          { path: 'position', element: <Position /> },
          { path: 'shift', element: <Shift /> },
          { path: 'Task', element: <Task /> },
        ],
      },
      {
        path: 'purchasing',
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
        children: [
          { path: 'po', element: <PurchaseOrder /> },
          { path: 'view', element: <PurchaseOrdersList /> },
          { path: 'test', element: <SelectorModalTest /> },
        ],
      },
      {
        path: 'management',
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
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
        element: <BlankOutlet />, // ⬅️ Esto es lo que soluciona el warning
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
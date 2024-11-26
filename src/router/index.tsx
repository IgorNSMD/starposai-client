import { lazy } from "react";   

import PrivateRoute from "./PrivateRoute";

const HomeLayout = lazy(() => import('../layout/HomeLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const Login = lazy(()=> import('../pages/auth/Login'))   

const RoutesList = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute isAuthenticated={true}>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
];

export default RoutesList;
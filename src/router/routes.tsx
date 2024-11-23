import { lazy } from "react"; 
import { useRoutes } from 'react-router-dom';

import PrivateRoute from "./PrivateRoute";

const HomeLayout = lazy(() => import('../layout/HomeLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const Login = lazy(()=> import('../auth/pages/Login'))   

const routes = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  {
    path: '/admin',
    element: (
      <PrivateRoute isAuthenticated={true}>
        <AdminLayout />
      </PrivateRoute>
    ),
  },
];

export default function AppRoutes() {
    return useRoutes(routes);
}
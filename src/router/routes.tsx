import { lazy } from "react"; 
import { useRoutes } from 'react-router-dom';

import PrivateRoute from "./PrivateRoute";

const HomeLayout = lazy(() => import('../layout/HomeLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const Login = lazy(()=> import('../auth/pages/Login'))   
const Register = lazy(() => import('../auth/pages/Register'));

const routes = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
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
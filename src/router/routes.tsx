import { lazy } from "react"; 
import { useRoutes } from 'react-router-dom';

import PrivateRoute from "./PrivateRoute";

const HomeLayout = lazy(() => import('../layout/HomeLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const Login = lazy(()=> import('../pages/auth/Login'))   
const Register = lazy(() => import('../pages/auth/Register'));
const Permissions = lazy(() => import('../pages/management/Permissions'));
const Roles = lazy(() => import('../pages/management/Roles'));
const Menus = lazy(() => import('../pages/management/Menus'));
const Actions = lazy(() => import('../pages/management/Actions'));
const Users = lazy(() => import('../pages/management/User'));


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
    children: [
      // Subrutas dentro de "/admin"
      { path: 'permissions', element: <Permissions /> },
      { path: 'actions', element: <Actions /> },
      { path: 'roles', element: <Roles /> },
      { path: 'menus', element: <Menus /> },
      { path: 'users', element: <Users /> },
      // Puedes agregar más subrutas aquí
    ],
  },
];

export default function AppRoutes() {
    return useRoutes(routes);
}
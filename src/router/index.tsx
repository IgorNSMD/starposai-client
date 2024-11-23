import { lazy } from "react";   

const HomeLayout = lazy(() => import('../layout/HomeLayout'));
const AdminLayout = lazy(() => import('../layout/AdminLayout'));
const Login = lazy(()=> import('../auth/pages/Login'))   

const Routes = [
  { path: '/', element: <HomeLayout /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <AdminLayout />, private: true },
];

export default Routes;
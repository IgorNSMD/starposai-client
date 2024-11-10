import { lazy } from "react";   
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardHome from '../pages/dashboard/DashboardHome';
import Register from '../pages/auth/Register';

const Login = lazy(()=> import('../pages/auth/Login'))   

const ForgotPassword = lazy(()=> import('../pages/auth/ForgotPassword'));

const CustomerDetails = lazy(()=> import('../pages/customers/CustomerDetails'));
const CustomerList = lazy(()=> import('../pages/customers/CustomerList'));

import ProtectedRoute from './ProtectedRoute';


const RoutesConfig = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/home" />} /> {/* Redirección a /home */}
            <Route path="/home" element={<DashboardHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/dashboard/*" element={<ProtectedRoute />}>
                {/* Aquí van las rutas privadas */}
                <Route path="CustomerDetails" element={<CustomerDetails />} />
                <Route path="CustomerList" element={<CustomerList />} />
            </Route>
        </Routes>    
    </BrowserRouter>

);

export default RoutesConfig;
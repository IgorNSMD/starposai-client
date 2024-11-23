// import { lazy } from "react";   
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// const DashboardHome = lazy(()=> import('../pages/dashboard/DashboardHome'));

// const Login = lazy(()=> import('../auth/pages/Login'))   
// const Register = lazy(()=> import('../auth/pages/Register'));
// const ForgotPassword = lazy(()=> import('../auth/pages/ForgotPassword'));

// const CustomerDetails = lazy(()=> import('../pages/customers/CustomerDetails'));
// const CustomerList = lazy(()=> import('../pages/customers/CustomerList'));

// import ProtectedRoute from './ProtectedRoute';


// const RoutesConfig = () => (
//     <BrowserRouter>
//         <Routes>
//             <Route path="/" element={<Navigate to="/home" />} /> {/* Redirección a /home */}
//             <Route path="/home" element={<DashboardHome />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/Register" element={<Register />} />
//             <Route path="/ForgotPassword" element={<ForgotPassword />} />
//             <Route path="/dashboard/*" element={<ProtectedRoute />}>
//                 {/* Aquí van las rutas privadas */}
//                 <Route path="CustomerDetails" element={<CustomerDetails />} />
//                 <Route path="CustomerList" element={<CustomerList />} />
//             </Route>
//         </Routes>    
//     </BrowserRouter>

// );

// export default RoutesConfig;
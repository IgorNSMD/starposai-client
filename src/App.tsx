import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLayout from './components/home/HomeLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';

const App: React.FC = () => {
  const isAuthenticated = true; // Simula el estado de autenticación

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        {isAuthenticated && <Route path="/dashboard" element={<DashboardLayout />} />}
      </Routes>
    </Router>
  );
};

export default App;

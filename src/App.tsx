import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLayout from './layout/HomeLayout';
import AdminLayout from './layout/AdminLayout';

const App: React.FC = () => {
  const isAuthenticated = true; // Simula el estado de autenticación

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        {isAuthenticated && <Route path="/dashboard" element={<AdminLayout />} />}
      </Routes>
    </Router>
  );
};

export default App;

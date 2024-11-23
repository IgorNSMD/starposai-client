import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({
  children,
  isAuthenticated,
}) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
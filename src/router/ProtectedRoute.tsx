import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store"; // Importa tu tipo RootState

const ProtectedRoute: FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/home" />;
};

export default ProtectedRoute;
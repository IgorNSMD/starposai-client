import React from 'react';
import { useSelector } from 'react-redux';

interface PermissionControlProps {
  permission: string; // El permiso requerido
  children: React.ReactNode; // El componente a renderizar si tiene el permiso
}

const PermissionControl: React.FC<PermissionControlProps> = ({ permission, children }) => {
  const userPermissions = useSelector((state: any) => state.auth.userInfo?.permissions || []); // Obtener permisos del usuario

  return userPermissions.includes(permission) ? <>{children}</> : null; // Renderiza si tiene permiso
};

export default PermissionControl;

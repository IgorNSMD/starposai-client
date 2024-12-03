// const PermissionControl: React.FC<PermissionControlProps> = ({ permission, children }) => {
//     const userPermissions = useSelector((state: any) => state.auth.userInfo?.permissions || []);
//     const hasPermission = userPermissions.includes(permission);
  
//     // Clona al hijo y le agrega la propiedad `disabled` si no tiene permiso
//     return React.cloneElement(children as React.ReactElement, { disabled: !hasPermission });
//   };
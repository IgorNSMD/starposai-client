import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Collapse, SvgIconTypeMap, } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
//import { OverridableComponent } from '@mui/material/OverridableComponent';

import { Link as RouterLink, useLocation } from 'react-router-dom';

import { sidebarStyle } from '../styles/AdminStyles';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { fetchMenus, fetchMenuByRole, fetchMenuTree } from '../store/slices/menuSlice'; // Asegúrate de que este thunk exista
import { baseURL_MENUICONS } from '../utils/Parameters'; // Importa tu baseURL exportable

import { menuAdmin } from './AdminMenu';

// JSON de menú dinámico
const menuItems = menuAdmin

interface AdminSidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  _id?: string; // ID único del menú
  component?: string; // Etiqueta del menú
  path?: string; // Ruta asociada al menú
  //icon?: OverridableComponent<SvgIconTypeMap<Record<string, unknown>, "svg">> & { muiName: string }; // Ícono de Material UI
  icon: string | File; // Ahora acepta una string o un archivo File
  divider?: boolean; // Indica si es un divisor
  subMenus?: MenuItem[]; // Submenús anidados
}

const filterMenuItems = (
  menuItems: MenuItem[],
  filter: { component: string; path: string }[]
): MenuItem[] => {
  return menuItems
    .map((item) => {
      if (item.divider) return item; // Incluye siempre los divisores

      // Verifica coincidencias ignorando mayúsculas/minúsculas
      const match = filter.some((f) => {
        const filterName = f.component?.toLowerCase() || '';
        const filterRoute = f.path?.toLowerCase() || '';
        const itemName = item.component?.toLowerCase() || '';
        const itemPath = item.path?.toLowerCase() || '';
        return filterName === itemName && filterRoute === itemPath;
      });

      // Si hay submenús, aplica el filtrado recursivo
      const filteredSubMenu = item.subMenus
        ? filterMenuItems(item.subMenus, filter)
        : [];

      // Retorna un nuevo objeto con los submenús filtrados
      if (match || filteredSubMenu.length > 0) {
        // console.log("Item procesado:", {
        //   ...item,
        //   subMenu: filteredSubMenu,
        //   icon: item.icon,
        // });
        return {
          ...item,
          //subMenus: filteredSubMenu,
          icon: item.icon, // Copia explícitamente el icono
        };
      }

      // Excluir elementos que no coincidan
      return null; // Se mantiene como null para ser eliminado
    })
    .filter((item): item is MenuItem => item !== null); // TypeScript narrowing
};




const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const { menus, menusRoles, menusTrees, isLoaded } = useAppSelector((state) => state.menus);
  const role = useAppSelector((state) => state.auth.userInfo?.role); // Obtén el rol del usuario
  const location = useLocation();

  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});


  // Cargar los menús al montar el componente
  useEffect(() => {
    if (!isLoaded && role) {
      dispatch(fetchMenus()); // Pasa el rol al thunk
      dispatch(fetchMenuByRole(role)); // Pasa el rol al thunk
      dispatch(fetchMenuTree()); // Pasa el rol al thunk
    }
  }, [dispatch, isLoaded, role]);

  const toggleSubMenu = (name: string | undefined) => {
    if (name) {
      setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Ejemplo de uso:
  // const menuPrincipal: MenuItem[] = [
  //   { name: "Inicio", route: "/inicio" },
  //   { name: "Productos", route: "/productos" },
  //   { name: "Servicios", route: "/servicios" },
  //   { name: "Contacto", route: "/contacto" },
  //   { divider: true },
  //   { name: "Ayuda", route: "/ayuda" },
  //   {
  //     name: "Management",
  //     route: "/Management",
  //     subMenu: [
  //       {
  //         name: "Permissions",
  //         route: "/admin/permissions"
  //       },
  //       {
  //         name: "Actions",
  //         route: "/admin/actions"
  //       },
  //       {
  //         name: "Roles",
  //         route: "/admin/roles"
  //       },
  //       {
  //         name: "Menus",
  //         route: "/admin/menus"
  //       },
  //       {
  //         name: "Users",
  //         route: "/admin/users"
  //       }
  //     ]
  //   },
  // ];

  // const menuFiltro = [
  //   { label: "inicio", path: "/inicio" }, // Coincidencia completa
  //   { label: "servicios", path: "/otroPath" }, // No coincide la ruta
  //   { label: "otraCosa", path: "/servicios" }, // No coincide el nombre
  //   { label: "ayuda", path: "/ayuda" }, // Coincidencia completa
  //   {
  //     label: "Management", path: "/Management",
  //     subMenu: [
  //       {
  //         label: "Permissions",
  //         path: "/admin/permissions"
  //       },
  //       {
  //         label: "Actions",
  //         path: "/admin/actions"
  //       },
  //       {
  //         label: "Roles",
  //         path: "/admin/roles"
  //       },
  //       {
  //         label: "Menus",
  //         path: "/admin/menus"
  //       },
  //       {
  //         label: "Users",
  //         path: "/admin/users"
  //       }
  //     ]

  //   },    
  // ];

  // console.log('menuPrincipal->', menuPrincipal)
  // console.log('menuFiltro->', menuFiltro)

  // console.log('menuItems->', menuItems)
  // console.log('menus->', menus)

  // Obtén los menús filtrados basados en los datos cargados desde Redux y el filtro estático
  const deepCopyMenuItems = JSON.parse(JSON.stringify(menusTrees));
  const filteredMenus = filterMenuItems(deepCopyMenuItems, menusRoles.map((menu) => ({
    component: menu.component, // Asegúrate de que `label` está presente y corresponde a `name` en el filtro
    path: menu.path, // Asegúrate de que `path` está presente y corresponde a `route` en el filtro
  })));
  console.log('menuItems->', menuItems)
  console.log('menus->', menus)
  console.log('menusRoles->', menusRoles)
  console.log('menusTrees->', menusTrees)
  console.log('filteredMenus->', filteredMenus)

  const getIconUrl = (iconPath: string) => {
    const baseUrl = baseURL_MENUICONS; // La URL base de tu servidor backend
    //console.log('baseURL, iconPath', baseUrl, iconPath)
    return iconPath ? `${baseUrl}/${iconPath}` : ""; // Combina la URL base con la ruta relativa
  };

  return (
    <Box
      sx={{
        ...sidebarStyle,
        width: isOpen ? '250px' : '70px',
        transition: 'width 0.3s',
      }}
    >
      <List>
        {filteredMenus.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <Divider sx={{ backgroundColor: '#ffffff' }} />
            ) : (
              <>
                <ListItem disableGutters>
                  <Button
                    component={RouterLink}
                    to={item.path || '#'}
                    onClick={item.subMenus ? () => toggleSubMenu(item.component) : undefined}
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: item.path && isActive(item.path) ? '#1e3a8a' : 'transparent',
                      '&:hover': { backgroundColor: '#314e8a' },
                    }}
                  >
                    
                    {/* <ListItemIcon sx={{ marginLeft: 2 }}>
                      {item.icon && (
                        <item.icon sx={{ color: isActive(item.route || '') ? '#ffffff' : '#b3c3df' }} />
                      )}
                    </ListItemIcon> */}

                    <ListItemIcon sx={{ marginLeft: 2 }}>
                      {typeof item.icon === "string" ? (
                        <img
                          src={getIconUrl(item.icon)} // Usa la URL relativa o absoluta
                          alt={`${item.component}-icon`}
                          style={{
                            width: "24px",
                            height: "24px",
                            objectFit: "contain",
                            marginTop: "5px",
                            filter: isActive(item.path ?? "")
                              ? "brightness(2) contrast(1.2)" // Mayor brillo y contraste para íconos activos
                              : "brightness(2) contrast(1.2)",
                            transition: "filter 0.3s ease", // Suave transición al cambiar estado
                          }}
                        />
                      ) : (
                        <div> {/* Manejo de fallback en caso de error */} </div>
                      )}
                    </ListItemIcon>

                    
                    {isOpen && <ListItemText primary={item.component} sx={{ color: '#ffffff' }} />}
                    {isOpen && item.subMenus && (
                      openMenus[item.component ?? ''] ? (
                        <ExpandLess sx={{ color: '#ffffff' }} />
                      ) : (
                        <ExpandMore sx={{ color: '#ffffff' }} />
                      )
                    )}
                  </Button>
                </ListItem>
                {item.subMenus && (
                  <Collapse in={openMenus[item.component ?? '']} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenus.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disableGutters>
                          <Button
                            component={RouterLink}
                            to={subItem.path || '#'}
                            sx={{
                              textDecoration: 'none',
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: 0,
                              backgroundColor: isActive(subItem.path ?? '') ? '#1e3a8a' : 'transparent',
                              '&:hover': { backgroundColor: '#314e8a' },
                            }}
                          >

                            <ListItemIcon sx={{ marginLeft: 4 }}>
                              {typeof subItem.icon === "string" ? (
                                <img
                                  src={getIconUrl(subItem.icon)} // Usa la URL relativa o absoluta
                                  alt={`${subItem.component}-icon`}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    objectFit: "contain",
                                    marginTop: "5px",
                                    filter: isActive(subItem.path ?? "")
                                      ? "brightness(2) contrast(1.2)" // Mayor brillo y contraste para íconos activos
                                      : "brightness(2) contrast(1.2)",
                                    transition: "filter 0.3s ease", // Suave transición al cambiar estado
                                  }}
                                />
                              ) : (
                                <div> {/* Manejo de fallback en caso de error */} </div>
                              )}
                            </ListItemIcon>

                            {isOpen && (
                              <ListItemText
                                primary={subItem.component}
                                sx={{ color: '#ffffff' }}
                              />
                            )}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AdminSidebar;
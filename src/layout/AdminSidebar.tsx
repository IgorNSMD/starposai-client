import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Divider, Collapse, } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { Link as RouterLink, useLocation } from 'react-router-dom';

import { sidebarStyle } from '../styles/AdminStyles';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { fetchMenuByRole } from '../store/slices/menuSlice'; // Asegúrate de que este thunk exista
import { menuAdmin } from './AdminMenu';

// JSON de menú dinámico
const menuItems = menuAdmin

interface AdminSidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  _id?: string; // ID único del menú
  name?: string; // Etiqueta del menú
  route?: string; // Ruta asociada al menú
  icon?: string; // URL o nombre del ícono
  divider?: boolean; // Indica si es un divisor
  subMenu?: MenuItem[]; // Submenús anidados
}


const filterMenuItems = (menuItems: MenuItem[], filter: { name: string; route: string }[]): MenuItem[] => {
  return menuItems.filter((item) => {
    if (item.divider) return true; // Incluye siempre los divisores
    
    // Verifica coincidencias ignorando mayúsculas/minúsculas
    const match = filter.some((f) => {
      console.log('filterMenuItems..', f.name)
      const filterName = f.name?.toLowerCase() || '';
      const filterRoute = f.route?.toLowerCase() || '';
      const itemName = item.name?.toLowerCase() || '';
      const itemPath = item.route?.toLowerCase() || '';

      return filterName === itemName && filterRoute === itemPath;
    });

    if (item.subMenu) {
      // Filtra recursivamente los submenús
      item.subMenu = filterMenuItems(item.subMenu, filter);
    }


    return match
  });
};



const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const { menus, isLoaded } = useAppSelector((state) => state.menus);
  const role = useAppSelector((state) => state.auth.userInfo?.role); // Obtén el rol del usuario
  const location = useLocation();

  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});


  // Cargar los menús al montar el componente
  useEffect(() => {
    if (!isLoaded && role) {
      dispatch(fetchMenuByRole(role)); // Pasa el rol al thunk
    }
  }, [dispatch, isLoaded, role]);

  const toggleSubMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path: string) => location.pathname === path;

  // Ejemplo de uso:
  const menuPrincipal: MenuItem[] = [
    { name: "Inicio", route: "/inicio" },
    { name: "Productos", route: "/productos" },
    { name: "Servicios", route: "/servicios" },
    { name: "Contacto", route: "/contacto" },
    { divider: true },
    { name: "Ayuda", route: "/ayuda" },
    {
      name: "Management",
      divider: false,
      subMenu: [
        {
          name: "Permissions",
          route: "/admin/permissions"
        },
        {
          name: "Actions",
          route: "/admin/actions"
        },
        {
          name: "Roles",
          route: "/admin/roles"
        },
        {
          name: "Menus",
          route: "/admin/menus"
        },
        {
          name: "Users",
          route: "/admin/users"
        }
      ]
    },
  ];

  const menuFiltro = [
    { label: "inicio", path: "/inicio" }, // Coincidencia completa
    { label: "servicios", path: "/otroPath" }, // No coincide la ruta
    { label: "otraCosa", path: "/servicios" }, // No coincide el nombre
    { label: "ayuda", path: "/ayuda" } // Coincidencia completa
  ];

  // console.log('menuPrincipal->', menuPrincipal)
  // console.log('menuFiltro->', menuFiltro)

  console.log('menuItems->', menuItems)
  console.log('menus->', menus)

  // Obtén los menús filtrados basados en los datos cargados desde Redux y el filtro estático
  const filteredMenus = filterMenuItems(menuPrincipal, menuFiltro.map((menu) => ({
    name: menu.label, // Asegúrate de que `label` está presente y corresponde a `name` en el filtro
    route: menu.path, // Asegúrate de que `path` está presente y corresponde a `route` en el filtro
  })));
  console.log('filteredMenus->', filteredMenus)

  return (
    <Box
      sx={{
        ...sidebarStyle,
        width: isOpen ? '250px' : '70px',
        transition: 'width 0.3s',
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <Divider sx={{ backgroundColor: '#ffffff' }} />
            ) : (
              <>
                <ListItem disableGutters>
                  <Button
                    component={RouterLink}
                    to={item.route || '#'}
                    onClick={item.subMenu ? () => toggleSubMenu(item.name) : undefined}
                    sx={{
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: 0,
                      backgroundColor: item.route && isActive(item.route) ? '#1e3a8a' : 'transparent',
                      '&:hover': { backgroundColor: '#314e8a' },
                    }}
                  >
                    <ListItemIcon sx={{ marginLeft: 2 }}>
                      {item.icon && (
                        <item.icon sx={{ color: isActive(item.route || '') ? '#ffffff' : '#b3c3df' }} />
                      )}
                    </ListItemIcon>
                    {isOpen && <ListItemText primary={item.name} sx={{ color: '#ffffff' }} />}
                    {isOpen && item.subMenu && (
                      openMenus[item.name] ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />
                    )}
                  </Button>
                </ListItem>
                {item.subMenu && (
                  <Collapse in={openMenus[item.name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subMenu.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disableGutters>
                          <Button
                            component={RouterLink}
                            to={subItem.route}
                            sx={{
                              textDecoration: 'none',
                              width: '100%',
                              justifyContent: 'flex-start',
                              padding: 0,
                              backgroundColor: isActive(subItem.route) ? '#1e3a8a' : 'transparent',
                              '&:hover': { backgroundColor: '#314e8a' },
                            }}
                          >
                            <ListItemIcon sx={{ marginLeft: 4 }}>
                              <subItem.icon sx={{ color: isActive(subItem.route) ? '#ffffff' : '#b3c3df' }} />
                            </ListItemIcon>
                            {isOpen && <ListItemText primary={subItem.name} sx={{ color: '#ffffff' }} />}
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
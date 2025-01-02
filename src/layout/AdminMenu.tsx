import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BoltIcon from '@mui/icons-material/Bolt';

// JSON de menú dinámico
export const menuAdmin = [
    {
      component: "Dashboard",
      icon: DashboardIcon, // Componente React
      path: "/dashboard",
      divider: false
    },
    {
      component: "Management",
      icon: SecurityIcon,
      path: "/Admin",
      divider: false,
      subMenus: [
        {
          component: "Permissions",
          icon: SecurityIcon,
          path: "/admin/permissions"
        },
        {
          component: "Actions",
          icon: BoltIcon,
          path: "/admin/actions"
        },
        {
          component: "Roles",
          icon: GroupIcon,
          path: "/admin/roles"
        },
        {
          component: "Menus",
          icon: MenuIcon,
          path: "/admin/menus"
        },
        {
          component: "Users",
          icon: PersonIcon,
          path: "/admin/users"
        }
      ]
    },
    {
      divider: true
    },
    {
      component: "Settings",
      icon: SettingsIcon,
      path: "/settings",
      divider: false
    },
    {
      component: "Logout",
      icon: ExitToAppIcon,
      path: "/logout",
      divider: false
    }
  ];
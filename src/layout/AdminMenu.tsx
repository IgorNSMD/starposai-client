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
      name: "Dashboard",
      icon: DashboardIcon, // Componente React
      route: "/dashboard",
      divider: false
    },
    {
      name: "Management",
      icon: SecurityIcon,
      divider: false,
      subMenu: [
        {
          name: "Permissions",
          icon: SecurityIcon,
          route: "/admin/permissions"
        },
        {
          name: "Actions",
          icon: BoltIcon,
          route: "/admin/actions"
        },
        {
          name: "Roles",
          icon: GroupIcon,
          route: "/admin/roles"
        },
        {
          name: "Menus",
          icon: MenuIcon,
          route: "/admin/menus"
        },
        {
          name: "Users",
          icon: PersonIcon,
          route: "/admin/users"
        }
      ]
    },
    {
      divider: true
    },
    {
      name: "Settings",
      icon: SettingsIcon,
      route: "/settings",
      divider: false
    },
    {
      name: "Logout",
      icon: ExitToAppIcon,
      route: "/logout",
      divider: false
    }
  ];
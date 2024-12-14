// Componente React conectado a Redux
import { useState, useEffect } from "react";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Paper,
  Typography,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

import {
  fetchMenus,
  fetchMenusRoot,
  createMenu,
//updateMenu,
  deleteMenu,
} from "../../store/slices/menuSlice";
import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { formContainer, formTitle, inputContainer, inputField, menusTable } from "../../styles/AdminStyles";

const Menu = () => {
  const dispatch = useAppDispatch();
  const {menusRoot, loading, error } = useAppSelector((state) => state.menus);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editingId, setEditingId] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    path: "",
    icon: "",
    parentId: "",
  });

  // Cargar permisos al montar el componente
  useEffect(() => {
    dispatch(fetchMenusRoot());
  }, [dispatch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
  };

  // Adaptada para el menú, asegurando que el tipo sea correcto
  // const handleInputChange = (event: SelectChangeEvent<string>) => {
  //   const { name, value } = event.target;
  //   setFormData((formData) => ({ ...formData, [name as string]: value }));
  // };

  // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevForm) => ({ ...prevForm, [name]: value }));
  };  

  return (
     <Box sx={formContainer}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>
            {editingId ? 'Edit Menu' : 'Add New Menu'}
        </Typography>
        <Box sx={inputContainer}>
          <TextField
            label="Label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            sx={inputField}
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: {
                  color: '#444444',
                  '&.Mui-focused': {
                    color: '#47b2e4',
                  },
                },
              },
            }}
          />
          <TextField
            label="Path"
            name="path"
            value={formData.path}
            onChange={handleChange}
            sx={inputField}
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: {
                  color: '#444444',
                  '&.Mui-focused': {
                    color: '#47b2e4',
                  },
                },
              },
            }}
          />
        </Box>
        <Box sx={inputContainer}>
          <TextField
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              sx={inputField}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
          />
          <FormControl sx={{ minWidth: 350 }}>
            <InputLabel
              id="parent-select-label"
              shrink={true} // Esto fuerza que el label permanezca visible
              sx={{
                color: "#444444",
                "&.Mui-focused": {
                  color: "#47b2e4",
                },
              }}
            >
              Parent
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="parentId"
              value={formData.parentId}
              onChange={handleInputChange}
            >
              <MenuItem value="-1">
                <em>None</em>
              </MenuItem>
              {menusRoot.map((menu) => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      <Paper sx={menusTable}>
        <Typography variant="h6" sx={{ padding: '10px', color: '#333333', fontWeight: 'bold' }}>
          Menus List
        </Typography>
      </Paper>
    </Box>
  );
};

export default Menu;
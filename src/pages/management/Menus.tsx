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

// Define la interfaz para el estado del formulario
interface FormData {
  label: string;
  path: string;
  icon: string | File; // Ahora acepta una string o un archivo File
  parentId: string;
}
const Menu = () => {
  const dispatch = useAppDispatch();
  const {menusRoot, loading, error } = useAppSelector((state) => state.menus);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editingId, setEditingId] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    label: "",
    path: "",
    icon: "", // Valor inicial como string
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Obtén el archivo seleccionado
      setFormData((prevForm) => ({
        ...prevForm,
        icon: file, // Asigna el archivo al campo `icon`
      }));
    }
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
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
      <Box sx={inputContainer}>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: "#47b2e4",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#1e88e5" },
            }}
            >
            Upload Icon
            <input
              type="file"
              hidden
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </Button>
          {/* Mostrar el nombre del archivo seleccionado */}
          {formData.icon && (
            <Typography
              variant="body2"
              sx={{
                marginTop: "5px",
                color: "#444444",
                fontStyle: "italic",
              }}
            >
              {formData.icon instanceof File ? `Selected: ${formData.icon.name}` : "No file selected"}
            </Typography>
          )}
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
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import {
  Box,
  Button,
  Typography,
  Paper,
  PaperProps,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Divider,
  Checkbox,
} from '@mui/material';
import { DataGrid, GridColDef  } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import CategoryIcon from '@mui/icons-material/Category';
import StraightenIcon from '@mui/icons-material/Straighten';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LabelIcon from '@mui/icons-material/Style';

import ExcelJS, { Row, Cell } from 'exceljs';
import { saveAs } from 'file-saver';

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  changeProductStatus,
  fetchParameters,
  searchProducts
} from '../../store/slices/productSlice';

import { Category, fetchCategoriesRoot, fetchSubcategories } from '../../store/slices/categorySlice';

import { fetchSettingByContext } from '../../store/slices/settingSlice';
import { fetchWarehouses } from '../../store/slices/warehouseSlice';
import { fetchTaxRates } from '../../store/slices/taxRateSlice';
import { fetchProviders } from '../../store/slices/providerSlice';

import {
  submitButton,
  permissionsTable,
  inputContainer,
  formTitle,
  inputField,
  cancelButton,
  modalTitleStyle,
  datagridStyle_v2,
  formContainer_v2,
} from '../../styles/AdminStyles';

import CustomDialog from '../../components/Dialog'; // Dale un alias como 'CustomDialog'
import ComponentDialog from '../../components/ComponentDialog'; // ✅ ya no se superponen
import { useToastMessages } from '../../hooks/useToastMessage';
import { baseURL_CATALOGICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable
import ProductSelectorModal from '../../components/modals/ProductSelectorModal';
import { formatCurrency } from '../../utils/formatters';

import ResponsiveActionButtons from '../../components/shared/ResponsiveActionButtons';

interface ProductComponent {
  sku: string;
  name: string;
  quantity: number;
}

interface ProductItem {
  sku: string;
  name: string;
}

const DraggablePaper = (props: PaperProps) => {
  const nodeRef = useRef(null); // Soluciona el problema de `ref` incompatible
  return (
    <Draggable handle="#draggable-dialog-title" nodeRef={nodeRef}>
      <div ref={nodeRef}>
        <Paper {...props} />
      </div>
    </Draggable>
  );
};


const renderTypeIcon = (currentType: string, type: string) => {
  return currentType === type ? (
    <CheckCircleIcon sx={{ color: '#1976d2', marginRight: 1 }} />
  ) : (
    <RadioButtonUncheckedIcon sx={{ color: '#ccc', marginRight: 1 }} />
  );
};

const Product: React.FC = () => {

  const dispatch = useAppDispatch();
  const { products, parameters, errorMessage, successMessage } = useAppSelector((state) => state.products);
  const { categoriesRoot, } = useAppSelector((state) => state.categories);
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const { currentSetting } = useAppSelector((state) => state.settings);
  const { taxRates } = useAppSelector((state) => state.taxRates); // ✅ NUEVO
  const { providers } = useAppSelector((state) => state.providers);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Estado para el diálogo de confirmación
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null); // Producto seleccionado
  const [selectorOpen, setSelectorOpen] = useState(false);
 
  // ✅ Para los componentes del modal
  const [deleteComponentDialogOpen, setDeleteComponentDialogOpen] = useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);

  const [components, setComponents] = useState<ProductComponent[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    image: '' as string | File,
    type: '',
    provider: '',     // 👈 Nuevo
    price: 0,
    category: '',
    subcategory: '', // 👈 Nuevo
    cost: 0,
    stock: 0,
    unit: '',
    initialWarehouse: '', // ✅ NUEVO
    taxRate: '', // ✅ NUEVO
    taxRateSale: '',
    taxRatePurchase: '',
    costTax: 0,
    costWithTax: 0,
    priceTax: 0,
    priceWithTax: 0,
    disableSales: false, // ✅ NUEVO
  });

  const calculateTax = (base: number, rate: number) => {
    const tax = +(base * rate / 100).toFixed(2);
    const total = +(Number(base) + tax).toFixed(2); // explícito por seguridad
    return { tax, total };
  };



  const [filters, setFilters] = useState({
    sku: '',
    name: '',
    category: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSettingByContext()); // ✅ Configuración del local actual
    dispatch(fetchProducts({ status: 'active' }));
    dispatch(fetchCategoriesRoot());
    dispatch(fetchParameters());
    dispatch(fetchWarehouses()); // ✅ NUEVO
    dispatch(fetchTaxRates()); // ✅ NUEVO
    dispatch(fetchProviders());
  }, [dispatch, ]);

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategories(formData.category)).then((res) => {
        if (fetchSubcategories.fulfilled.match(res)) {
          setSubcategories(res.payload);
        }
      });
    } else {
      setSubcategories([]);
    }
  }, [dispatch, formData.category]);

  useEffect(() => {
    if (!isModalOpen) {
      setFormData({
        sku: '',
        name: '',
        image: '',
        type: 'product',
        provider: '',
        price: 0,
        category: '',
        subcategory: '', // ✅ NUEVO
        cost: 0,
        stock: 0,
        unit: '',
        initialWarehouse: '',
        taxRate: '',
        taxRatePurchase: '',
        taxRateSale: '',
        costTax: 0,
        costWithTax: 0,
        priceTax: 0,
        priceWithTax: 0,
        disableSales: false, // ✅ NUEVO
      });
      setEditingId(null);
      setComponents([]); // ✅ Limpia la grilla
    }
  }, [isModalOpen]);

  // Manejo de mensajes
  useToastMessages(successMessage, errorMessage);
  

  // Filtrar parámetros por unit
  const unitParameters = parameters.filter((param) => param.category === 'Unit');

  const handleExportToExcel = async () => {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');
  
    // Definir columnas y encabezados con estilos
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Cost', key: 'cost', width: 10 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Unit', key: 'unit', width: 10 },
    ];
  
    // Aplicar estilos a los encabezados
    worksheet.getRow(1).eachCell((cell: Cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco y negrita
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Azul de fondo
      };
    });
  
    // Agregar datos desde `rows`
    rows.forEach((row) => {
      worksheet.addRow(row);
    });
  
    // Aplicar bordes y estilos a las celdas de datos
    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (rowNumber !== 1) { // Excluir los encabezados
        row.eachCell((cell: Cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });
  
    // Generar archivo Excel y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'products.xlsx');
  };
  

  const openMainDeleteDialog  = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteDialogOpen(true);
  };

  const openComponentDeleteDialog = (index: number) => {
  setSelectedComponentIndex(index);
  setDeleteComponentDialogOpen(true);
};
  
  const handleDeleteDialogClose = () => {
    setSelectedProductId(null);
    setIsDeleteDialogOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (selectedProductId) {
      dispatch(changeProductStatus({ 
        id: selectedProductId, 
        status: 'inactive' 
      }))
        .unwrap()
        .then(() => {
          console.log('Estado cambiado a inactive con éxito');
          dispatch(fetchProducts({ status: 'active' }));
        })
        .catch((error) => {
          console.error('Error al cambiar el estado del producto:', error);
        });
    }
    handleDeleteDialogClose();
  };

  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      sku: '',
      name: '',
      image: '',
      type: 'product', // ✅ Valor inicial por defecto
      provider: '',
      price: 0,
      category: '',
      subcategory: '', // ✅ NUEVO
      cost: 0,
      stock: 0,
      unit: '',
      initialWarehouse: '', // ✅ NUEVO
      taxRate:'',
      taxRatePurchase: '',
      taxRateSale: '',
      costTax: 0,
      costWithTax: 0,
      priceTax: 0,
      priceWithTax: 0,
      disableSales: false, // ✅ NUEVO

     });
    setEditingId(null);
  };

  const handleSubmit = () => {
    const fd = new FormData();

    // Añadir campos del formulario
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "priceWithTax" || key === "cost" || key === "price" || key === "costWithTax" || key === "costTax" || key === "priceTax") {
        fd.append(key, parseFloat(value.toString() || '0').toString());
      } else {
        fd.append(key, value as string);
      }
    });


    // ✅ Añadir los componentes correctamente serializados
    fd.append("components", JSON.stringify(
      components.map((c) => ({
        productName: c.name,
        product: c.sku,
        quantity: c.quantity,
      }))
    ));

    if (editingId) {
      dispatch(updateProduct({ id: editingId, formData: fd }))
        //.unwrap()
        .then(() => {
          dispatch(fetchProducts({ status: 'active' }));
          handleCloseModal(); // 👈 solo se cierra cuando realmente se grabó
        })
        .catch(() => {
          // en caso de error, el mensaje lo manejará el hook
        });
    } else {
      dispatch(createProduct(fd))
        //.unwrap()
        .then(() => {
          dispatch(fetchProducts({ status: 'active' }));
          handleCloseModal(); // 👈 solo se cierra cuando realmente se grabó
        })
        .catch(() => {
          // en caso de error, el mensaje lo manejará el hook
        });
    }
  };


  const handleEdit = (id: string) => {
    const product = products.find((prod) => prod._id === id);
    if (product) {
      const taxPurchase = typeof product.taxRatePurchase === 'string' 
        ? product.taxRatePurchase 
        : product.taxRatePurchase?._id || '';

      const taxSale = product.taxRateSale || '';
      const cost = product.cost || 0;
      const priceWithTax = product.priceWithTax || 0;

      // Cálculos de impuestos
      const costRate = taxRates.find(r => r._id === taxPurchase)?.rate || 0;
      const costTaxData = calculateTax(cost, costRate);

      //const priceRate = taxRates.find(r => r._id === taxSale)?.rate || 0;
      const price = product.price || 0;
      const priceTaxValue = +(priceWithTax - price).toFixed(2);

      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        image: product.image || '',
        type: product.type || '',
        provider: product.provider || '',
        price,
        category: product.category || '',
        subcategory: product.subcategory || '', // ✅ NUEVO
        cost,
        stock: product.stock || 0,
        unit: product.unit || '',
        initialWarehouse: product.initialWarehouse || '',
        taxRate: product.taxRate || '',

        // Nuevos campos agregados para cálculos
        taxRatePurchase: taxPurchase,
        taxRateSale: taxSale,
        costTax: costTaxData.tax,
        costWithTax: costTaxData.total,
        priceWithTax,
        priceTax: priceTaxValue,

        disableSales: product.disableSales || false, // ✅ NUEVO

      });

      // Cargar componentes si existen (solo para recipe o kit)
      if (product.components && (product.type === 'recipe' || product.type === 'kit')) {
        setComponents(
          product.components.map((comp) => {
            const matchedProduct = products.find(p => p._id === comp.product); // Busca por _id
            return {
              sku: matchedProduct?.sku || '', // Usa el SKU real si lo encuentra
              name: comp.productName,
              quantity: comp.quantity
            };
          })
        );
      } else {
        setComponents([]); // Por seguridad si es producto normal
      }


      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleSearch = () => {
    dispatch(searchProducts({
      ...filters,
    }));
  };


        // Manejador para Select
  const handleInputChange = (event: SelectChangeEvent<string>) => {
  const { name, value } = event.target;

  setFormData((prevForm) => {
    const updatedForm = {
      ...prevForm,
      [name]: value
    };

    // Recalcular valores si se cambió un impuesto
    if (name === 'taxRatePurchase') {
      const rate = taxRates.find(rate => rate._id === value)?.rate || 0;
      const result = calculateTax(updatedForm.cost, rate);
      updatedForm.costTax = result.tax;
      updatedForm.costWithTax = result.total;
    }

    if (name === 'taxRateSale') {
      const rate = taxRates.find(rate => rate._id === value)?.rate || 0;
      const priceWithVat = updatedForm.priceWithTax;
      const tax = +(priceWithVat - priceWithVat / (1 + rate / 100)).toFixed(2);
      const net = +(priceWithVat / (1 + rate / 100)).toFixed(2);
      updatedForm.priceTax = tax;
      updatedForm.price = net;
    }

    return updatedForm;
  });
};


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Obtén el archivo seleccionado
      setFormData((prevForm) => ({ ...prevForm, image: file }));
    }
  };

  // Manejador para Select
  const handleInputChangeFilter = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    //console.log('name, value',name, value)
    setFilters((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleFilterChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'priceWithTax' || name === 'cost') {
      const normalized = value.replace(',', '.');

      setFormData((prev) => {
        const parsed = parseFloat(normalized);
        const updatedForm = {
          ...prev,
          [name]: value, // ← guarda el texto original, no el número
        };

        const taxRateId = name === 'cost' ? prev.taxRatePurchase : prev.taxRateSale;
        const rate = taxRates.find(rate => rate._id === taxRateId)?.rate || 0;

        if (isNaN(parsed)) {
          if (name === 'cost') {
            updatedForm.costTax = 0;
            updatedForm.costWithTax = 0;
          } else {
            updatedForm.priceTax = 0;
            updatedForm.price = 0;
          }
        } else {
          if (name === 'cost') {
            const result = calculateTax(parsed, rate);
            updatedForm.costTax = result.tax;
            updatedForm.costWithTax = result.total;
          } else {
            const tax = +(parsed - parsed / (1 + rate / 100)).toFixed(2);
            const net = +(parsed / (1 + rate / 100)).toFixed(2);
            updatedForm.priceTax = tax;
            updatedForm.price = net;
          }
        }

        return updatedForm;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };



  

  const handleSelectComponent = (product: ProductItem, quantity: number) => {
    setComponents((prev) => {
      const index = prev.findIndex((comp) => comp.sku === product.sku);

      if (index !== -1) {
        // Ya existe → sumamos la cantidad
        const updated = [...prev];
        updated[index].quantity += quantity;
        return updated;
      }

      // No existe → lo agregamos como nuevo
      return [
        ...prev,
        {
          sku: product.sku,
          name: product.name,
          quantity,
        },
      ];
    });

    setSelectorOpen(false);
  };



  const rows = products.filter((product) => product._id && product.name) // Filtra registros válidos
    .map((product) => {
    const categoryName = categoriesRoot.find((cat) => cat._id === product.category)?.name || "N/A";
    const warehouseName = warehouses.find(w => w._id === product.initialWarehouse)?.name || '-';
    const taxRateInfo = taxRates.find(rate => rate._id === product.taxRate);
    const taxRateLabel = taxRateInfo ? `${taxRateInfo.name} ` : '-';

    return {
      id: product._id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,    
      category: categoryName, // Aquí asignas el nombre de la categoría
      cost: product.cost,
      stock: product.stock,
      unit: product.unit,
      initialWarehouse: warehouseName, // ✅ nombre en lugar de ID
      taxRate: taxRateLabel, // ✅ NUEVO
    };
  });

  const columns: GridColDef[] = [
    { 
      field: 'sku', 
      headerName: 'SKU', 
      minWidth: 150
      //flex: 0.5,  
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      minWidth: 400
      //flex: 0.5,  
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      minWidth: 250
      //flex: 0.5, 
    },
    // {
    //   field: 'price',
    //   headerName: 'Price',
    //   flex: 0.5,
    //   align: 'right',
    //   headerAlign: 'right',
    // },
    // {
    //   field: 'stock',
    //   headerName: 'Stock',
    //   flex: 0.5,
    //   minWidth: 100,
    //   align: 'right',
    //   headerAlign: 'right',
    // },
    // { field: 'initialWarehouse', headerName: 'Warehouse', flex: 1 },
    // { field: 'taxRate', headerName: 'Tax Rate', flex: 1 }, // ✅ NUEVO
    {
      field: 'actions',
      headerName: 'Actions',
      //flex: 0.5,
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => openMainDeleteDialog(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];
  
    const getIconUrl = (iconPath: string) => {
      return iconPath && !iconPath.startsWith('http')
        ? `${baseURL_CATALOGICONS}/${iconPath}`
        : iconPath;
    };
  

  return (
    <Box sx={formContainer_v2}>
      <Paper sx={{ padding: '20px', marginBottom: '1px', width: '100%' }}>
        <Typography sx={formTitle}>Product Management</Typography>
        <Box sx={inputContainer}>
          <TextField
            label="SKU"
            name="sku"
            onChange={handleFilterChange}
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
            label="Name"
            name="name"
            onChange={handleFilterChange}
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
          <FormControl sx={{ width: '100%' }}>
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
              Category
            </InputLabel>
            <Select
              labelId="parent-select-label"
              name="category"
              value={filters.category} // Garantiza un valor seguro
              onChange={handleInputChangeFilter}
            >
              {categoriesRoot.map((r) => {
                //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                const uniqueKey = r._id;
                //console.log('uniqueKey->', uniqueKey)
                return (
                  <MenuItem key={uniqueKey} value={uniqueKey}>
                    {r.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>          
        </Box>
        <ResponsiveActionButtons
          onAdd={handleOpenModal}
          onSearch={handleSearch}
          onExport={handleExportToExcel}
          addLabel="New Product"
        />
      </Paper>        


      {/* Tabla */}
      <Paper sx={permissionsTable}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={datagridStyle_v2}
        />
      </Paper>

      {/* Modal */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperComponent={DraggablePaper} // Usa el componente ajustado
          maxWidth={false} // 👈 importante para quitar el ancho limitado
          fullWidth
          PaperProps={{
            sx: {
              width: '90vw',         // 👈 ancho total del modal (ajustable)
              maxWidth: '1000px',    // 👈 puedes aumentarlo más si lo deseas
              borderRadius: '12px',
            }
          }}
        >
          <DialogTitle
            id="draggable-dialog-title"
            sx={modalTitleStyle}
          >
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogContent
            sx={{
              maxHeight: '75vh', // o '80vh' según necesites
              overflowY: 'auto',
            }}
          >


            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {/* <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} /> */}
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                    Datos Generales
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.disableSales}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          disableSales: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Deshabilitar para ventas"
                />                

              </Grid> 
              <Grid item xs={12} md={6}>
                {/* <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} /> */}
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                    Product Image
                </Typography>
                
              </Grid> 
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SKU"
                    name="sku"
                    value={formData.sku}
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: '#999' }} />,
                    }}
                    onChange={handleChange}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
                      pointerEvents: 'none', // No permite interacción
                    }}
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
                    label="Name"
                    name="name"
                    value={formData.name}
                    InputProps={{
                      startAdornment: <DriveFileRenameOutlineIcon sx={{ mr: 1, color: '#999' }} />,
                    }}
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
                  <FormControl sx={{ ...inputField }}>
                    <InputLabel
                      id="category-label"
                      shrink={true}
                      sx={{
                        color: "#444444",
                        "&.Mui-focused": {
                          color: "#47b2e4",
                        },
                      }}
                    >
                      Category
                    </InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                       startAdornment={<CategoryIcon sx={{ mr: 1, color: '#999' }} />}
                    >
                      {categoriesRoot.map((r) => (
                        <MenuItem key={r._id} value={r._id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ ...inputField }}>
                      <InputLabel
                        shrink
                        sx={{
                          color: "#444444",
                          "&.Mui-focused": {
                            color: "#47b2e4",
                          },
                        }}
                      >
                        Subcategoría
                      </InputLabel>
                    <Select
                      name="subcategory"
                      value={formData.subcategory || ''}
                      onChange={handleInputChange}
                      startAdornment={<LabelIcon sx={{ mr: 1, color: '#999' }} />}
                    >
                      {subcategories.map((scat) => (
                        <MenuItem key={scat._id} value={scat._id}>
                          {scat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
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
                      Unit
                    </InputLabel>
                    <Select
                      labelId="parent-select-label"
                      name="unit"
                      value={formData.unit} // Garantiza un valor seguro
                      onChange={handleInputChange}
                      startAdornment={<StraightenIcon sx={{ mr: 1, color: '#999' }} />}
                    >
                      {/* <MenuItem key="-1" value="-1">
                        <em>None</em>
                      </MenuItem> */}
                      {unitParameters.map((r) => {
                        //const uniqueKey = menuroot.id || `fallback-key-${index}`;
                        const uniqueKey = r._id;
                        //console.log('uniqueKey->', uniqueKey)
                        return (
                          <MenuItem key={uniqueKey} value={uniqueKey}>
                            {r.value}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>                                                   
                </Grid>

                <Grid item xs={12} md={6}> {/* Columna 2 */}
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
                    {formData.image && (
                      <Box sx={{ 
                        marginTop: "10px", 
                        display: "flex",
                        justifyContent: "center",  // ✅ centra horizontalmente
                        alignItems: "center",
                        width: "100%",
                        }}>
                          <Box sx={{ textAlign: "center" }}>
                            <img
                              src={
                                formData.image instanceof File
                                  ? URL.createObjectURL(formData.image) // Icono temporal si es un archivo subido
                                  : getIconUrl(formData.image) // Icono desde el servidor
                              }
                              alt="Menu Icon"
                              style={{
                                maxWidth: "50%",
                                height: "auto",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                marginTop: "10px"
                              }}
                            />
                          </Box>
                      </Box>
                    )}
               </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} />
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                  Datos Ventas
                </Typography>
              </Grid>
              {formData.type === 'recipe' || formData.type === 'kit' ? (
               <Grid item xs={12} md={6}>
                <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} />
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                  Product components
                </Typography>
              </Grid>
              ) : null}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                 <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel
                    shrink={true}
                    sx={{
                      color: "#444444",
                      "&.Mui-focused": {
                        color: "#47b2e4",
                      },
                    }}
                  >
                    Tax Rate
                  </InputLabel>
                  <Select
                    name="taxRateSale"
                    value={formData.taxRateSale}
                    onChange={handleInputChange}
                  >
                    {taxRates
                      .filter(rate => 
                        rate.isActive && 
                        rate.appliesTo.includes("SalesOrder") &&
                        rate.country.toLowerCase() === (currentSetting?.country || "").toLowerCase() ) // Solo para compras
                      .map(rate => (
                        <MenuItem key={rate._id} value={rate._id}>
                          {rate.name} 
                        </MenuItem>
                      ))}
                  </Select>
                 </FormControl>  
                 <TextField
                    label="Total w/VAT"
                    name="priceWithTax"
                    type="text" // ⚠️ importante: no uses type="number"
                    value={formData.priceWithTax}
                    onChange={handleChange}
                    sx={{
                      ...inputField,
                      //backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
                      //pointerEvents: 'none', // No permite interacción
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*[.,]?[0-9]*'
                    }}
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
                    label="Tax Amount"
                    name="priceTax"
                    value={formatCurrency(formData.priceTax, "€ ")}
                    //onChange={handleChange}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
                      pointerEvents: 'none', // No permite interacción
                    }}
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
                    label="Price"
                    name="price"
                    value={formatCurrency(formData.price, "€ ")}
                    //onChange={handleChange}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
                      pointerEvents: 'none', // No permite interacción
                    }}
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
              </Grid>
              {formData.type === 'recipe' || formData.type === 'kit' ? (
              <Grid item xs={12} md={6}> {/* Columna 2 */}
                <Button
                    variant="contained"
                    component="label"
                    onClick={() => setSelectorOpen(true)}
                    sx={{
                      backgroundColor: "#47b2e4",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "#1e88e5" },
                    }}
                >
                  Add Component
                </Button>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#3f51b5" }}>
                        <TableRow>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Quantity</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Unit</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "right" }}>Delete</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {components.map((comp, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{comp.name}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={comp.quantity}
                                onChange={(e) => {
                                  const updated = [...components];
                                  updated[index].quantity = parseInt(e.target.value, 10);
                                  setComponents(updated);
                                }}
                                sx={{ width: "80px" }}
                              />
                            </TableCell>
                            <TableCell>
                            {
                              unitParameters.find(
                                (u) => u._id === products.find(p => p.sku === comp.sku)?.unit
                              )?.value || "-"
                            }
                          </TableCell>
                            <TableCell align="right">
                              <IconButton color="error" 
                                  onClick={() => openComponentDeleteDialog(index)}
                                  >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>                
              </Grid>
              ) : null}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} />
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                  Datos Costos
                </Typography>
              </Grid>
              {formData.type === 'product' || formData.type === 'kit' ? (     
              <Grid item xs={12} md={6}>
                <Divider sx={{ mt: 1, mb: 2, borderColor: '#ccc' }} />
                <Typography variant="h6" sx={{ mt: 3, mb: 3, fontWeight: 600, color: '#333' }}>
                  Datos Inventario
                </Typography>
              </Grid>  
              ) : null}            
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                 <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel
                    shrink={true}
                    sx={{
                      color: "#444444",
                      "&.Mui-focused": {
                        color: "#47b2e4",
                      },
                    }}
                  >
                    Tax Rate
                  </InputLabel>
                  <Select
                    name="taxRatePurchase"
                    value={formData.taxRatePurchase}
                    onChange={handleInputChange}
                  >
                    {taxRates
                      .filter(rate => 
                        rate.isActive && 
                        rate.appliesTo.includes("PurchaseOrder") &&
                        rate.country.toLowerCase() === (currentSetting?.country || "").toLowerCase() ) // Solo para compras
                      .map(rate => (
                        <MenuItem key={rate._id} value={rate._id}>
                          {rate.name} 
                        </MenuItem>
                      ))}
                  </Select>
                 </FormControl>  
                  <TextField  
                    label="Cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    sx={{
                      ...inputField,
                      // backgroundColor: '#f5f5f5', // Fondo gris claro para indicar que está deshabilitado
                      // pointerEvents: 'none', // No permite interacción
                    }}
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
                    label="Tax Amount"
                    name="costTax"
                    value={formatCurrency(formData.costTax,"€ ")}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5',
                      pointerEvents: 'none',
                    }}
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
                    label="Total w/VAT"
                    name="costWithTax"
                    value={formatCurrency(formData.costWithTax, "€ ")}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5',
                      pointerEvents: 'none',
                    }}
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
              </Grid>

              {formData.type === 'product' || formData.type === 'kit' ? (     
              <Grid item xs={12} md={6}>
                <TextField
                    label="Stock"
                    name="stock"
                    value={formData.stock}
                    sx={{
                      ...inputField,
                      backgroundColor: '#f5f5f5',
                      pointerEvents: 'none',
                    }}
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
                <FormControl sx={{ ...inputField }}>
                    <InputLabel
                      id="initialWarehouse-label"
                      shrink={true}
                      sx={{
                        color: "#444444",
                        "&.Mui-focused": {
                          color: "#47b2e4",
                        },
                      }}
                    >
                      initial Warehouse
                    </InputLabel>
                    <Select
                      labelId="initialWarehouse-label"
                      name="initialWarehouse"
                      value={formData.initialWarehouse}
                      onChange={handleInputChange}
                    >
                      {warehouses.map((r) => (
                        <MenuItem key={r._id} value={r._id}>
                          {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                </FormControl>

                {/* Autocomplete Proveedor */}
                <Autocomplete
                  options={providers}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  value={providers.find((p) => p._id === formData.provider) || null}
                  onChange={(_, selected) => {
                    setFormData((prev) => ({
                      ...prev,
                      provider: selected?._id || '',
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Provider"
                      fullWidth
                      sx={{
                        ...inputField,
                        "& label": {
                          color: "#444444",
                        },
                        "& label.Mui-focused": {
                          color: "#47b2e4",
                        },
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 1,
                    marginBottom: 3,
                    backgroundColor: '#fafafa',
                  }}
                >

                {editingId ? (
                  <Box 
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: {
                        xs: 'column', // columna en móviles
                        sm: 'row',     // fila en pantallas medianas en adelante
                      },
                    }}
                    >
                    {renderTypeIcon(formData.type, 'product')} <Typography>Producto</Typography>
                    {renderTypeIcon(formData.type, 'recipe')} <Typography>Receta</Typography>
                    {renderTypeIcon(formData.type, 'kit')} <Typography>Kit</Typography>
                  </Box>
                ) : (
                <RadioGroup
                  row
                  name="type"
                  value={formData.type || 'product'}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      type: newType,
                    }));

                    // Si el usuario cambia a "product", se oculta y limpia la grilla
                    if (newType === 'product') {
                      setComponents([]); // ✅ Vaciar componentes
                    }
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: {
                      xs: 'column', // En móviles: vertical
                      sm: 'row',    // Desde sm en adelante: horizontal
                    },
                    gap: 1,
                    alignItems: 'flex-start',
                  }}
                >
                  <FormControlLabel value="product" control={<Radio />} label="Producto" />
                  <FormControlLabel value="recipe" control={<Radio />} label="Receta" />
                  <FormControlLabel value="kit" control={<Radio />} label="Kit" />
                </RadioGroup>
                )}

                </Box>                   
              </Grid>              
              ) : 
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 1,
                    marginBottom: 3,
                    backgroundColor: '#fafafa',
                  }}
                >

                {editingId ? (
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    {renderTypeIcon(formData.type, 'product')} <Typography>Producto</Typography>
                    {renderTypeIcon(formData.type, 'recipe')} <Typography>Receta</Typography>
                    {renderTypeIcon(formData.type, 'kit')} <Typography>Kit</Typography>
                  </Box>
                ) : (
                <RadioGroup
                  row
                  name="type"
                  value={formData.type || 'product'}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      type: newType,
                    }));

                    // Si el usuario cambia a "product", se oculta y limpia la grilla
                    if (newType === 'product') {
                      setComponents([]); // ✅ Vaciar componentes
                    }
                  }}
                >
                  <FormControlLabel value="product" control={<Radio />} label="Producto" />
                  <FormControlLabel value="recipe" control={<Radio />} label="Receta" />
                  <FormControlLabel value="kit" control={<Radio />} label="Kit" />
                </RadioGroup>
                )}

                </Box>                   
              </Grid>
              }
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={submitButton}
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
              sx={cancelButton}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <CustomDialog
        isOpen={isDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product?."
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
      />

      {/* Diálogo para eliminar un componente desde la tabla interna */}
      <ComponentDialog
        isOpen={deleteComponentDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to remove this component?"
        onClose={() => setDeleteComponentDialogOpen(false)}
        onConfirm={() => {
          if (selectedComponentIndex !== null) {
            const updated = components.filter((_, i) => i !== selectedComponentIndex);
            setComponents(updated);
            setDeleteComponentDialogOpen(false);
          }
        }}
      />

      <ProductSelectorModal
        open={selectorOpen}
        products={products}
        filterType="product" // solo permite seleccionar productos
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectComponent}
      />

      

    </Box>
  );
};

export default Product;
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Box,
  Grid,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Alert,
  Select,
  IconButton,
  Checkbox,
  Chip, 
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt'; // ícono tipo lista
import MapIcon from "@mui/icons-material/Map";


import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { fetchProductsSales,  } from '../../store/slices/productSlice';
import { Category, fetchCategoriesRoot, fetchSubcategories } from '../../store/slices/categorySlice';

import { fetchStaffs } from '../../store/slices/staffSlice';
import { fetchRooms } from '../../store/slices/roomSlice';
import { fetchTablesByRoom, updateTableStatus  } from '../../store/slices/tableSlice';
import { addItemsToSale, cancelSale, closeSale, createSale, deleteSale, fetchSales, SaleItem  } from '../../store/slices/saleSlice';
import type { Sale } from '../../store/slices/saleSlice';
import { fetchReservations } from '../../store/slices/reservationSlice';
import type { Reservation } from '../../store/slices/reservationSlice';

import { useToast } from '../../hooks/useToastMessage';
import { formatCurrency } from '../../utils/formatters';

import { baseURL_CATALOGICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable
import InProgressOrdersPanel from "./components/InProgressOrdersPanel";
import FullScreenRoomMap from "./components/FullScreenRoomMap";
import CloseDayModal from "../../components/modals/CloseDayModal";





interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  // otros campos si los necesitas
}

interface SelectedProduct extends Product {
  quantity: number;
}

const SalePOS = () => {
  const dispatch = useAppDispatch();

  const [saleMode, setSaleMode] = useState("quick");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState<number | "">("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [drawerSale, setDrawerSale] = useState<Sale | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [isTakeAway, setIsTakeAway] = useState(false);
  const [closeDayOpen, setCloseDayOpen] = useState(false);

  const hasOpenedMapRef = useRef(false);

  const products = useAppSelector((state) => state.products.products);
  const {categoriesRoot } = useAppSelector((state) => state.categories);
  const staffs = useAppSelector((state) => state.staffs.staffs);
  const rooms = useAppSelector((state) => state.rooms.rooms);
  const tables = useAppSelector((state) => state.tables.tables);
  const sales = useAppSelector((state) => state.sales.sales);

  useHotkeys('f2', () => {
    setShowOrdersPanel(prev => !prev);
  });

  useHotkeys('f8', async () => {
    // Solo confirmar si se cumple condición
    if (selectedProducts.length === 0 || !isSelectionValid) return;

    try {
      const saleItems = selectedProducts.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      }));

      const validCash = typeof cashGiven === "number" ? cashGiven : 0;

      const payload = {
        staffId: selectedStaff,
        tableId: selectedTable,
        saleItems,
        isTakeAway,
        status: (saleMode === "quick" ? "paid" : "in_progress") as "pending" | "in_progress" | "paid" | "cancelled",
        payment: {
          method: paymentMethod as "cash" | "card",
          total,
          amountPaid: paymentMethod === "cash" ? validCash : total,
          change: paymentMethod === "cash" ? validCash - total : 0,
        },
      };

      await dispatch(createSale(payload)).unwrap();

      if (selectedTable) {
        await dispatch(updateTableStatus({ tableId: selectedTable, status: "occupied" })).unwrap();
      }

      setSelectedProducts([]);
      setSelectedTable("");
      setSelectedStaff("");
      setCashGiven("");
      setPaymentMethod("cash");

      showSuccessToast("Pedido registrado con éxito");
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "Error al registrar pedido");
    }
  });

  useHotkeys('esc', () => {
    if (drawerSale) {
      setDrawerSale(null);
    }
  });


  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast();

  const initialRightPanelWidth = Math.floor(window.innerWidth * 0.2);

  // const refreshSale = async (saleId: string) => {
  //   const result = await dispatch(fetchSales()) as { payload?: Sale[] };
  //   const updatedSale = result.payload?.find(s => s._id === saleId);
  //   if (updatedSale) {
  //     setDrawerSale(updatedSale);
  //   }
  // };


  useEffect(() => {
    dispatch(fetchCategoriesRoot());
    dispatch(fetchProductsSales({ status: "active" }));
    dispatch(fetchStaffs()); // 🔹 Aquí agregamos la carga de staff dinámico
    dispatch(fetchRooms()); // 🔹 Carga dinámica de salones
  }, [dispatch]);

  useEffect(() => {
    if (selectedRoom) {
      dispatch(fetchTablesByRoom(selectedRoom));
    }
  }, [selectedRoom, dispatch]);

  

  useEffect(() => {
    dispatch(fetchSales()).then((result) => {
      const action = result as { payload?: Sale[] };

      if (action.payload) {
        const activeSales = action.payload.filter(
          (s) => s.status === "in_progress" && s.tableId
        );

        const occupiedTableIds = activeSales.map((s) => {
          if (typeof s.tableId === "object" && s.tableId !== null && "_id" in s.tableId) {
            return (s.tableId as { _id: string })._id;
          }
          return s.tableId as string;
        });


        // 🟥 Marcar mesas como ocupadas
        occupiedTableIds.forEach((tableId) => {
          dispatch(updateTableStatus({ tableId, status: "occupied" }));
        });

        // 🟩 Marcar mesas restantes como disponibles
        const allTableIds = tables.map((t) => t._id);
        const availableTableIds = allTableIds.filter(
          (id) => !occupiedTableIds.includes(id)
        );

        availableTableIds.forEach((tableId) => {
          dispatch(updateTableStatus({ tableId, status: "available" }));
        });
      }
    });
  }, [dispatch, tables]);


  useEffect(() => {
    if (drawerSale && saleMode === "table") {
      const items = drawerSale.saleItems.map(item => ({
        _id: typeof item.productId === "string" ? item.productId : item.productId._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      setSelectedProducts(items);
    }
  }, [drawerSale, saleMode]);


  useEffect(() => {
    if (saleMode === "table" && staffs.length > 0 && !selectedStaff) {
      setSelectedStaff(staffs[0]._id);
    }
  }, [saleMode, staffs, selectedStaff]);

  useEffect(() => {
    if (saleMode === "table" && !hasOpenedMapRef.current) {
      if (rooms.length > 0) {
        setSelectedRoom(rooms[0]._id);
      }
      setShowFullMap(true);
      hasOpenedMapRef.current = true; // ✅ evitar que vuelva a abrir
    }

    if (saleMode !== "table") {
      hasOpenedMapRef.current = false; // ✅ resetea si vuelve a "quick"
    }
  }, [saleMode, rooms]);

  useEffect(() => {
    if (saleMode === "table" && selectedTable && sales.length > 0) {
      const activeSale = sales.find(
        (s) =>
          s.status === "in_progress" &&
          ((typeof s.tableId === "string" && s.tableId === selectedTable) ||
          (typeof s.tableId === "object" && s.tableId !== null && "_id" in s.tableId && s.tableId._id === selectedTable))
      );

      if (activeSale) {
        const items = activeSale.saleItems.map(item => ({
          _id: typeof item.productId === "string" ? item.productId : item.productId._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));
        setSelectedProducts(items);
        setDrawerSale(activeSale);
      } else {
        // No hay venta activa → limpiar
        setSelectedProducts([]);
        setDrawerSale(null);
      }
    }
  }, [selectedTable, saleMode, sales]);

  useEffect(() => {
    const updateTableStatuses = async () => {
      try {
        const salesResult = await dispatch(fetchSales()) as { payload?: Sale[] };
        const reservationResult = await dispatch(fetchReservations()) as { payload?: Reservation[] };

        const now = new Date();
        const warningTime = 60 * 60 * 1000; // 60 minutos

        const reservations = reservationResult.payload || [];
        
        const upcomingReservations = reservations.filter((r) => {
          if (r.status !== "confirmed" || !r.tableId) return false;
          const time = new Date(r.reservationTime).getTime();
          const diff = time - now.getTime();
          return diff >= 0 && diff <= warningTime;
        });


        const reservedTableIds = upcomingReservations.map((r) =>
          typeof r.tableId === "object" ? r.tableId._id : r.tableId
        );

        const currentSales = salesResult.payload || [];
        const occupiedTableIds = currentSales
          .filter((s) => s.status === "in_progress" && s.tableId)
          .map((s) =>
            typeof s.tableId === "object" ? s.tableId._id : s.tableId
          );

        const allTableIds = tables.map((t) => t._id);

        allTableIds.forEach((tableId) => {
          let status: "available" | "occupied" | "reserved" = "available";

          if (occupiedTableIds.includes(tableId)) {
            status = "occupied";
          } else if (reservedTableIds.includes(tableId)) {
            status = "reserved";
          }

          dispatch(updateTableStatus({ tableId, status }));
        });
      } catch (err) {
        console.error("Error al actualizar estados de mesa:", err);
      }
    };

    updateTableStatuses();
  }, [dispatch, tables]);


  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    if (selectedSubcategory) return p.subcategory === selectedSubcategory;
    return p.category === selectedCategory;
  });



  const isSelectionValid = saleMode === "quick" || (selectedTable && selectedStaff);

  const handleAddProduct = async (product: Product) => {
    // Buscar venta activa si existe
    const activeSale = saleMode === "table" && selectedTable && selectedStaff && sales.find(
      (s) =>
        s.status === "in_progress" &&
        ((typeof s.tableId === "string" && s.tableId === selectedTable) ||
        (typeof s.tableId === "object" && s.tableId !== null && "_id" in s.tableId && s.tableId._id === selectedTable))
    );

    if (activeSale) {
      // Ya existe venta activa → solo actualizar ítems
      const existing = activeSale.saleItems.find((p: SaleItem) => {
        const pid = typeof p.productId === 'string'
          ? p.productId
          : (p.productId as { _id: string })._id;
        return pid === product._id;
      });

      let updatedItems;

      if (existing) {
        updatedItems = activeSale.saleItems.map((p: SaleItem) => {
          const pid = typeof p.productId === 'string'
            ? p.productId
            : (p.productId as { _id: string })._id;
          return pid === product._id
            ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.price }
            : p;
        });
      } else {
        updatedItems = [
          ...activeSale.saleItems,
          {
            productId: product._id,
            name: product.name,
            quantity: 1,
            price: product.price,
            subtotal: product.price,
          },
        ];
      }

      await dispatch(addItemsToSale({
        saleId: activeSale._id,
        saleItems: updatedItems,
      }));

      const result = await dispatch(fetchSales()) as { payload: Sale[] };
      const updatedSales = result.payload;
      const updatedSale = updatedSales.find(s => s._id === activeSale._id);
      if (updatedSale) {
        setDrawerSale(updatedSale);
        if (saleMode === "table") {
          const items = updatedSale.saleItems.map(item => ({
            _id: typeof item.productId === "string" ? item.productId : item.productId._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }));
          setSelectedProducts(items);
        }
      }

    } else {
      // 🔹 No existe venta activa → crear nueva venta si es "en mesa"
      if (saleMode === "table" && selectedTable && selectedStaff) {
        const saleItem = {
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.price,
          subtotal: product.price,
        };

        try {
          const newSale = await dispatch(createSale({
            staffId: selectedStaff,
            tableId: selectedTable,
            saleItems: [saleItem],
            isTakeAway: false,
            status: "in_progress",
            payment: {
              method: paymentMethod as "cash" | "card",
              total: product.price,
              amountPaid: 0,
              change: 0,
            },
          })).unwrap();

          await dispatch(updateTableStatus({ tableId: selectedTable, status: "occupied" }));

          const result = await dispatch(fetchSales()) as { payload: Sale[] };
          const created = result.payload.find((s) => s._id === newSale._id);
          if (created) {
            setDrawerSale(created);
            setSelectedProducts([{
              _id: product._id,
              name: product.name,
              price: product.price,
              quantity: 1,
            }]);
          }

          showSuccessToast("Pedido iniciado con éxito");
        } catch  {
          showErrorToast("Error al crear el pedido");
        }

      } else {
        // 🟦 Pedido rápido
        const existing = selectedProducts.find(p => p._id === product._id);
        if (existing) {
          setSelectedProducts(selectedProducts.map(p =>
            p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
          ));
        } else {
          setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
      }
    }
  };




  // const handleTableClick = (tableId: string) => {
  //   const sale = sales.find(
  //     (s) => s.status === "in_progress" && s.tableId === tableId
  //   );

  //   if (sale) {
  //     setDrawerSale(sale); // Abre el Drawer

  //     // ✅ Posiciona automáticamente los selects
  //     if (typeof sale.staffId === "string") {
  //       setSelectedStaff(sale.staffId);
  //     } else if (sale.staffId && "_id" in sale.staffId) {
  //       setSelectedStaff(sale.staffId._id);
  //     }

  //     if (typeof sale.tableId === "string") {
  //       setSelectedTable(sale.tableId);
  //     } else if (sale.tableId && "_id" in sale.tableId) {
  //       setSelectedTable(sale.tableId._id);
  //     }
  //   }

  // };

  const total = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const change = paymentMethod === "cash" && cashGiven !== "" ? cashGiven - total : 0;

  const getIconUrl = (iconPath?: string): string => {
    return iconPath && !iconPath.startsWith('http')
      ? `${baseURL_CATALOGICONS}/${iconPath}`
      : iconPath || ''; // Ruta por defecto si está vacío
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* Panel izquierdo */}
        <Box sx={{ flexGrow: 1, pr: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{
            mt: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 56, // 🔹 Altura mínima uniforme
            flexWrap: 'wrap', // 🔹 Previene que se desborde en pantallas pequeñas
          }}>
            <RadioGroup row value={saleMode} onChange={(e) => setSaleMode(e.target.value)}>
              <FormControlLabel value="quick" control={<Radio />} label="Pedido Rápido" />
              <FormControlLabel value="table" control={<Radio />} label="Pedido en Mesa" />
            </RadioGroup>

            {saleMode === "table" && (
              <>
                <TextField
                  select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  sx={{ width: 150 }}
                  size="small"
                >
                  {staffs.map((s) => (
                     <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem> // ✅ ahora se guarda el ID
                  ))}
                </TextField>

                <TextField
                  select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  sx={{ width: 120 }}
                  size="small"
                >
                  <MenuItem value="">-- Mesa --</MenuItem>
                  {tables.map((table) => (
                      <MenuItem key={table._id} value={table._id}>
                        {table.name}
                      </MenuItem>
                  ))}
                </TextField>

                <IconButton
                  onClick={() => setShowOrdersPanel(true)}
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                  title="Ver Pedidos en Mesa"
                >
                  <ListAltIcon />
                </IconButton>

                <IconButton onClick={() => setShowFullMap(true)} title="Ver Mapa del Salón">
                  <MapIcon />
                </IconButton>


              </>
            )}
          </Box>

          {!isSelectionValid && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Favor seleccionar mesa para continuar.
            </Alert>
          )}

          <Box sx={{ flexGrow: 1, overflowY: "auto", borderTop: "1px solid #ddd", pt: 2 }}>
            <Tabs
              value={selectedCategory}
              onChange={async (_, val) => {
                setSelectedCategory(val);
                setSelectedSubcategory(null); // resetea subcategoría

                if (val === "all") {
                  setSubcategories([]);
                  return;
                }

                const result = await dispatch(fetchSubcategories(val)) as { payload?: Category[] };
                setSubcategories(result.payload || []);
              }}

              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'bold',
                  color: '#666', // tabs inactivos
                },
                '& .Mui-selected': {
                  color: '#1976d2', // azul activo
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1976d2',
                },
              }}
            >
               <Tab key="all" label="Todos" value="all" />
              {categoriesRoot.map((cat) => (
                <Tab 
                  key={cat._id} 
                  label={cat.name} 
                  value={cat._id} 
                  sx={{
                    minWidth: 100,
                    '&.Mui-selected': {
                      fontWeight: 'bold',
                    },
                  }}
                />
              ))}
            </Tabs>

            {subcategories.length > 0 && (
              <Tabs
                value={selectedSubcategory || "all"}
                onChange={(_, val) => setSelectedSubcategory(val === "all" ? null : val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  mt: 1,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: '#666',
                  },
                  '& .Mui-selected': {
                    color: '#1976d2',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                <Tab key="all" label="Todas" value="all" />
                {subcategories.map((sub) => (
                  <Tab
                    key={sub._id}
                    label={sub.name}
                    value={sub._id}
                    sx={{ minWidth: 100, '&.Mui-selected': { fontWeight: 'bold' } }}
                  />
                ))}
              </Tabs>
            )}


            <Grid 
              container 
              spacing={2} 
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 2,
                mt: 1,
                transition: "all 0.3s ease",
              }}
              >
              {filteredProducts.map((product) => (
                <Grid   sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 2,
                          mt: 1,
                        }} key={product._id}>
                  <Card key={product._id}>
                    <CardMedia 
                      component="img" 
                      image={getIconUrl(product.image)} 
                      alt={product.name} 
                      sx={{
                        height: 120,
                        objectFit: 'contain', // ✅ para que la imagen se vea completa
                        backgroundColor: '#f9f9f9', // opcional, para evitar fondo blanco puro
                        padding: 1, // opcional, para dar espacio interno
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': {
                          boxShadow: 4,
                        },
                        display: 'block',
                        margin: '0 auto',
                      }}
                      />
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" align="center"  sx={{ mt: 1 }}>{product.name}</Typography>
                      <Typography variant="body2"  align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {formatCurrency(product.price, "€ ")}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        disabled={!isSelectionValid}
                        onClick={() => handleAddProduct(product)}
                      >
                        Agregar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Panel derecho redimensionable */}
        <ResizableBox
          width={initialRightPanelWidth}
          height={Infinity}
          axis="x"
          resizeHandles={["w"]}
          minConstraints={[320, Infinity]}
          maxConstraints={[window.innerWidth * 0.7, Infinity]}
          handle={<span className="custom-handle-w" />}
        >
          <Paper 
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: { xs: 1, sm: 1.25 },
              position: "relative",
            }}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
                <Typography variant="subtitle1">
                  🛒 Pedido
                    {saleMode === "table" && selectedTable && (
                    <Chip
                      label={`${(() => {
                        const table = tables.find(t => t._id === selectedTable);
                        return table ? table.name : selectedTable;
                      })()}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        letterSpacing: 0.2,
                        ml: 1, // más separación respecto al "Pedido"
                        mt: '1px' // pequeño alineamiento visual vertical
                      }}
                    />

                  )}                  
                </Typography>
                {selectedProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay productos en el carrito.
                  </Typography>
                ) : (
                  <Box>
                    {selectedProducts.map((item) => (
                      <Box
                        key={item._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          px: 1,
                          py: 0.5,
                          border: "1px solid #ddd",
                          borderRadius: 1,
                        }}
                      >
                        {/* Nombre y Subtotal */}
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            Subtotal: {formatCurrency(item.quantity * item.price, "€ ")}
                          </Typography>
                        </Box>

                        {/* Controles de cantidad y eliminación */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            sx={{ p: 0.5 }}
                            onClick={async () => {
                              const updated = selectedProducts.map((p) =>
                                p._id === item._id && p.quantity > 1
                                  ? { ...p, quantity: p.quantity - 1 }
                                  : p
                              );
                              setSelectedProducts(updated);

                              if (saleMode === "table" && drawerSale) {
                                const saleItems = updated.map(p => ({
                                  productId: p._id,
                                  name: p.name,
                                  quantity: p.quantity,
                                  price: p.price,
                                  subtotal: p.quantity * p.price,
                                }));
                                await dispatch(addItemsToSale({
                                  saleId: drawerSale._id,
                                  saleItems,
                                }));
                              }
                            }}
                          >
                            <Typography variant="body2">−</Typography>
                          </IconButton>

                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ width: 20, textAlign: "center" }}
                          >
                            {item.quantity}
                          </Typography>

                          <IconButton
                            size="small"
                            sx={{ p: 0.5 }}
                            onClick={async () => {
                              const updated = selectedProducts.map((p) =>
                                p._id === item._id
                                  ? { ...p, quantity: p.quantity + 1 }
                                  : p
                              );
                              setSelectedProducts(updated);

                              if (saleMode === "table" && drawerSale) {
                                const saleItems = updated.map(p => ({
                                  productId: p._id,
                                  name: p.name,
                                  quantity: p.quantity,
                                  price: p.price,
                                  subtotal: p.quantity * p.price,
                                }));
                                await dispatch(addItemsToSale({
                                  saleId: drawerSale._id,
                                  saleItems,
                                }));
                              }
                            }}
                          >
                            <Typography variant="body2">+</Typography>
                          </IconButton>

                          <IconButton
                            edge="end"
                            color="error"
                            size="small"
                            sx={{ p: 0.5 }}
                            onClick={async () => {
                              const updated = selectedProducts.filter((p) => p._id !== item._id);
                              setSelectedProducts(updated);

                              if (saleMode === "table" && drawerSale) {
                                if (updated.length === 0) {
                                  // Eliminar la venta completamente
                                  await dispatch(deleteSale(drawerSale._id));
                                  await dispatch(updateTableStatus({ tableId: selectedTable, status: "available" }));
                                  
                                  setDrawerSale(null);
                                  setSelectedProducts([]);
                                  setSelectedTable("");
                                  showSuccessToast("Pedido cancelado y mesa liberada.");
                                } else {
                                  // Solo actualizar ítems
                                  const saleItems = updated.map(p => ({
                                    productId: p._id,
                                    name: p.name,
                                    quantity: p.quantity,
                                    price: p.price,
                                    subtotal: p.quantity * p.price,
                                  }));

                                  await dispatch(addItemsToSale({
                                    saleId: drawerSale._id,
                                    saleItems,
                                  }));
                                }
                              }

                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>



                        </Box>
                      </Box>
                    ))}

                  </Box>
                )}

                <Typography sx={{ mt: 1 }}>
                  Total: {formatCurrency(total, "€ ")}
                </Typography>

                {saleMode === "quick" && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTakeAway}
                        onChange={(e) => setIsTakeAway(e.target.checked)}
                      />
                    }
                    label="Para llevar"
                  />
                )}

                <Select
                  fullWidth
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ mt: 1 }}
                > 
                  <MenuItem value="cash">Efectivo</MenuItem>
                  <MenuItem value="card">Tarjeta</MenuItem>
                </Select>
                
                {paymentMethod === "cash" && (
                  <TextField
                    label="Monto Entregado"
                    type="number"
                    fullWidth
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    sx={{ mt: 1 }}
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
                )}

                {paymentMethod === "cash" && cashGiven !== "" && (
                  <Typography sx={{ mt: 1 }}>Vuelto: {formatCurrency(change, "€ ")}</Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2, alignSelf: "center", width: "90%" }}
                  disabled={selectedProducts.length === 0 || !isSelectionValid}
                  
                  onClick={async () => {
                    const validCash = typeof cashGiven === "number" ? cashGiven : 0;

                    if (saleMode === "table" && drawerSale) {
                      // 🔷 Caso: Pedido en mesa ya creado → cerrar y liberar
                      try {
                        await dispatch(closeSale({
                          saleId: drawerSale._id,
                          payment: {
                            method: paymentMethod as "cash" | "card",
                            amountPaid: paymentMethod === "cash" ? validCash : total,
                            change: paymentMethod === "cash" ? validCash - total : 0,
                          }
                        })).unwrap();

                        if (selectedTable) {
                          await dispatch(updateTableStatus({ tableId: selectedTable, status: "available" })).unwrap();
                        }

                        setSelectedProducts([]);
                        setDrawerSale(null);
                        setSelectedTable("");
                        setSelectedStaff("");
                        setCashGiven("");
                        setPaymentMethod("cash");

                        showSuccessToast("Pedido marcado como pagado y mesa liberada");
                      } catch (error) {
                        showErrorToast(error instanceof Error ? error.message : "Error al cerrar venta");
                      }

                    } else if (saleMode === "quick") {
                      // 🔷 Caso: Pedido rápido → se crea directamente como pagado
                      try {
                        const saleItems = selectedProducts.map((item) => ({
                          productId: item._id,
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          subtotal: item.quantity * item.price,
                        }));

                        await dispatch(createSale({
                          staffId: selectedStaff, // puede venir vacío o un valor fijo si deseas
                          saleItems,
                          isTakeAway,
                          status: "paid",
                          payment: {
                            method: paymentMethod as "cash" | "card",
                            total,
                            amountPaid: paymentMethod === "cash" ? validCash : total,
                            change: paymentMethod === "cash" ? validCash - total : 0,
                          }
                        })).unwrap();

                        setSelectedProducts([]);
                        setCashGiven("");
                        setPaymentMethod("cash");
                        showSuccessToast("Pedido rápido registrado como pagado");
                      } catch (error) {
                        showErrorToast(error instanceof Error ? error.message : "Error al registrar pedido");
                      }
                    }
                  }}


                >
                  Marcar como Pagado
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mt: 1, alignSelf: "center", width: "90%" }}
                  disabled={selectedProducts.length === 0}
                  onClick={async () => {
                    try {
                      if (drawerSale && saleMode === "table") {
                        await dispatch(cancelSale(drawerSale._id)).unwrap();
                        await dispatch(updateTableStatus({ tableId: selectedTable, status: "available" })).unwrap();

                        setSelectedProducts([]);
                        setDrawerSale(null);
                        setSelectedTable("");
                        setSelectedStaff("");
                        setCashGiven("");
                        setPaymentMethod("cash");

                        showSuccessToast("Pedido cancelado y mesa liberada");
                      } else if (saleMode === "quick") {
                        setSelectedProducts([]);
                        setCashGiven("");
                        setPaymentMethod("cash");

                        showSuccessToast("Pedido rápido cancelado");
                      }
                    } catch (error) {
                      showErrorToast(error instanceof Error ? error.message : "Error al cancelar el pedido");
                    }
                  }}
                >
                  Cancelar Pedido
                </Button>

              </Box>
            </Box>
          </Paper>
        </ResizableBox>
      </Box>
      {showOrdersPanel && (
        <InProgressOrdersPanel
          open={showOrdersPanel}
          onClose={() => setShowOrdersPanel(false)}
        />
      )}
      {showFullMap && (
        <FullScreenRoomMap 
          open={showFullMap} 
          onClose={() => setShowFullMap(false)} 
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          setSelectedStaff={setSelectedStaff}
          sales={sales}
          setDrawerSale={setDrawerSale}
        />
      )}

      {closeDayOpen && (
        <CloseDayModal open={closeDayOpen} onClose={() => setCloseDayOpen(false)} />
      )}

    </Box>
  );
};

export default SalePOS;
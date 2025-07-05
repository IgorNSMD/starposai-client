import { useEffect, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Box,
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
  IconButton,
} from "@mui/material";
import ListAltIcon from '@mui/icons-material/ListAlt'; // ícono tipo lista
import MapIcon from "@mui/icons-material/Map";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import Fab from '@mui/material/Fab';

import { useMediaQuery, useTheme, Drawer } from "@mui/material";

import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

import { useAppSelector, useAppDispatch } from '../../store/redux/hooks';
import { fetchProductsSales,  } from '../../store/slices/productSlice';
import { Category, fetchCategoriesRoot, fetchSubcategories } from '../../store/slices/categorySlice';

import { fetchStaffs } from '../../store/slices/staffSlice';
import { fetchRooms } from '../../store/slices/roomSlice';
import { fetchTablesByRoom, updateTableStatus  } from '../../store/slices/tableSlice';
import { addItemsToSale, cancelSale, closeSale, createSale, deleteSale, fetchSaleById, fetchSales, registerPartialPayment, SaleItem, openCashRegisterSession, checkCashRegisterSession   } from '../../store/slices/saleSlice';
import type { Sale, NewSale } from '../../store/slices/saleSlice';
import { fetchReservations } from '../../store/slices/reservationSlice';
import type { Reservation } from '../../store/slices/reservationSlice';

import { createOutput } from "../../store/slices/inventoryMovementSlice";


import { useToast } from '../../hooks/useToastMessage';
import { formatCurrency } from '../../utils/formatters';

import { baseURL_CATALOGICONS } from '../../utils/Parameters'; // Importa tu baseURL exportable
import InProgressOrdersPanel from "./components/InProgressOrdersPanel";
import FullScreenRoomMap from "./components/FullScreenRoomMap";


import RightPanelContent from "./components/RightPanelContent";

import OpenDayModal from "../../components/modals/OpenDayModal";

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

type TableStatus = "available" | "occupied" | "reserved";

const SalePOS = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const [saleMode, setSaleMode] = useState<"table" | "quick" | "loss" | "selfConsumption">("quick");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [cashGiven, setCashGiven] = useState(""); // string
  const [selectedRoom, setSelectedRoom] = useState("");
  const [drawerSale, setDrawerSale] = useState<Sale | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isTakeAway, setIsTakeAway] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [isPartial, setIsPartial] = useState(false);  
  const [showOpenDayModal, setShowOpenDayModal] = useState(false);

  const hasOpenedMapRef = useRef(false);

  const products = useAppSelector((state) => state.products.products);
  const {categoriesRoot } = useAppSelector((state) => state.categories);
  const staffs = useAppSelector((state) => state.staffs.staffs);
  const rooms = useAppSelector((state) => state.rooms.rooms);
  const tables = useAppSelector((state) => state.tables.tables);
  const sales = useAppSelector((state) => state.sales.sales);
  
  const cashRegisterSessionOpen = useAppSelector((state) => state.sales.cashRegisterSessionOpen);

  useHotkeys('f2', () => {
    setShowOrdersPanel(prev => !prev);
  });

  // useHotkeys('f8', async () => {
  //   // Solo confirmar si se cumple condición
  //   if (selectedProducts.length === 0 || !isSelectionValid) return;

  //   try {
  //     const saleItems = selectedProducts.map((item) => ({
  //       productId: item._id,
  //       name: item.name,
  //       quantity: item.quantity,
  //       price: item.price,
  //       subtotal: item.quantity * item.price,
  //     }));

  //     const validCash = typeof cashGiven === "number" ? cashGiven : 0;

  //     const payload = {
  //       staffId: selectedStaff,
  //       tableId: selectedTable,
  //       saleItems,
  //       isTakeAway,
  //       status: (saleMode === "quick" ? "paid" : "in_progress") as "pending" | "in_progress" | "paid" | "cancelled",
  //       payment: {
  //         method: paymentMethod as "cash" | "card",
  //         total,
  //         amountPaid: paymentMethod === "cash" ? validCash : total,
  //         change: paymentMethod === "cash" ? validCash - total : 0,
  //       },
  //     };

  //     await dispatch(createSale(payload)).unwrap();

  //     if (selectedTable) {
  //       await dispatch(updateTableStatus({ tableId: selectedTable, status: "occupied" })).unwrap();
  //     }

  //     setSelectedProducts([]);
  //     setSelectedTable("");
  //     setSelectedStaff("");
  //     setCashGiven("");
  //     setPaymentMethod("cash");

  //     showSuccessToast("Pedido registrado con éxito");
  //   } catch (error) {
  //     showErrorToast(error instanceof Error ? error.message : "Error al registrar pedido");
  //   }
  // });

  useHotkeys('esc', () => {
    if (drawerSale) {
      setDrawerSale(null);
    }
  });


  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast();

  const initialRightPanelWidth = Math.floor(window.innerWidth * 0.18);

  // const refreshSale = async (saleId: string) => {
  //   const result = await dispatch(fetchSales()) as { payload?: Sale[] };
  //   const updatedSale = result.payload?.find(s => s._id === saleId);
  //   if (updatedSale) {
  //     setDrawerSale(updatedSale);
  //   }
  // };

  useEffect(() => {
    dispatch(checkCashRegisterSession());
  }, [dispatch]);


    // Mostrar modal solo si la sesión no está abierta
  useEffect(() => {
    console.log("🧭 Estado cashRegisterSessionOpen cambió:", cashRegisterSessionOpen);
    if (cashRegisterSessionOpen === false) {
      setShowOpenDayModal(true);
    } else {
      setShowOpenDayModal(false);
    }
  }, [cashRegisterSessionOpen]);

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
      const items = drawerSale.saleItems.map((item) => {
        const id =
          typeof item.productId === "string"
            ? item.productId
            : item.productId?._id ?? ""; // fallback vacío si productId es null

        return {
          _id: id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        };
      });
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
           (s.status === "in_progress" || s.status === "partial") &&
          ((typeof s.tableId === "string" && s.tableId === selectedTable) ||
          (typeof s.tableId === "object" && s.tableId !== null && "_id" in s.tableId && s.tableId._id === selectedTable))
      );

      if (activeSale) {
        const items = activeSale.saleItems
          .filter(item => item.productId) // <-- asegura que no sea null
          .map(item => ({
            _id: typeof item.productId === "string"
              ? item.productId
              : item.productId?._id ?? "", // fallback en caso de inconsistencia
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



  //const isSelectionValid = saleMode === "quick" || (selectedTable && selectedStaff);
  //const isSelectionValid = saleMode === "quick" || (!!selectedTable && !!selectedStaff);
  const isSelectionValid =
      saleMode === "quick" ||
      saleMode === "loss" ||
      saleMode === "selfConsumption" ||
      (!!selectedTable && !!selectedStaff);

  const handleOpenDay = () => {
    dispatch(openCashRegisterSession({ initialAmount: 0 }));
    setShowOpenDayModal(false);
  };      

  const handleAddProduct = async (product: Product) => {
    // Buscar venta activa si existe
    
    if (isMobile) {
      setDrawerOpen(true);
    }

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


  const handleAddItemsToSale = async (data: { saleId: string; saleItems: SaleItem[] }): Promise<void> => {
    try {
      const resultAction = await dispatch(addItemsToSale(data));
      if (addItemsToSale.rejected.match(resultAction)) {
        console.error("Error al agregar ítems a la venta:", resultAction.payload);
      }
    } catch (error) {
      console.error("Excepción al agregar ítems a la venta:", error);
    }
  };

  // Eliminar venta
  const handleDeleteSale = async (saleId: string): Promise<void> => {
    try {
      const result = await dispatch(deleteSale(saleId));
      if (deleteSale.rejected.match(result)) {
        console.error("Error al eliminar venta:", result.payload);
      }
    } catch (error) {
      console.error("Excepción:", error);
    }
  };

  // Cerrar venta (pagar)
  const handleCloseSale = async (data: {
    saleId: string;
    payment: {
      method: "cash" | "card";
      amountPaid: number;
      change?: number;
    };
  }): Promise<void> => {
    try {

      const result = await dispatch(
        closeSale({
          saleId: data.saleId,
          payment: {
            method: data.payment.method,
            amountPaid: data.payment.amountPaid,
            change: data.payment.change,
          },
        })
      );

      if (closeSale.rejected.match(result)) {
        console.error("Error al cerrar venta:", result.payload);
      }
    } catch (error) {
      console.error("Excepción:", error);
    }
  };

  // Cancelar venta
  const handleCancelSale = async (saleId: string): Promise<void> => {
    try {
      const result = await dispatch(cancelSale(saleId));
      if (cancelSale.rejected.match(result)) {
        console.error("Error al cancelar venta:", result.payload);
      }
    } catch (error) {
      console.error("Excepción:", error);
    }
  };

  const handleCreateOutput = async (data: {
    sourceType: 'Loss' | 'SelfConsumption';
    saleItems: { productId: string; quantity: number }[];
  }): Promise<void> => {
    try {
      
      const payload = {
        sourceType: data.sourceType,
        movementType: 'Output' as const, // 👈 clave: literal fijo
        items: data.saleItems,
      };

      const result = await dispatch(createOutput(payload));
      if (createOutput.rejected.match(result)) {
        console.error("Error al registrar salida:", result.payload);
        showErrorToast("Error al registrar salida de inventario");
      } else {
        showSuccessToast(`Salida registrada como ${data.sourceType === "Loss" ? "Merma" : "Autoconsumo"}`);
      }
    } catch (error) {
      console.error("Excepción:", error);
      showErrorToast("Error al registrar salida de inventario");
    }
  };

  const handlePartialPaymentRequest = async (amount: number) => {
    if (!drawerSale) return;

    //console.log('handlePartialPaymentRequest initial...')

    try {
      await dispatch(registerPartialPayment({
        saleId: drawerSale._id,
        amount,
      })).unwrap();
      dispatch(fetchTablesByRoom(selectedRoom)); // para actualizar mapa de mesas
      dispatch(fetchSales());
    } catch (error) {
      console.error("Error al registrar pago parcial:", error);
    }
  };

  const handleFetchSaleById = async (saleId: string): Promise<Sale> => {
    try {
      const response = await dispatch(fetchSaleById(saleId));
      if (fetchSaleById.fulfilled.match(response)) {
        return response.payload;
      } else {
        throw new Error("No se pudo obtener la venta.");
      }
    } catch (error) {
      console.error("Error al obtener la venta:", error);
      throw error;
    }
  };


 // Crear venta nueva
  const handleCreateSale = async (data: NewSale): Promise<void> => {
    try {
      const result = await dispatch(createSale(data));
      if (createSale.rejected.match(result)) {
        console.error("Error al crear venta:", result.payload);
      }
    } catch (error) {
      console.error("Excepción:", error);
    }
  };  

  // Actualizar estado de mesa
  const handleUpdateTableStatus = async (
    data: { tableId: string; status: TableStatus }): 
    Promise<void> => {
    try {
      const result = await dispatch(updateTableStatus(data));
      if (updateTableStatus.rejected.match(result)) {
        console.error("Error al actualizar estado de mesa:", result.payload);
      }
    } catch (error) {
      console.error("Excepción:", error);
    }
  };

  const total = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  //const change = paymentMethod === "cash" && cashGiven !== "" ? cashGiven - total : 0;

    const getIconUrl = (iconPath?: string): string => {
    return iconPath && !iconPath.startsWith('http')
      ? `${baseURL_CATALOGICONS}/${iconPath}`
      : iconPath || ''; // Ruta por defecto si está vacío
  };



  const parsedCash = parseFloat(cashGiven);
  const isCashValid = !isNaN(parsedCash);
  const change = isCashValid ? parsedCash - total : 0;

  return (
  <Box
    sx={{
      display: { xs: 'block', md: 'flex' },
      flexDirection: 'row',
      height: 'calc(100vh - 64px)',
      overflow: { xs: 'auto', md: 'hidden' }
    }}
  >
    {/* Panel Izquierdo: controles + productos */}
    <Box
      sx={{
        flex: 1,
        p: 2,
        overflowY: 'auto',
        maxHeight: { xs: 'calc(100vh - 200px)', md: 'unset' }, // Ajusta si hay otros elementos arriba
        WebkitOverflowScrolling: 'touch', // suaviza scroll en iOS        
      }}
    >
      {/* Sección de configuración del pedido */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          flexWrap: 'wrap',
          minHeight: 56,
          mb: 2,
        }}
      >
        <RadioGroup
          row
          value={saleMode}
          onChange={(e) => setSaleMode(e.target.value as "table" | "quick")}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <FormControlLabel value="quick" control={<Radio />} label="Pedido Rápido" />
          <FormControlLabel value="table" control={<Radio />} label="Pedido en Mesa" />
          <FormControlLabel value="loss" control={<Radio />} label="Mermas" />
          <FormControlLabel value="selfConsumption" control={<Radio />} label="Autoconsumo" />
        </RadioGroup>

        {saleMode === 'table' && (
          <>
            <TextField
              select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              sx={{ width: { xs: '100%', sm: 150 } }}
              size="small"
            >
              {staffs.map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              sx={{ width: { xs: '100%', sm: 120 } }}
              size="small"
            >
              <MenuItem value="">-- Mesa --</MenuItem>
              {tables.map((table) => (
                <MenuItem key={table._id} value={table._id}>{table.name}</MenuItem>
              ))}
            </TextField>

            <IconButton
              onClick={() => setShowOrdersPanel(true)}
              size="small"
              color="primary"
              sx={{ ml: { xs: 0, sm: 2 } }}
              title="Ver Pedidos en Mesa"
            >
              <ListAltIcon />
            </IconButton>

            <IconButton
              onClick={() => setShowFullMap(true)}
              title="Ver Mapa del Salón"
            >
              <MapIcon />
            </IconButton>

            {!isSelectionValid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Favor seleccionar mesa para continuar.
              </Alert>
            )}
          </>
        )}
      </Box>

      {/* Tabs de categorías */}
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Tabs
          value={selectedCategory}
          onChange={async (_, val) => {
            setSelectedCategory(val);
            setSelectedSubcategory(null);
            if (val === 'all') {
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
            mt: 1,
            minHeight: '48px',
            '& .MuiTabs-flexContainer': {
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              color: '#666',
              minWidth: { xs: 100, sm: 120 },
              whiteSpace: 'nowrap',
            },
            '& .Mui-selected': { color: '#1976d2' },
            '& .MuiTabs-indicator': { backgroundColor: '#1976d2' },
          }}
        >
          <Tab key="all" label="Todos" value="all" />
          {categoriesRoot.map((cat) => (
            <Tab key={cat._id} label={cat.name} value={cat._id} />
          ))}
        </Tabs>
      </Box>

      {/* Tabs de subcategorías */}
      {subcategories.length > 0 && (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Tabs
            value={selectedSubcategory || 'all'}
            onChange={(_, val) => setSelectedSubcategory(val === 'all' ? null : val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mt: 1,
              minHeight: '48px',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                color: '#666',
                minWidth: 100,
                whiteSpace: 'nowrap',
              },
              '& .Mui-selected': { color: '#1976d2' },
              '& .MuiTabs-indicator': { backgroundColor: '#1976d2' },
            }}
          >
            <Tab key="all" label="Todas" value="all" />
            {subcategories.map((sub) => (
              <Tab key={sub._id} label={sub.name} value={sub._id} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Grilla de productos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(auto-fit, minmax(160px, 1fr))',
            sm: 'repeat(auto-fit, minmax(180px, 1fr))',
          },
          gap: 2,
          mt: 1,
          pb: { xs: 8, sm: 2 }, // 👈 Esto asegura espacio bajo para evitar truncamiento
        }}
      >
        {filteredProducts.map((product) => (
          <Card key={product._id}>
            <CardMedia
              component="img"
              image={getIconUrl(product.image)}
              alt={product.name}
              sx={{
                height: 120,
                objectFit: 'contain',
                backgroundColor: '#f9f9f9',
                padding: 1,
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 },
                display: 'block',
                margin: '0 auto',
              }}
            />
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" align="center" sx={{ mt: 1 }}>
                {product.name}
              </Typography>
              <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {formatCurrency(product.price, '€ ')}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ 
                  mt: 1, 
                  visibility: isPartial ? 'hidden' : 'visible' // 👈 oculta visualmente
                }}
                disabled={!isSelectionValid || isPartial}
                onClick={() => handleAddProduct(product)}
              >
                Agregar
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>

    

    {/* Panel derecho: Carrito */}
    {!isMobile ? (
      <ResizableBox
        width={initialRightPanelWidth}
        height={Infinity}
        axis="x"
        resizeHandles={['w']}
        minConstraints={[320, Infinity]}
        maxConstraints={[window.innerWidth * 0.7, Infinity]}
        handle={<span className="custom-handle-w" />}
      >
          <RightPanelContent
            isMobile={isMobile}
            saleMode={saleMode}
            selectedTable={selectedTable}
            selectedProducts={selectedProducts}
            drawerSale={drawerSale}
            tables={tables}
            cashGiven={cashGiven}
            parsedCash={parsedCash}
            change={change}
            paymentMethod={paymentMethod}
            isTakeAway={isTakeAway}
            total={total}
            isSelectionValid={isSelectionValid}
            selectedStaff={selectedStaff}
            isPartial={isPartial}
            setIsPartial={setIsPartial}
            setCashGiven={setCashGiven}
            setPaymentMethod={setPaymentMethod}
            setIsTakeAway={setIsTakeAway}
            setDrawerOpen={setDrawerOpen}
            setDrawerSale={setDrawerSale}
            setSelectedProducts={setSelectedProducts}
            setSelectedTable={setSelectedTable}
            setSelectedStaff={setSelectedStaff}
            formatCurrency={formatCurrency}
            onPartialPaymentRequest={handlePartialPaymentRequest}
            addItemsToSale={handleAddItemsToSale}
            deleteSale={handleDeleteSale}
            closeSale={handleCloseSale}
            cancelSale={handleCancelSale}
            createSale={handleCreateSale}
            updateTableStatus={handleUpdateTableStatus}
            createOutput={handleCreateOutput}
            fetchSaleById={handleFetchSaleById}
            showSuccessToast={showSuccessToast}
            showErrorToast={showErrorToast}
          />
      </ResizableBox>
    ) : (
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: '100%',
            maxWidth: 360,
            position: 'relative', // necesario para posicionar botón
          },
        }}
      >
          <RightPanelContent
            isMobile={isMobile}
            saleMode={saleMode}
            selectedTable={selectedTable}
            selectedProducts={selectedProducts}
            drawerSale={drawerSale}
            tables={tables}
            cashGiven={cashGiven}
            parsedCash={parsedCash}
            change={change}
            paymentMethod={paymentMethod}
            isTakeAway={isTakeAway}
            total={total}
            isSelectionValid={isSelectionValid}
            selectedStaff={selectedStaff}
            isPartial={isPartial}
            setIsPartial={setIsPartial}            
            setCashGiven={setCashGiven}
            setPaymentMethod={setPaymentMethod}
            setIsTakeAway={setIsTakeAway}
            setDrawerOpen={setDrawerOpen}
            setDrawerSale={setDrawerSale}
            setSelectedProducts={setSelectedProducts}
            setSelectedTable={setSelectedTable}
            setSelectedStaff={setSelectedStaff}
            formatCurrency={formatCurrency}
            onPartialPaymentRequest={handlePartialPaymentRequest}
            addItemsToSale={handleAddItemsToSale}
            deleteSale={handleDeleteSale}
            closeSale={handleCloseSale}
            cancelSale={handleCancelSale}
            createSale={handleCreateSale}
            updateTableStatus={handleUpdateTableStatus}
            createOutput={handleCreateOutput}
            fetchSaleById={handleFetchSaleById}
            showSuccessToast={showSuccessToast}
            showErrorToast={showErrorToast}
          />            
        
      </Drawer>
    )}

    {isMobile && !drawerOpen && (
      <Fab
        color="primary"
        aria-label="Carrito"
        onClick={() => setDrawerOpen(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1100 }}
      >
        <ShoppingCartIcon />
      </Fab>
    )}


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

    <OpenDayModal open={showOpenDayModal} onConfirm={handleOpenDay} />

  </Box>
  );

};

export default SalePOS;
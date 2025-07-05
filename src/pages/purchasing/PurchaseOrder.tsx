import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Autocomplete
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory from "@mui/icons-material/Inventory";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from 'react-hot-toast';
import { useLocation } from "react-router-dom";
//import "jspdf-autotable";

import {
    Provider,
    PurchaseOrder, 
    PurchaseOrderItem,
    fetchPurchaseOrders, 
    createPurchaseOrder, 
    updatePurchaseOrder,
    fetchPurchaseOrderByNumber, clearMessages,  
    markPurchaseOrderAsSent} from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchWarehouses } from "../../store/slices/warehouseSlice";
import { createInventoryMovement } from "../../store/slices/inventoryMovementSlice";
import { fetchParametersByCategory } from '../../store/slices/parameterSlice';

import { selectActiveCompanyVenue } from '../../store/slices/authSlice';
import { fetchSettingByVenue } from '../../store/slices/settingSlice'; // asegúrate de tener este thunk
import { fetchTaxRates, TaxRate } from "../../store/slices/taxRateSlice";
import { Product } from "../../store/slices/productSlice";

import PurchaseOrderEntryModal from './modals/PurchaseOrderEntryModal'; 

import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import ProductSelectorModal from '../../components/modals/ProductSelectorModal';

import CustomDialog from '../../components/Dialog'; // Dale un alias como 'CustomDialog'
import axiosInstance from "../../api/axiosInstance";
import { inputField } from "../../styles/AdminStyles";



interface SelectedProduct extends Product {
  quantity: number;
}


interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

function isTaxRate(obj: unknown): obj is TaxRate {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    "name" in obj &&
    typeof (obj as Record<string, unknown>)._id === "string" &&
    typeof (obj as Record<string, unknown>).name === "string"
  );
}

function calculateTaxData(cost: number, quantity: number, taxRateValue: number, isTaxIncluded: boolean) {
  const subtotal = quantity * cost;
  const taxAmount = isTaxIncluded ? 0 : subtotal * (taxRateValue / 100);
  return { subtotal, taxAmount };
}




const PurchaseOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { purchaseOrders, purchaseOrderDetail , successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);
  const { products } = useAppSelector((state) => state.products);
  const { userInfo } = useAppSelector((state) => state.auth);
  const { warehouses } = useAppSelector((state) => state.warehouses);
  const globalCompanyVenue = useAppSelector(selectActiveCompanyVenue);
  const currentSetting = useAppSelector((state) => state.settings.currentSetting);
  const { taxRates} = useAppSelector((state) => state.taxRates);  
  const parameters = useAppSelector((state) => state.parameters.parametersByCategory["Decimal"] || []);


  const activeCompanyId = globalCompanyVenue?.activeCompanyId || "";
  const activeVenueId = globalCompanyVenue?.activeVenueId || "";

  const [formData, setFormData] = useState<PurchaseOrder>({
    _id: "",  // 🔹 Agregar un campo _id vacío
    provider: '',  // ✅ Debe ser solo el `_id` del proveedor
    estimatedDeliveryDate: '',
    items: [] as PurchaseOrderItem[],  // ✅ Cambia `products` por `items`
    total: 0,
    createdAt: "", 
    status: "pending",
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState(""); // Estado del input
  const [searchDialogOpen, setSearchDialogOpen] = useState(false); // Estado del modal  
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryItems, setEntryItems] = useState<PurchaseOrderItem[]>([]);

  // 📌 Obtenidos desde la navegación o como fallback global desde Redux
  const orderNumberFromState = location.state?.orderNumber || "";

  const getDecimalPlaces = () => {

    //console.log('currentSetting?.country:', currentSetting?.country);
    //console.log("🔍 parameters:", parameters);
    const decimalParam = parameters.find(p => p.category === 'Decimal' && p.key.toLowerCase() === (currentSetting?.country || "").toLowerCase());

    //console.log('decimalParam:', decimalParam);

    const decimals = parseInt(decimalParam?.value || '0', 10);
    return isNaN(decimals) ? 0 : decimals;
  };

  const formatWithDecimals = (value: number) => {
    const decimals = getDecimalPlaces();
    const rounded = value.toFixed(decimals); // redondea a string con los decimales fijos
    return Number(rounded).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };


  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity ?? 0) * item.cost, 0);

    // 🔹 Usar los impuestos calculados por ítem
    const tax = formData.items.reduce((sum, item) => sum + (item.taxAmount ?? 0), 0);

    const isTaxIncluded = currentSetting?.isTaxIncluded ?? false;

    let total = 0;

    if (isTaxIncluded) {
      total = subtotal;
    } else {
      total = subtotal + tax;
    }

    return {
      subtotal,
      tax,
      total,
    };
  };

  
  const { subtotal, tax, total } = calculateTotals();
  //console.log('orderNumberFromState, activeCompanyId, activeVenueId', orderNumberFromState, activeCompanyId, activeVenueId)
  //const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    if (!currentSetting?.venueId && activeVenueId) {
      dispatch(fetchSettingByVenue({ venueId: activeVenueId }));
    }
  }, [dispatch, currentSetting, activeVenueId]);

  useEffect(() => {
    dispatch(fetchProviders());
    dispatch(fetchProducts({ status: 'active' }));
    dispatch(fetchPurchaseOrders());
    dispatch(fetchWarehouses());
    dispatch(fetchTaxRates()); // ✅ IMPORTANTE
  }, [dispatch, ]);

  useEffect(() => {
      const parameterCategories = [
        { name: "Decimal", list: parameters },
      ];
    
      parameterCategories.forEach(({ name, list }) => {
        if (list.length === 0) {
          dispatch(fetchParametersByCategory(name));
        }
      });
  }, [parameters, dispatch]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  // Manejo de mensajes
  useEffect(() => {
    //console.log("📢 Redux errorMessage:", errorMessage);
    //console.log("📢 Redux successMessage:", successMessage);
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages()); // ✅ LIMPIA MENSAJES DESPUÉS DE MOSTRAR EL TOAST
    }
    if (errorMessage) {
      errorMessage.split("\n").forEach((msg) => toast.error(msg)); // ✅ Muestra múltiples errores si es necesario
      dispatch(clearMessages());
    }
  }, [successMessage, errorMessage, dispatch]);


  useEffect(() => {
    if (!orderNumberFromState) return;
  
    //console.log("🔍 Buscando orden:", orderNumberFromState);
    setSearchOrderNumber(orderNumberFromState);
  
    // Buscar la orden directamente dentro del useEffect
    dispatch(fetchPurchaseOrderByNumber({
      orderNumber: orderNumberFromState,
    }))
      .unwrap()
      .then((response) => {
        const foundProvider = providers.find(p => p._id === response.provider) || response.provider;
  
        setFormData({
          _id: response._id,
          provider: typeof foundProvider === "string" ? foundProvider : foundProvider._id,
          orderNumber: response.orderNumber,
          createdAt: response.createdAt,
          status: response.status,
          items: response.items.map((item) => ({
            type: item.type, // "product" | "kit" | "service"
            referenceId: item.referenceId, // ID del producto o kit
            sku: item.sku,
            name: item.name,
            quantity: item.quantity || 1,
            cost: item.cost,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            receivedQuantity: item.receivedQuantity ?? 0, // ✅ <-- Agrega esto
            initialWarehouse: item.initialWarehouse || "", // ✅ AÑADIR ESTO
            kitComponents: item.kitComponents || [], // Solo si es un kit
            taxRate: typeof item.taxRate === 'string'
              ? taxRates.find(rate => rate._id === item.taxRate)
              : item.taxRate,
            taxAmount: item.taxAmount ?? 0,  // ✅ AÑADIR ESTO            
          })),
          total: response.total,
          estimatedDeliveryDate: response.estimatedDeliveryDate,
          wasSent: response.wasSent ?? false, // 👈 ¡Agrega esto!
        });
        
  
        console.log("✅ Orden cargada con éxito:", response);
        setSearchDialogOpen(false);
        setSearchOrderNumber("");
      })
      .catch((error) => {
        console.error("❌ Error al buscar la orden:", error);
        toast.error("Order not found.");
      });
  }, [orderNumberFromState, dispatch, providers, taxRates]); // Ahora `handleSearchOrder` no es necesario en las dependencias
  
  useEffect(() => {
    if (purchaseOrderDetail) {
       //console.log("📢 Actualizando formData con purchaseOrderDetail:", purchaseOrderDetail);
       setFormData({
          _id: purchaseOrderDetail._id,
          provider: purchaseOrderDetail.provider,
          orderNumber: purchaseOrderDetail.orderNumber,
          createdAt: purchaseOrderDetail.createdAt,
          status: purchaseOrderDetail.status,
          items: purchaseOrderDetail.items,
          total: purchaseOrderDetail.total,
          estimatedDeliveryDate: purchaseOrderDetail.estimatedDeliveryDate || "",
          wasSent: purchaseOrderDetail.wasSent ?? false, // 👈 Agrega esto
       });
    }
 }, [purchaseOrderDetail]);


  const generatePDF = async (orderNumber: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(20);
    doc.text("Purchase Order", doc.internal.pageSize.width / 2, 20, { align: "center" });

    const foundProvider = providers.find(p => p._id === formData.provider);
    const formattedDate = formData.createdAt 
      ? new Date(formData.createdAt).toLocaleDateString("en-US")
      : "N/A";

    doc.setFontSize(12);
    doc.text(`Order Number: ${orderNumber}`, 20, 40);
    doc.text(`Provider: ${foundProvider ? foundProvider.name : "Unknown"}`, 20, 50);
    doc.text(`Created At: ${formattedDate}`, 20, 60);
    doc.text(`Status: ${formData.status}`, 20, 70);

    // 📌 Encabezados de la tabla
    const columns = [
      { header: "Code", dataKey: "sku" },
      { header: "Product", dataKey: "name" },
      { header: "Unit", dataKey: "unitPurchase" },
      { header: "Quantity", dataKey: "quantity" },

      // { header: "Tax Rate", dataKey: "taxRate" },
      // { header: "Total w/VAT", dataKey: "totalWithTax" },
    ];

    // 📌 Filas con los productos
    const rows = formData.items.map((p) => {
      const taxRate = typeof p.taxRate === 'object' && p.taxRate !== null && 'name' in p.taxRate
        ? p.taxRate.name
        : typeof p.taxRate === 'string'
          ? taxRates.find(rate => rate._id === p.taxRate)?.name || "N/A"
          : "N/A";

      return {
        sku: p.sku,
        name: p.name,
        unitPurchase: p.unitPurchase ?? "N/A",
        quantity: (p.quantity ?? 0).toLocaleString(),
        cost: `$${formatWithDecimals (p.cost)}`,
        taxRate,
        totalWithTax: `$${formatWithDecimals ((p.subtotal ?? 0) + (p.taxAmount ?? 0))}`,
      };
    });

    // 📌 Generar tabla de ítems
    autoTable(doc, {
      startY: 90,
      head: [columns.map(col => col.header)],
      body: rows.map((p) => columns.map(col => p[col.dataKey as keyof typeof p])),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3, halign: "right" },
      columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } },
      headStyles: { fillColor: [31, 73, 125], textColor: [255, 255, 255] },
    });

    // 📌 Resumen final en tabla
    // const finalY = doc.lastAutoTable?.finalY || 90;

    // const summaryRows = [
    //   ["Subtotal", `$${formatWithDecimals (subtotal)}`],
    //   ["Tax", `$${formatWithDecimals (tax)}`],
    //   ["Total", `$${formatWithDecimals (total)}`],
    // ];

    // autoTable(doc, {
    //   startY: finalY + 10,
    //   body: summaryRows,
    //   theme: "grid",
    //   styles: { fontSize: 12, halign: "right", cellPadding: 5 },
    //   columnStyles: {
    //     0: { halign: "left", fontStyle: "bold" },
    //     1: { textColor: [0, 102, 204], fontStyle: "bold" },
    //   },
    //   tableLineColor: [200, 200, 200],
    //   tableLineWidth: 0.3,
    // });

    // 📌 Generar blob y guardar PDF
    doc.save(`PurchaseOrder_${orderNumber}.pdf`);
    const pdfBlob = doc.output("blob");
    resolve(pdfBlob);
  });
};

  
  
  
  const sendEmailWithPDF = async (orderNumber: string) => {
    if (!orderNumber) {
      //alert("No hay orden de compra seleccionada");
      toast.error("No hay orden de compra seleccionada")
      return;
    }
  
    try {
      console.log('sendEmailWithPDF init..');
      const pdfBlob = await generatePDF(orderNumber);
      console.log('sendEmailWithPDF p2..');
  
      const formDataToSend = new FormData();
      console.log('sendEmailWithPDF p3..');
  
      formDataToSend.append("pdf", pdfBlob, `PurchaseOrder_${orderNumber}.pdf`);
      console.log('sendEmailWithPDF p4..');
  
      formDataToSend.append("email", "insanmartind@gmail.com");
      formDataToSend.append("orderNumber", orderNumber);
      formDataToSend.append("companyId", activeCompanyId);
      formDataToSend.append("venueId", activeVenueId || "");

      console.log('sendEmailWithPDF p5..', formDataToSend);
  
      await axiosInstance.post(`/purchase-orders/send-email/${orderNumber}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      //alert("Email enviado con éxito");
      toast.success("Email enviado con éxito");

    } catch (error) {
      console.error("Error al enviar email:", error);
      //alert("Error al enviar email");
      toast.error("Error al enviar email");
    }
  };

  const handleOpenEntryModal = () => {
    const itemsWithReceived = formData.items.map((item) => ({
      ...item,
      receivedQuantity: typeof item.receivedQuantity === 'number' ? item.receivedQuantity : 0, // Asegura valor numérico
      referenceId: item.referenceId ?? "", // ✅ asegúrate de incluir el ID
      referenceType: item.type.toLowerCase(), // ✅ producto o kit      
      initialWarehouse: item.initialWarehouse || "", // ✅ Asegura que también se incluya este campo
    }));
    //console.log("📦 formData.items:", formData.items);
    //console.log("📦 Entry items:", itemsWithReceived);
    setEntryItems(itemsWithReceived); // <- esto es lo que alimenta el modal
    setIsEntryModalOpen(true);
  };
  
  
  const handleSelectItem = (item: Product, quantity: number) => {

    const itemProviderId = 'provider' in item && typeof item.provider === 'string' ? item.provider : '';

    setFormData((prevFormData) => {
      // Buscar si el producto ya está en la lista de ítems
      const existingIndex = prevFormData.items.findIndex((p) => p.referenceId === item._id);
      let updatedItems;

      // Lógica para detectar inconsistencia de proveedor
      if (!prevFormData.provider && itemProviderId) {
        // 👉 Si la orden no tiene proveedor, lo asignamos automáticamente
        //toast.success("Proveedor asignado automáticamente desde el producto.");
        prevFormData.provider = itemProviderId;
      } else if (prevFormData.provider && itemProviderId && prevFormData.provider !== itemProviderId) {
        // 👉 Si ya hay proveedor y es distinto, avisamos pero dejamos continuar
        toast.error("⚠️ El proveedor del ítem no coincide con el de la orden.");
      }      

      console.log('item.taxRate: ',item.taxRate)
      let taxRateId: string | undefined;

      const taxRatePurchase = (item as Product).taxRatePurchase;
      if (typeof taxRatePurchase === 'string') {
        taxRateId = taxRatePurchase;
      } else if (isTaxRate(taxRatePurchase)) {
        taxRateId = taxRatePurchase._id;
      }

      console.log('taxRateId: ',taxRateId)
      const taxRateObject = taxRates.find(rate => rate._id === taxRateId);
      console.log('taxRateObject: ',taxRateObject)
  
      if (existingIndex !== -1) {
        // Si el producto ya existe, actualizar cantidad y subtotal
        updatedItems = prevFormData.items.map((p, i) =>
          i === existingIndex
            ? { 
                ...p, 
                quantity: (p.quantity ?? 0) + 1, 
                subtotal: ((p.quantity ?? 0) + 1) * p.cost 
              }
            : p
        );
      } else {
        // Si es un producto nuevo, agregarlo a la lista
        const taxRateValue = taxRateObject?.rate ?? 0;
        const cost = item.cost;
        const { subtotal, taxAmount } = calculateTaxData(cost, quantity, taxRateValue, prevFormData.isTaxIncluded || false);

        console.log('taxRateValue:', taxRateValue)
        console.log('taxAmount:',taxAmount)
        console.log('subtotal:', subtotal)
        
        const newItem: PurchaseOrderItem = {
          type: "Product",
          referenceId: item._id,
          sku: item.sku, //"sku" in item ? item.sku : "N/A",
          name: item.name,
          quantity,
          cost,
          unitPrice: "price" in item ? item.price : 0,
          subtotal,
          taxAmount,
          initialWarehouse: item.initialWarehouse || undefined,
          taxRate: taxRateObject || undefined,

         // ✅ Campos nuevos para controlar unidad de compra
          unitPurchase: item.unitPurchase || '',
          unitFactor: item.unitFactor ?? 1,
        };

  
        // Si es un kit, agregar los componentes
        if (item.type === "kit" && "components" in item && Array.isArray(item.components)) {
          newItem.type = "Kit";
          newItem.kitComponents = item.components.map((component) => {
            const productId = typeof component.product === "string"
              ? component.product
              : component.product?._id || "";

            return {
              product: productId,
              productName: component.productName || "",
              quantity: component.quantity || 0,
            };
          });
        }

        console.log('newItem:', newItem)
  
        updatedItems = [...prevFormData.items, newItem];
      }
  
      // Calcular el nuevo total
      const newTotal = updatedItems.reduce((sum, p) => sum + p.subtotal, 0);
  
      return { ...prevFormData, items: updatedItems, total: newTotal };
    });
  
    setSelectorOpen(false);
  };
  
  
  

  // ✅ Función para buscar la orden
  const handleSearchOrder = async () => {
    if (!searchOrderNumber.trim()) return;

    try {
      const response = await dispatch(fetchPurchaseOrderByNumber({
        orderNumber: searchOrderNumber,
      })).unwrap();

      //console.error("handleSearchOrder - response:", response);

      // ✅ Buscar el proveedor en la lista de providers
      const foundProvider = providers.find(p => p._id === response.provider) || response.provider;
      
      // Si encontramos la orden, actualizamos el formulario
      setFormData({
        _id: response._id,
        provider: typeof foundProvider === "string" ? foundProvider : foundProvider._id,
        orderNumber: response.orderNumber,
        createdAt: response.createdAt,
        status: response.status,
        items: response.items.map((item) => ({
          type: item.type, // "product" | "kit" | "service"
          referenceId: item.referenceId, // ID del producto o kit
          sku: item.sku,
          name: item.name,
          quantity: item.quantity || 1,
          cost: item.cost,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          receivedQuantity: item.receivedQuantity ?? 0, // ✅ <-- Agrega esto
          initialWarehouse: item.initialWarehouse || "", // ✅ AÑADIR ESTO
          kitComponents: item.kitComponents || [], // Solo si es un kit
          taxRate: typeof item.taxRate === 'string'
            ? taxRates.find(rate => rate._id === item.taxRate)
            : item.taxRate,           // ✅ AÑADIR ESTO
          taxAmount: item.taxAmount ?? 0,  // ✅ AÑADIR ESTO
          unitPurchase: item.unitPurchase,
          unitFactor: item.unitFactor || 1
        })),
        total: response.total,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
        wasSent: response.wasSent
      });

      //console.error("handleSearchOrder - formData:", formData);

      setSearchDialogOpen(false);
      setSearchOrderNumber("");
    } catch (error) {
      console.error("❌ Error al buscar la orden:", error);
      //alert("Order not found.");
    }
  };


  const handleSubmit = async (): Promise<PurchaseOrder | null> => {
    const userId = userInfo?.id || undefined;

    const providerObject: Provider | undefined =
      typeof formData.provider === "string"
        ? providers.find((p) => p._id === formData.provider)
        : formData.provider;

    if (!providerObject) {
      toast.error("Proveedor no encontrado");
      return null;
    }

    if (formData.orderNumber) {
        const existingOrder = purchaseOrders.find(po => po.orderNumber === formData.orderNumber);
        if (!existingOrder) {
          toast.error("❌ No se encontró la PO");
          return null;
        }

        const idToUpdate = formData._id;

        return dispatch(updatePurchaseOrder({
          id: idToUpdate,
          provider: providerObject._id,
          items: formData.items.map((item) => ({
            ...item,
            taxRate: typeof item.taxRate === "object" && item.taxRate !== null ? item.taxRate._id : item.taxRate,
            unitPurchase: item.unitPurchase,
            unitFactor: item.unitFactor || 1
          })),
          total: formData.total,
          estimatedDeliveryDate: formData.estimatedDeliveryDate,
        }))
        .unwrap()
        .then(() => dispatch(fetchPurchaseOrderByNumber({ orderNumber: formData.orderNumber! })).unwrap())
        .catch((error) => {
          toast.error("Error al actualizar PO");
          console.error(error);
          return null;
        });
      } else {
        return dispatch(createPurchaseOrder({
          provider: providerObject._id,
          items: formData.items.map((item) => ({
            ...item,
            taxRate: typeof item.taxRate === "object" && item.taxRate !== null ? item.taxRate._id : item.taxRate,
          })),
          total: formData.total,
          estimatedDeliveryDate: formData.estimatedDeliveryDate,
          createdBy: userId,
        }))
        .unwrap()
        .then((createdOrder) => {
          setFormData((prevForm) => ({
            ...prevForm,
            _id: createdOrder._id,
            orderNumber: createdOrder.orderNumber || prevForm.orderNumber,
            createdBy: userId,
            createdAt: createdOrder.createdAt ?? prevForm.createdAt,
            status: createdOrder.status ?? prevForm.status,
          }));
          return createdOrder;
        })
        .catch((error) => {
          toast.error("Error al crear PO");
          console.error(error);
          return null;
        });
      }
  };

  
  const handleSaveAndSend = async () => {
    console.log("handleSaveAndSend 1. Guardar la orden");

    const savedOrder = await handleSubmit();

    if (!savedOrder || !savedOrder._id || !savedOrder.orderNumber) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      console.log("handleSaveAndSend 2. Generar y enviar el PDF por email");
      await sendEmailWithPDF(savedOrder.orderNumber);

      console.log("handleSaveAndSend 3. Marcar como enviada");
      await dispatch(markPurchaseOrderAsSent({ id: savedOrder._id })).unwrap();

      console.log("handleSaveAndSend 4. Refrescar la orden");
      await dispatch(fetchPurchaseOrderByNumber({ orderNumber: savedOrder.orderNumber }))
            .unwrap()
            .then((response) => {
              const foundProvider = providers.find(p => p._id === response.provider) || response.provider;

              setFormData({
                _id: response._id,
                provider: typeof foundProvider === "string" ? foundProvider : foundProvider._id,
                orderNumber: response.orderNumber,
                createdAt: response.createdAt,
                status: response.status,
                items: response.items.map((item) => ({
                  ...item,
                  taxRate: typeof item.taxRate === 'string'
                    ? taxRates.find(rate => rate._id === item.taxRate)
                    : item.taxRate,
                  taxAmount: item.taxAmount ?? 0,
                  unitPurchase: item.unitPurchase,
                  unitFactor: item.unitFactor
                })),
                total: response.total,
                estimatedDeliveryDate: response.estimatedDeliveryDate,
                wasSent: response.wasSent,
              });
            });


      console.log("handleSaveAndSend final");
    } catch (error) {
      console.error("❌ handleSaveAndSend - Error:", error);
      toast.error("Error al grabar y enviar PO");
    }
  };




  const handleDeleteDialogOpen = (index: number) => {
    setSelectedProductIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProductIndex !== null) {
      const updatedProducts = formData.items.filter((_, i) => i !== selectedProductIndex);
      const newTotal = updatedProducts.reduce(
        (sum, p) => sum + p.cost * (p.quantity ?? 0),
        0
      );
      setFormData({ ...formData, items: updatedProducts, total: newTotal });
    }
    setDeleteDialogOpen(false);
  };


  const handleConfirmCancel = () => {
    setFormData({
      _id: "",  // 🔹 Agregar un campo _id vacío
      provider: '',  // ✅ Debe ser solo el `_id` del proveedor
      estimatedDeliveryDate: '',
      items: [] as PurchaseOrderItem[],  // ✅ Cambia `products` por `items`
      total: 0,
      createdAt: "", 
      status: "pending",
      wasSent: false
    });
  
    setSelectedProduct(null);
    setSearchTerm("");
    setSearchOrderNumber("");

    // ✅ Limpia el detalle en Redux para evitar referencias obsoletas
    dispatch(clearMessages());
  };
  

  return (
    <Box 
      sx={{ 
        padding: 4, 
       "@media (max-width: 900px)": {padding: 4, maxWidth: "400px", margin: "0 auto"}}}
      >
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ marginBottom: 2,fontWeight: "bold", color: "#666", mb: 2  }}>
        PURCHASE ORDER
      </Typography>

      {/* Dropdown Proveedor */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2, 
        mb: 3
      }}>
        <Autocomplete
          disabled={formData.wasSent} // ← aquí el cambio
          options={providers}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          value={providers.find(p => p._id === formData.provider) || null}
          onChange={(_, selected) => {
            const isTaxIncludedFromProvider = selected?.isTaxIncluded ?? false;
            setFormData((prev) => ({
              ...prev,
              provider: selected?._id || "",
              isTaxIncluded: isTaxIncludedFromProvider,
              items: prev.items.map(item => {
                const taxRateValue =
                  typeof item.taxRate === "object" && item.taxRate !== null
                    ? item.taxRate.rate
                    : 0;
                const { subtotal, taxAmount } = calculateTaxData(
                  item.cost,
                  item.quantity ?? 1,
                  taxRateValue,
                  isTaxIncludedFromProvider
                );
                return { ...item, subtotal, taxAmount };
              }),
            }));
          }}
          renderInput={(params) => (
                <TextField
                  {...params}
                  label="Provider Selector "
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ...inputField,
                    "& label": {
                      color: "#444444",
                    },
                    "& label.Mui-focused": {
                      color: "#47b2e4",
                    },
                    borderRadius: 1, 
                    border: "1px solid #ccc", // 👈 Define un borde gris claro
                    fontSize: "1.2rem", 
                    fontWeight: "bold", 
                    color: "#555" 
                  }}
                />
          )}
        />

        <TextField
          label="Estimated Delivery Date"
          type="date"
          disabled={formData.wasSent} // ← aquí el cambio
          InputLabelProps={{ shrink: true }}
          value={formData.estimatedDeliveryDate?.substring(0, 10) || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              estimatedDeliveryDate: e.target.value,
            }))
          }
          sx={{ 
            ...inputField,
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
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
          variant="outlined" // 👈 Esto asegura un borde visible
          label="Order Number"
          value={formData.orderNumber || "Auto-generated"}
          disabled
          fullWidth
          sx={{ 
            ...inputField,
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}          
        />

        <TextField
          variant="outlined" // 👈 Esto asegura un borde visible
          label="Created At"
          value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : ""}
          disabled
          fullWidth
          sx={{ 
            ...inputField,
            borderRadius: 1, 
            border: "1px solid #ccc", // 👈 Define un borde gris claro
            fontSize: "1.2rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}          
        />

        <TextField
            variant="outlined" // 👈 Esto asegura un borde visible
            label="Status"
            value={formData.status ? formData.status.toUpperCase() : ""}
            disabled
            fullWidth
            sx={{ 
              ...inputField,
              borderRadius: 1, 
              border: "1px solid #ccc", // 👈 Define un borde gris claro
              fontSize: "1.2rem", 
              fontWeight: "bold", 
              color: "#555" 
            }}          
          />
      </Box>

      {/* Contenedor para el botón Add Product alineado a la derecha */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2, // Espaciado debajo del título
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {!formData.wasSent && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setSelectorOpen(true)}
              sx={{ 
                borderRadius: "8px",
                fontWeight: "bold",
                "@media (max-width: 600px)": {
                  fontSize: "0.8rem",
                  padding: "6px 10px",
                  minWidth: "120px",
                },
              }}
            >
              Add Item
            </Button>
          )}
        </Box>
        
      </Box>

      {/* Tabla de Productos */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2, 
        overflowX: "auto",  // Hace scroll horizontal en móviles
        boxShadow: 3,
        maxWidth: "100%",  // Evita que la tabla se desborde
        "@media (max-width: 900px)": {
          maxWidth: "100%",
          overflowX: "auto",
        },        
      }}>
        <Table stickyHeader size="small">
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Unit</TableCell>
              <TableCell sx={{ display: "none" }}>Initial Warehouse</TableCell>
              <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Cost</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Subtotal</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "right" }}>Tax Rate</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "right" }}>Total w/VAT </TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(formData.items) && formData.items.map((p, index) => (
              <TableRow key={index} sx={{ bgcolor: index % 2 ? "#f9f9f9" : "white" }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.sku || "N/A"}</TableCell>
                <TableCell>{p.name || "N/A"}</TableCell>
                <TableCell>{p.unitPurchase || "N/A"}</TableCell>
                <TableCell sx={{ display: "none" }}>
                  <Select
                    value={p.initialWarehouse || ""}
                    onChange={(e) => {
                      const updatedItems = [...formData.items];
                      updatedItems[index].initialWarehouse = e.target.value;
                      setFormData((prev) => ({ ...prev, items: updatedItems }));
                    }}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {warehouses.map((wh) => (
                      <MenuItem key={wh._id} value={wh._id}>
                        {wh.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", textAlign: "center", p: 1 }}>
                  <TextField
                    type="number"
                    value={p.quantity}
                    disabled={formData.wasSent} // ← aquí el cambio
                    onChange={(e) => {
                      const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                      setFormData((prevFormData) => {
                        const updatedItems = prevFormData.items.map((item, i) => {
                          if (i !== index) return item;
                          
                          //const subtotal = newQuantity * item.cost;
                          let taxRate = 0;
                          if (typeof item.taxRate === "object" && item.taxRate !== null && "rate" in item.taxRate) {
                            taxRate = item.taxRate.rate;
                          }

                          const { subtotal, taxAmount } = calculateTaxData(
                            item.cost,
                            newQuantity,
                            taxRate,
                            formData.isTaxIncluded || false
                          );
                          //const taxAmount = subtotal * (taxRate / 100);

                          return {
                            ...item,
                            quantity: newQuantity,
                            subtotal,
                            taxAmount,
                          };
                        });

                        const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal + (item.taxAmount || 0), 0);

                        return { ...prevFormData, items: updatedItems, total: newTotal };
                      });
                    }}
                    inputProps={{ min: 1, style: { textAlign: "center" } }}
                    sx={{
                      width: "60px",
                      "& .MuiOutlinedInput-input": { padding: "6px", textAlign: "center" },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: "right", p: 1 }}>
                  ${formatWithDecimals ((p.cost || 0))}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {/* ${formatWithDecimals ((p.quantity ?? 0) * p.cost)} */}
                   ${formatWithDecimals ((p.subtotal || 0) + (p.taxAmount || 0))}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {formData.isTaxIncluded
                    ? "Incluido"
                    : typeof p.taxRate === 'object' && p.taxRate !== null && 'name' in p.taxRate
                      ? p.taxRate.name
                      : typeof p.taxRate === 'string'
                        ? taxRates.find(rate => rate._id === p.taxRate)?.name || "N/A"
                        : "N/A"}
                </TableCell>
                <TableCell sx={{ textAlign: "right", fontWeight: "bold" }}>
                   {/* ${formatWithDecimals (p.subtotal + (p.taxRate?.value ? (p.subtotal * p.taxRate.value / 100) : 0))} */}
                   ${formatWithDecimals ((p.subtotal ?? 0) + (p.taxAmount ?? 0))}
                </TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  {!formData.wasSent && (
                    <IconButton color="error" onClick={() => handleDeleteDialogOpen(index)}>
                      <DeleteIcon />
                    </IconButton>
                   )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>


        </Table>
      </TableContainer>

      {/* Totales */}
      <Box sx={{ 
        bgcolor: "#f5f5f5", 
        padding: 2, 
        borderRadius: 2, 
        textAlign: "right", 
        fontWeight: "bold",
        boxShadow: 2,
        mt: 2, 
        fontSize: "1.1rem" 
      }}>
        {/* Solo muestra el impuesto si NO está incluido */}
        {formData.isTaxIncluded ? (
          <>
            <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">
              Subtotal: ${formatWithDecimals (total)}
            </Typography>
            <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">
              Tax: $0
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">
              Subtotal: ${formatWithDecimals (subtotal)}
            </Typography>
            <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">
              Tax: ${formatWithDecimals (tax)}
            </Typography>
          </>
        )}
        <Typography variant="h5" sx={{ color: "primary.main", fontSize: "1.5rem", fontWeight: "bold" }}>
            Total: ${formatWithDecimals (total)}
            {/* Total: ${formatWithDecimals (formData.total * 1.19)} */}
        </Typography>
      </Box>

      {/* Botones */}
      <Box 
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          mt: 3,
          "@media (max-width: 600px)": {
            flexDirection: "column",
            alignItems: "center",
          },
        }}
        >
         {/* Botón de Guardar */}
         {!formData.wasSent && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            sx={{
              minWidth: "180px",
              height: "45px",
              fontSize: "1rem",
              borderRadius: "8px",
            }}
          >
            Save
          </Button>
         )}

         {!formData.wasSent && (
          <Button 
            variant="contained" 
            color="info" 
            onClick={handleSaveAndSend}
            sx={{
              minWidth: "180px",
              height: "45px",
              fontSize: "1rem",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            Save & Send Email
          </Button>
         )}

         {formData.wasSent && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<Inventory />}
            onClick={handleOpenEntryModal}
            disabled={!formData._id || !["pending", "partial"].includes(formData.status)}
            sx={{
              minWidth: "180px",
              height: "45px",
              fontSize: "1rem",
              borderRadius: "8px",
            }}
          >
            Receive Items
          </Button>
          )}

        {/* 
        <Button 
          variant="outlined"
          color="primary" 
          onClick={generatePDF}
          sx={{
            minWidth: "180px",
            height: "45px",
            fontSize: "1rem",
            borderRadius: "8px",
          }}
        >
          Generate PDF
        </Button> 

        <Button 
          variant="outlined" 
          color="success" 
          onClick={sendEmailWithPDF}
          //disabled={!generatePDF} // Deshabilita si no se ha generado el PDF
          sx={{
            minWidth: "180px",
            height: "45px",
            fontSize: "1rem",
            borderRadius: "8px",
          }}
        >
          Send Email
        </Button> 
        */}

        {/* Botón de Buscar Orden */}
        <Button 
          variant="outlined" 
          color="info" 
          onClick={() => setSearchDialogOpen(true)} 
          sx={{
            minWidth: "180px",
            height: "45px",
            fontSize: "1rem",
            borderRadius: "8px",
          }}>
          <SearchIcon sx={{ mr: 1 }} />
          Find Order
        </Button>
        
        {/* Botón de Cancelar */}
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleConfirmCancel}
          sx={{
            minWidth: "180px",
            height: "45px",
            fontSize: "1rem",
            borderRadius: "8px",
          }}
        >
          Cancel
        </Button>
      </Box>

      {/* 🔍 Modal para Buscar Orden */}
      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#666" }}>Find Purchase Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Enter Order Number"
            fullWidth
            value={searchOrderNumber}
            onChange={(e) => setSearchOrderNumber(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)} color="error" variant="outlined">Cancel</Button>
          <Button onClick={handleSearchOrder} color="primary" variant="contained">Search</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Búsqueda Avanzada */}
      <Dialog open={searchModalOpen} onClose={() => setSearchModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem", pb: 1, color: "#666" }}>Select a Product</DialogTitle>
        
        <DialogContent>
          {/* Campo de búsqueda */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Enter product name or code"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputBase-root": { height: 48 }, 
                "& .MuiInputLabel-root": { top: "4px" },
              }}
            />
          </Box>

          {/* Tabla de resultados */}
          <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto", borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  {["Code", "Product Name", "Category", "Price", "Stock", "Action"].map((head) => (
                    <TableCell key={head} sx={{ color: "white", fontWeight: "bold", p: 1, textAlign: head === "Action" ? "center" : "left" }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((prod) => (
                  <TableRow key={prod._id} hover>
                    <TableCell sx={{ p: 1 }}>{prod.sku}</TableCell>
                    <TableCell sx={{ p: 1 }}>{prod.name}</TableCell>
                    <TableCell sx={{ p: 1, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.category}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "right" }}>${prod.price.toFixed(2)}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "center" }}>{prod.stock}</TableCell>
                    <TableCell sx={{ p: 1, textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ borderRadius: 2, minWidth: 80 }}
                        onClick={() => {
                          setSelectedProduct({ ...prod, quantity: 1 });
                          setSearchTerm(prod.sku);
                          setSearchModalOpen(false);
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pr: 2 }}>
          <Button onClick={() => setSearchModalOpen(false)} color="error" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <PurchaseOrderEntryModal
        open={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onConfirm={async (entries) => {
          const validEntries = entries
            .filter((entry) => entry.quantityToReceive > 0)
            .map((entry) => ({
              ...entry,
              quantity: entry.quantityToReceive * (entry.unitFactor ?? 1), // ✅ Nuevo campo transformado
            }));

        //🔁 1. ACTUALIZAR COSTO de los ítems en formData
          const updatedItems = formData.items.map((item) => {
            const matchedEntry = validEntries.find(e => e.referenceId === item.referenceId);

            if (!matchedEntry) return item;

            const newCost = matchedEntry.cost;
            const quantity = item.quantity ?? 1;

            // Obtener tasa de impuesto
            let taxRateValue = 0;
            if (typeof item.taxRate === "object" && item.taxRate !== null && "rate" in item.taxRate) {
              taxRateValue = item.taxRate.rate;
            }

            // Calcular subtotal e impuesto
            const { subtotal, taxAmount } = calculateTaxData(
              newCost,
              quantity,
              taxRateValue,
              formData.isTaxIncluded || false
            );

            return {
              ...item,
              cost: newCost,
              subtotal,
              taxAmount,
            };
          });

          const newFormData = {
            ...formData,
            items: updatedItems
          };

          setFormData(newFormData); // opcional, si quieres actualizar visualmente

          // 🔁 2. GUARDAR LA PO ACTUALIZADA antes de movimientos
          const updatedOrder = await dispatch(updatePurchaseOrder({
              id: formData._id,
              provider: typeof formData.provider === "string" ? formData.provider : formData.provider._id,
              items: newFormData.items.map((item) => ({
                ...item,
                taxRate: typeof item.taxRate === "object" ? item.taxRate._id : item.taxRate,
                unitPurchase: item.unitPurchase,
                unitFactor: item.unitFactor || 1
              })),
              total: newFormData.items.reduce((sum, p) => sum + (p.subtotal || 0) + (p.taxAmount || 0), 0),
              estimatedDeliveryDate: formData.estimatedDeliveryDate,
            })).unwrap();
          if (!updatedOrder) {
            toast.error("❌ Error al guardar PO antes de movimiento");
            return;
          }
        
           // 🔁 3. CREAR MOVIMIENTOS de inventario
          const movementPromises = validEntries.map((entry) => {
            const matchingItem = formData.items.find(
              (item) => item.referenceId === entry.referenceId
            );
          
            return dispatch(createInventoryMovement({
              warehouse: entry.warehouseId, // este ya lo usas
              referenceId: entry.referenceId!,
              referenceType: entry.referenceType,
              sourceType: 'PurchaseOrder',
              sourceId: formData._id,
              type: 'entry',
              quantity: entry.quantity, // ✅ Ya viene transformado con unitFactor
              status: 'validated',
              date: new Date().toISOString(),
              createdBy: userInfo?.id || '',
              sourceWarehouse: matchingItem?.initialWarehouse || undefined,     // 👈 nuevo campo
              destinationWarehouse: entry.warehouseId,                          // 👈 nuevo campo
            }));
          });
          
        
          // Esperar todos los movimientos
          await Promise.all(movementPromises);
        
          // 🔹 Esperar brevemente antes de refrescar (opcional, si aún da problemas)
          await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms de espera

          // Volver a cargar la orden actualizada
          if (formData.orderNumber) {
            dispatch(fetchPurchaseOrderByNumber({
              orderNumber: formData.orderNumber
            }))
            .unwrap()
            .then((response) => {
              const foundProvider = providers.find(p => p._id === response.provider) || response.provider;
        
              setFormData({
                _id: response._id,
                provider: typeof foundProvider === "string" ? foundProvider : foundProvider._id,
                orderNumber: response.orderNumber,
                createdAt: response.createdAt,
                status: response.status,
                items: response.items.map((item) => ({
                  type: item.type,
                  referenceId: item.referenceId,
                  sku: item.sku,
                  name: item.name,
                  quantity: item.quantity || 1,
                  cost: item.cost,
                  unitPrice: item.unitPrice,
                  subtotal: item.subtotal,
                  receivedQuantity: item.receivedQuantity ?? 0,
                  initialWarehouse: item.initialWarehouse || "", // ✅ AÑADIR ESTO
                  kitComponents: item.kitComponents || [],
                  taxRate: typeof item.taxRate === 'string'
                      ? taxRates.find(rate => rate._id === item.taxRate)
                      : item.taxRate,
                  taxAmount: item.taxAmount ?? 0,  // ✅ AÑADIR ESTO                  
                  unitPurchase: item.unitPurchase,
                  unitFactor: item.unitFactor || 1
                })),
                total: response.total,
                estimatedDeliveryDate: response.estimatedDeliveryDate,
                wasSent: response.wasSent
              });

              // ✅ Mensaje visual si cambió a received
              if (response.status === 'received') {
                toast.success('¡PO completada con éxito!');
              }
              
            });
          }
        
          setIsEntryModalOpen(false);
        }}
        
        
        items={entryItems}
        warehouses={warehouses}
      />



      <CustomDialog
        isOpen={deleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to remove this product?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ProductSelectorModal
        open={selectorOpen}
        products={products}
        filterType={['product', 'kit']}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectItem}
      />


    </Box>
  );
};

export default PurchaseOrderPage;

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
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
    fetchPurchaseOrderByNumber, clearMessages  } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { Kit } from "../../store/slices/kitSlice";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import SelectorModal from "../../components/SelectorModal";

import CustomDialog from '../../components/Dialog'; // Dale un alias como 'CustomDialog'
import axiosInstance from "../../api/axiosInstance";

export interface Product {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  status: 'active' | 'inactive';
}

interface SelectedProduct extends Product {
  quantity: number;
}


interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};


const PurchaseOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { purchaseOrders, successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);
  const { products } = useAppSelector((state) => state.products);
  const { userInfo } = useAppSelector((state) => state.auth);


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
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState(""); // Estado del input
  const [searchDialogOpen, setSearchDialogOpen] = useState(false); // Estado del modal  
  const [selectorModalOpen, setSelectorModalOpen] = useState(false);


  const orderNumberFromState = location.state?.orderNumber || "";
  //const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchProviders({ status: "active" }));
    dispatch(fetchProducts({ status: "active" }));
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, products]);

  // Manejo de mensajes
  useEffect(() => {
    console.log("📢 Redux errorMessage:", errorMessage);
    console.log("📢 Redux successMessage:", successMessage);
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
  
    console.log("🔍 Buscando orden:", orderNumberFromState);
    setSearchOrderNumber(orderNumberFromState);
  
    // Buscar la orden directamente dentro del useEffect
    dispatch(fetchPurchaseOrderByNumber(orderNumberFromState))
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
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            kitComponents: item.kitComponents || [], // Solo si es un kit
          })),
          total: response.total,
          estimatedDeliveryDate: response.estimatedDeliveryDate,
        });
        
  
        console.log("✅ Orden cargada con éxito:", response);
        setSearchDialogOpen(false);
        setSearchOrderNumber("");
      })
      .catch((error) => {
        console.error("❌ Error al buscar la orden:", error);
        toast.error("Order not found.");
      });
  }, [orderNumberFromState, dispatch, providers]); // Ahora `handleSearchOrder` no es necesario en las dependencias
  
  

  const generatePDF = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      console.log("generatePDF - Productos en la orden:", formData.items);
      // 📌 Título centrado
      doc.setFontSize(20);
      doc.text("Purchase Order", doc.internal.pageSize.width / 2, 20, { align: "center" });
  
      // 📌 Información de la orden
      const foundProvider = providers.find(p => p._id === formData.provider);
      doc.setFontSize(12);
      doc.text(`Order Number: ${formData.orderNumber}`, 20, 40);
      doc.text(`Provider: ${foundProvider ? foundProvider.name : "Unknown"}`, 20, 50);

      // 📌 Formatear fecha como MM/DD/YYYY
      const formattedDate = formData.createdAt 
      ? new Date(formData.createdAt).toLocaleDateString("en-US")
      : "N/A"; // O cualquier valor por defecto como "Not available"

      doc.text(`Created At: ${formattedDate}`, 20, 60);
      doc.text(`Status: ${formData.status}`, 20, 70);
  
      // 📌 Encabezados de la tabla
      const columns = [
        { header: "Code", dataKey: "sku" },
        { header: "Product", dataKey: "name" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Price", dataKey: "unitPrice" },
        { header: "Subtotal", dataKey: "subtotal" },
      ];
  
      // 📌 Filas con los productos
      const rows = formData.items.map((p) => ({
        sku: p.type === "product" ? (p.referenceId || "N/A") : "N/A",  // 🔹 Si es un producto, usa referenceId (que debería ser el ID del producto)
        name: p.name,
        quantity: p.quantity ? p.quantity.toLocaleString() : "N/A",
        unitPrice: `$${p.unitPrice.toLocaleString()}`,
        subtotal: `$${p.subtotal.toLocaleString()}`,
      }));
  
      // 📌 Generar la tabla con estilos
      autoTable(doc, {
        startY: 90,
        head: [columns.map(col => col.header)],
        body: rows.map((p) => columns.map(col => p[col.dataKey as keyof typeof p])), // ✅ Corregido aquí
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3, halign: "right" },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "left" } }, // "Code" y "Product" alineados a la izquierda
        headStyles: { fillColor: [31, 73, 125], textColor: [255, 255, 255] }, // Azul oscuro para encabezado
      });
  
      // 📌 Obtener la última posición de la tabla
      const finalY = doc.lastAutoTable?.finalY || 80;
  
      // 📌 Totales alineados a la derecha
      const totalX = 140; // Posición en X a la derecha
      doc.setFontSize(12);
      doc.text(`Subtotal: $${formData.total.toLocaleString()}`, totalX, finalY + 10);
      doc.text(`Tax (19%): $${(formData.total * 0.19).toLocaleString()}`, totalX, finalY + 20);
      doc.setFontSize(14);
      doc.text(`Total: $${(formData.total * 1.19).toLocaleString()}`, totalX, finalY + 30);
  
      // 📌 Guardar el PDF
      doc.save(`PurchaseOrder_${formData.orderNumber}.pdf`);
  
      // 📌 Convertir el PDF en Blob y resolver la promesa
      const pdfBlob = doc.output("blob");
      resolve(pdfBlob);
    });
  };
  
  
  
  const sendEmailWithPDF = async () => {
    if (!formData.orderNumber) {
      //alert("No hay orden de compra seleccionada");
      toast.error("No hay orden de compra seleccionada")
      return;
    }
  
    try {
      console.log('sendEmailWithPDF init..');
      const pdfBlob = await generatePDF();
      console.log('sendEmailWithPDF p2..');
  
      const formDataToSend = new FormData();
      console.log('sendEmailWithPDF p3..');
  
      formDataToSend.append("pdf", pdfBlob, `PurchaseOrder_${formData.orderNumber}.pdf`);
      console.log('sendEmailWithPDF p4..');
  
      formDataToSend.append("email", "insanmartind@gmail.com");
      formDataToSend.append("orderNumber", formData.orderNumber);
  
      console.log('sendEmailWithPDF p5..', formDataToSend);
  
      await axiosInstance.post(`/purchase-orders/send-email/${formData.orderNumber}`, formDataToSend, {
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
  
  const handleSelectItem = (item: Product | Kit, quantity: number) => {
    setFormData((prevFormData) => {
      // Buscar si el producto ya está en la lista de ítems
      const existingIndex = prevFormData.items.findIndex((p) => p.referenceId === item._id);
      let updatedItems;
  
      if (existingIndex !== -1) {
        // Si el producto ya existe, actualizar cantidad y subtotal
        updatedItems = prevFormData.items.map((p, i) =>
          i === existingIndex
            ? { 
                ...p, 
                quantity: (p.quantity ?? 0) + 1, 
                subtotal: ((p.quantity ?? 0) + 1) * p.unitPrice 
              }
            : p
        );
      } else {
        // Si es un producto nuevo, agregarlo a la lista
        const newItem: PurchaseOrderItem = {
          type: "product", // Si es un kit, este valor deberá ser "kit"
          referenceId: item._id,
          sku: "sku" in item ? item.sku : "N/A", // ✅ Agrega el SKU
          name: item.name,
          quantity,
          unitPrice: "price" in item ? item.price : 0,
          subtotal: "price" in item ? item.price : 0,
        };
  
        // Si es un kit, agregar los componentes
        if ("components" in item) {
          newItem.type = "kit";
          newItem.kitComponents = item.components.map((component) => ({
            product: typeof component.product === "string" ? component.product : component.product._id, // 🔹 Asegura que siempre sea un string
            productName: component.productName, // ✅ Cambiar `name` por `productName`
            quantity: component.quantity,
          }));
        }
  
        updatedItems = [...prevFormData.items, newItem];
      }
  
      // Calcular el nuevo total
      const newTotal = updatedItems.reduce((sum, p) => sum + p.subtotal, 0);
  
      return { ...prevFormData, items: updatedItems, total: newTotal };
    });
  
    setSelectorModalOpen(false);
  };
  
  
  

  // ✅ Función para buscar la orden
  const handleSearchOrder = async () => {
    if (!searchOrderNumber.trim()) return;

    try {
      const response = await dispatch(fetchPurchaseOrderByNumber(searchOrderNumber)).unwrap();

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
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          kitComponents: item.kitComponents || [], // Solo si es un kit
        })),
        total: response.total,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
      });

      setSearchDialogOpen(false);
      setSearchOrderNumber("");
    } catch (error) {
      console.error("❌ Error al buscar la orden:", error);
      //alert("Order not found.");
    }
  };

  const handleProductSearch = () => {
    const foundProduct = products.find((prod) => prod.sku === searchTerm);
    if (foundProduct) {
      setSelectedProduct({ ...foundProduct, quantity: 1 });
    }
  };

  
  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Seleccione Product")
      return;
    }
  
    setFormData((prevFormData) => {
      // Buscar si el producto ya existe en la lista
      const existingProductIndex = prevFormData.items.findIndex(
        (p) => p.referenceId === selectedProduct._id // 🔹 Ahora compara con `productId`
      );
  
      let updatedProducts;
      if (existingProductIndex !== -1) {
        // Si el producto ya está en la lista, actualizamos la cantidad
        updatedProducts = prevFormData.items.map((p, index) =>
          index === existingProductIndex
            ? {
                ...p,
                quantity: (p.quantity ?? 0) + selectedProduct.quantity,
                subtotal: ((p.quantity ?? 0) + selectedProduct.quantity) * p.unitPrice,
              }
            : p
        );
      } else {
        // Si es un producto nuevo, lo agregamos a la lista
        updatedProducts = [
          ...prevFormData.items,
          {
            productId: selectedProduct._id, // ✅ Ahora se envía `productId`
            name: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity: selectedProduct.quantity,
            unitPrice: selectedProduct.price,
            subtotal: selectedProduct.quantity * selectedProduct.price,
          },
        ];
      }
  
      // Calcular el total de la orden sumando todos los subtotales
      const newTotal = updatedProducts.reduce(
        (sum, p) => sum + p.unitPrice * (p.quantity ?? 0),
        0
      );
  
      return {
        ...prevFormData,
        products: updatedProducts,
        total: newTotal,
      };
    });
  
    setSelectedProduct(null);
    setSearchTerm("");
  };
  
  
  

  const handleSubmit = () => {
    console.log('handleSubmit -> Inicio');
    
    const userId = userInfo?.id || undefined;
    console.log("handleSubmit -> Usuario autenticado:", userId);

    const providerObject: Provider | undefined =
      typeof formData.provider === "string"
        ? providers.find((p) => p._id === formData.provider)
        : formData.provider;
  
    if (!providerObject) {
      console.error("Proveedor no encontrado");
      toast.error("Proveedor no encontrado")
      return;
    }
  
    console.log("handleSubmit -> Proveedor encontrado:", providerObject);
  
    // Construir objeto de orden de compra
    const purchaseOrderData = {
      ...formData,
      provider: providerObject._id, // ✅ Solo enviamos el _id
      createdBy: userId,  // Agregar el usuario que creó la orden
    };
    console.log("handleSubmit -> Datos de la PO:", purchaseOrderData);

    if (formData.orderNumber) {
      // Buscar la orden en la lista de Redux usando el número de orden
      const existingOrder = purchaseOrders.find(po => po.orderNumber === formData.orderNumber);

      if (!existingOrder) {
        console.error("❌ No se encontró la orden con el número:", formData.orderNumber);
        toast.error("❌ No se encontró la PO ")
        return;
      }      

      console.log("🔍 handleSubmit -> ID de la orden encontrada:", existingOrder); // <-- Agrega este log

      // Si ya tiene un número de orden, actualizamos
      dispatch(updatePurchaseOrder({
        id: existingOrder._id, // ✅ ID correcto
        provider: providerObject._id, // ✅ SOLO EL ID
        items: formData.items, // ✅ Cambia `products` por `items`
        total: formData.total,
        estimatedDeliveryDate: formData.estimatedDeliveryDate,
      }))
      .unwrap()
      .then((data) => {
        console.log("Orden actualizada exitosamente", data);
        setFormData((prevForm) => ({
          ...prevForm,
          orderNumber: data.orderNumber, 
          createdBy: userId, 
          createdAt: data.createdAt, 
          status: data.status, 
        }));
      })
      .catch((error) => {
        console.error("Error al actualizar PO: ", error);
        toast.error("Error al actualizar PO")
      });
    }  else {      
      dispatch(createPurchaseOrder(purchaseOrderData))
        .unwrap()
        .then((data) => {
          console.log("Orden creada exitosamente", data);
          setFormData((prevForm) => ({
            ...prevForm,
            orderNumber: data.orderNumber, // Asegurar que se actualiza correctamente
            createdBy: userId, // Agregar el usuario
            createdAt: data.createdAt, // 👈 Guardar createdAt en formData
            status: data.status, // 👈 Guardar el status en formData
          }));
        })
        .catch((error) => {
          console.error("Error al crear PO: ", error);
          toast.error("Error al crear PO")
        });
    }  
    console.log('handleSubmit -> fin');
    //console.log(formData);
  };
  

  const handleDeleteDialogOpen = (index: number) => {
    setSelectedProductIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProductIndex !== null) {
      const updatedProducts = formData.items.filter((_, i) => i !== selectedProductIndex);
      const newTotal = updatedProducts.reduce(
        (sum, p) => sum + p.unitPrice * (p.quantity ?? 0),
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
    });
  
    setSelectedProduct(null);
    setSearchTerm("");
    setSearchOrderNumber("");
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
        <Select
          value={formData.provider || ""}  // ✅ Aquí no necesitas acceder a _id
          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Provider</MenuItem>
          {providers.map((provider) => (
            <MenuItem key={provider._id} value={provider._id}>
              {provider.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          variant="outlined" // 👈 Esto asegura un borde visible
          label="Order Number"
          value={formData.orderNumber || "Auto-generated"}
          disabled
          fullWidth
          sx={{ 
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setSelectorModalOpen(true)}
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
        <Table stickyHeader size="small"> {/* Se cambia a "small" para hacerla más compacta */}
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Code</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Quantity</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Price</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Subtotal</TableCell>
              <TableCell sx={{ textAlign: "right", color: "white", fontWeight: "bold" }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.items.map((p, index) => (
               <TableRow key={index} sx={{ bgcolor: index % 2 ? "#f9f9f9" : "white" }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.sku || "N/A"}</TableCell>  {/* 🔹 Ahora accede directamente a `sku` */}
                <TableCell>{p.name || "N/A"}</TableCell>  {/* 🔹 Ahora accede directamente a `name` */}
                {/* <TableCell sx={{ textAlign: "right" }}>{formatNumber(p.quantity ?? 0)}</TableCell> */}
                <TableCell>
                  <TextField
                    type="number"
                    value={p.quantity}
                    onChange={(e) => {
                      const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                      setFormData((prevFormData) => {
                        const updatedItems = prevFormData.items.map((item, i) =>
                          i === index ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice } : item
                        );
                        const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
                        return { ...prevFormData, items: updatedItems, total: newTotal };
                      });
                    }}
                    inputProps={{ min: 1 }}
                    sx={{ width: "80px" }}
                  />
                </TableCell>                
                <TableCell sx={{ textAlign: "right" }}>${formatNumber(p.unitPrice)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>${formatNumber((p.quantity ?? 0) * p.unitPrice)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>
                  <IconButton color="error" onClick={() => handleDeleteDialogOpen(index)}>
                    <DeleteIcon />
                  </IconButton>
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
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Subtotal: ${formatNumber(formData.total)}</Typography>
        <Typography sx={{ color: "#333", fontWeight: "bold" }} variant="h6">Tax (19%): ${formatNumber(formData.total * 0.19)}</Typography>
        <Typography variant="h5" sx={{ color: "primary.main", fontSize: "1.5rem", fontWeight: "bold" }}>
          Total: ${formatNumber(formData.total * 1.19)}
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


      <CustomDialog
        isOpen={deleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to remove this product?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <SelectorModal
        open={selectorModalOpen}
        onClose={() => setSelectorModalOpen(false)}
        onSelect={handleSelectItem}
      />

    </Box>
  );
};

export default PurchaseOrderPage;

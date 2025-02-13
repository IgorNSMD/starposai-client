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
//import "jspdf-autotable";

import { 
    fetchPurchaseOrders, 
    createPurchaseOrder, 
    updatePurchaseOrder,
    fetchPurchaseOrderByNumber  } from "../../store/slices/purchaseOrderSlice";
import { fetchProviders } from "../../store/slices/providerSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "../../store/redux/hooks";
import { useToastMessages } from  "../../hooks/useToastMessage"
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

interface POProduct {
  productId: string; // 🔹 Ahora directamente el ID del producto
  sku: string;
  name: string;  
  genericProduct?: string; // Si es un producto genérico
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Provider {
  _id: string;
  name: string;
}

interface PurchaseOrderFormData {
  provider: string | Provider;
  products: POProduct[];
  total: number;
  estimatedDeliveryDate: string;
  orderNumber?: string;  // Agregamos orderNumber opcionalmente
  createdAt?: string;  // Agregamos createdAt opcionalmente
  status?: "pending" | "partial" | "received" | "inactive";
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
};


const PurchaseOrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { successMessage, errorMessage } = useAppSelector((state) => state.purchaseorders);
  const { providers } = useAppSelector((state) => state.providers);
  const { products } = useAppSelector((state) => state.products);
  const { userInfo } = useAppSelector((state) => state.auth);
  const { purchaseOrders } = useAppSelector((state) => state.purchaseorders);

  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    provider: '',
    estimatedDeliveryDate: '',
    products: [] as POProduct[], // <-- Agrega la tipificación explícita
    total: 0,
    createdAt: "", // 👈 Agregar createdAt
    status: "pending",  // ✅ Esto asegura que status siempre tenga un valor válido
 });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [searchOrderNumber, setSearchOrderNumber] = useState(""); // Estado del input
  const [searchDialogOpen, setSearchDialogOpen] = useState(false); // Estado del modal  
  

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
  useToastMessages(successMessage, errorMessage);

  const generatePDF = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      console.log("generatePDF - Productos en la orden:", formData.products);
      // 📌 Título centrado
      doc.setFontSize(20);
      doc.text("Purchase Order", doc.internal.pageSize.width / 2, 20, { align: "center" });
  
      // 📌 Información de la orden
      doc.setFontSize(12);
      doc.text(`Order Number: ${formData.orderNumber}`, 20, 40);
      doc.text(`Provider: ${typeof formData.provider === "string" ? formData.provider : formData.provider.name}`, 20, 50);

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
      const rows = formData.products.map((p) => ({
        sku:  p.sku,     // 🔹 Asegura que se pase el SKU
        name: p.name,
        quantity: p.quantity.toLocaleString(),
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
      alert("No hay orden de compra seleccionada");
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
  
      alert("Email enviado con éxito");
    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar email");
    }
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
        provider: foundProvider,
        orderNumber: response.orderNumber,
        createdAt: response.createdAt,
        status: response.status,
        products: response.products.map((p) => ({
          productId: p.productId,
          name: p.name,
          sku: p.sku,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          subtotal: p.subtotal,
        })),
        total: response.total,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
      });

      setSearchDialogOpen(false);
      setSearchOrderNumber("");
    } catch (error) {
      console.error("❌ Error al buscar la orden:", error);
      alert("Order not found.");
    }
  };

  const handleProductSearch = () => {
    const foundProduct = products.find((prod) => prod.sku === searchTerm);
    if (foundProduct) {
      setSelectedProduct({ ...foundProduct, quantity: 1 });
    }
  };

  
  const handleAddProduct = () => {
    if (!selectedProduct) return;
  
    setFormData((prevFormData) => {
      // Buscar si el producto ya existe en la lista
      const existingProductIndex = prevFormData.products.findIndex(
        (p) => p.productId === selectedProduct._id // 🔹 Ahora compara con `productId`
      );
  
      let updatedProducts;
      if (existingProductIndex !== -1) {
        // Si el producto ya está en la lista, actualizamos la cantidad
        updatedProducts = prevFormData.products.map((p, index) =>
          index === existingProductIndex
            ? {
                ...p,
                quantity: p.quantity + selectedProduct.quantity,
                subtotal: (p.quantity + selectedProduct.quantity) * p.unitPrice,
              }
            : p
        );
      } else {
        // Si es un producto nuevo, lo agregamos a la lista
        updatedProducts = [
          ...prevFormData.products,
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
        (sum, p) => sum + p.unitPrice * p.quantity,
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
        return;
      }      

      console.log("🔍 handleSubmit -> ID de la orden encontrada:", existingOrder); // <-- Agrega este log

      // Si ya tiene un número de orden, actualizamos
      dispatch(updatePurchaseOrder({
        id: existingOrder._id,  // 👈 Aquí enviamos el ID correcto desde MongoDB
        data: {
          provider: providerObject._id,  // ✅ SOLO EL ID
          products: formData.products,
          total: formData.total,
          estimatedDeliveryDate: formData.estimatedDeliveryDate,
        }
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
      const updatedProducts = formData.products.filter((_, i) => i !== selectedProductIndex);
      const newTotal = updatedProducts.reduce(
        (sum, p) => sum + p.unitPrice * p.quantity,
        0
      );
      setFormData({ ...formData, products: updatedProducts, total: newTotal });
    }
    setDeleteDialogOpen(false);
  };


  const handleConfirmCancel = () => {
    setFormData({
      provider: '',
      estimatedDeliveryDate: '',
      products: [],
      total: 0,
      orderNumber: undefined,
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
          value={typeof formData.provider === "string" ? formData.provider : formData.provider?._id || ""}
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

      {/* Búsqueda de Producto */}
      {/* Sección de búsqueda de producto en dos líneas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // Web: dos columnas para separar filas
          gap: 2,
          alignItems: "center",
          mb: 3,
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr", // Móvil: una sola columna
          },
        }}
      >
        {/* Primera línea en web */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto 1fr auto", // Web: Distribución normal
            gap: 2, // Aumenta el espacio entre los elementos
            alignItems: "center",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "40px 1fr", // Móvil: Acomoda en una sola columna
            },
          }}
        >
          {/* Botón de limpiar */}
          <IconButton onClick={() => { setSearchTerm(""); setSelectedProduct(null); }} color="secondary">
            ❌
          </IconButton>

          {/* Code Input */}
          <TextField label="Code" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />

          {/* Buscar producto */}
          <IconButton onClick={handleProductSearch} sx={{ marginLeft: "-10px" }}>
            <SearchIcon />
          </IconButton>

          {/* Product Name Input */}
          <TextField 
            label="Product Name" 
            value={selectedProduct?.name || ""} 
            fullWidth 
            disabled 
            variant="outlined" // Asegura que tenga bordes visibles
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)", // Color del borde
                },
                "&:hover fieldset": {
                  borderColor: "primary.main", // Color del borde al pasar el mouse
                },
                "&.Mui-disabled fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)", // Color del borde cuando está deshabilitado
                },
              },
            }}
            />


        </Box>

        {/* Segunda línea en web */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto auto auto auto auto", // Web: Distribución normal
            gap: 2,
            alignItems: "center",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr", // Móvil: Apilado
              gap: 2,
            },
          }}
        >
          {/* Product List Icon */}
          <IconButton onClick={() => setSearchModalOpen(true)} sx={{ marginLeft: "-10px" }}>
            📋
          </IconButton>

          {/* Cantidad */}
          <TextField
            label="Qty"
            type="number"
            value={selectedProduct?.quantity || ""}
            onChange={(e) =>
              setSelectedProduct((prev) =>
                prev ? { ...prev, quantity: Number(e.target.value) } : null
              )
            }
            fullWidth
          />

          {/* Precio */}
          <TextField
            label="Price"
            type="text" 
            value={selectedProduct?.price ? new Intl.NumberFormat("es-CL").format(selectedProduct.price) : ""}
            fullWidth
            disabled
            sx={{
              borderRadius: 1,
              border: "1px solid #ccc",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#555",
              textAlign: "right",
              "& .MuiInputBase-input": {
                textAlign: "right", // Asegura que el texto dentro del input esté a la derecha
              },
              "@media (max-width: 900px)": {
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: "bold",
                pt: 1,
              },
            }}
          />

          {/* Total */}
          <TextField
            label="Total"
            value={selectedProduct?.quantity && selectedProduct?.price
              ? new Intl.NumberFormat("es-CL").format(selectedProduct.quantity * selectedProduct.price)
              : ""}
            fullWidth
            disabled
            sx={{
              borderRadius: 1,
              border: "1px solid #ccc",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#555",
              textAlign: "right",
              "& .MuiInputBase-input": {
                textAlign: "right", // Asegura que el texto dentro del input esté a la derecha
              },
              "@media (max-width: 900px)": {
                marginTop: "8px",
              },
            }}
          />

          {/* Botón "+" */}
          <IconButton
            color="primary"
            onClick={handleAddProduct}
            sx={{
              fontSize: "2rem",
              width: "48px",
              height: "48px",
              "@media (max-width: 900px)": {
                fontSize: "3rem", // Aumenta tamaño del ícono en móvil
                width: "64px", // Aumenta el tamaño del botón en móvil
                height: "64px",
                justifySelf: "center", // Centra horizontalmente en la grid
                alignSelf: "center", // Centra verticalmente en la grid
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>


      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          width: "100%",
          alignItems: "center",
          "@media (max-width: 900px)": {
            flexDirection: "column", // 🔹 Lo apilamos en móviles
            gap: 2,
          }
        }}
      >
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
            {formData.products.map((p, index) => (
               <TableRow key={index} sx={{ bgcolor: index % 2 ? "#f9f9f9" : "white" }}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.sku || "N/A"}</TableCell>  {/* 🔹 Ahora accede directamente a `sku` */}
                <TableCell>{p.name || "N/A"}</TableCell>  {/* 🔹 Ahora accede directamente a `name` */}
                <TableCell sx={{ textAlign: "right" }}>{formatNumber(p.quantity)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>${formatNumber(p.unitPrice)}</TableCell>
                <TableCell sx={{ textAlign: "right" }}>${formatNumber(p.quantity * p.unitPrice)}</TableCell>
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

    </Box>
  );
};

export default PurchaseOrderPage;

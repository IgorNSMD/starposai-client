import React, { useEffect }  from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import { 
  ProductItem,
  SaleItem,
  PaymentInfo,
  Table,
  SaleStatus,
  TableStatus,
} from "../../../types/index";

import { Sale } from "../../../store/slices/saleSlice";

interface RightPanelContentProps {
  isMobile: boolean;
  saleMode: "table" | "quick" | "loss" | "selfConsumption";
  selectedTable: string;
  selectedProducts: ProductItem[];
  drawerSale: {
    _id: string;
    partialPayments?: { amount: number }[];
  } | null;
  tables: Table[];
  cashGiven: string;
  parsedCash: number;
  change: number;
  paymentMethod: "cash" | "card";
  isTakeAway: boolean;
  total: number;
  isSelectionValid: boolean;
  selectedStaff: string;
  isPartial: boolean;

  setIsPartial: (value: boolean) => void;
  setCashGiven: (value: string) => void;
  setPaymentMethod: (value: "cash" | "card") => void;
  setIsTakeAway: (value: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerSale: (sale: Sale | null) => void;
  setSelectedProducts: (products: ProductItem[]) => void;
  setSelectedTable: (tableId: string) => void;
  setSelectedStaff: (staffId: string) => void;

  formatCurrency: (value: number, currencySymbol?: string) => string;
  onPartialPaymentRequest: (amount: number) => Promise<void>;

  addItemsToSale: (data: {
    saleId: string;
    saleItems: SaleItem[];
  }) => Promise<void>;

  deleteSale: (saleId: string) => Promise<void>;

  closeSale: (data: {
    saleId: string;
    payment: PaymentInfo;
  }) => Promise<void>;

  cancelSale: (saleId: string) => Promise<void>;

  createSale: (data: {
    staffId: string;
    saleItems: SaleItem[];
    isTakeAway: boolean;
    status: SaleStatus;
    payment: PaymentInfo & { total: number };
  }) => Promise<void>;

  updateTableStatus: (data: {
    tableId: string;
    status: TableStatus;
  }) => Promise<void>;

  createOutput: (data: {
    sourceType: "Loss" | "SelfConsumption";
    saleItems: { productId: string; quantity: number }[];
  }) => Promise<void>;

  fetchSaleById: (saleId: string) => Promise<Sale>;
  
  showSuccessToast: (msg: string) => void;
  showErrorToast: (msg: string) => void;

  
}


const RightPanelContent: React.FC<RightPanelContentProps> = ({
  isMobile,
  saleMode,
  selectedTable,
  selectedProducts,
  drawerSale,
  tables,
  cashGiven,
  parsedCash,
  change,
  paymentMethod,
  isTakeAway,
  total,
  isSelectionValid,
  selectedStaff,
  isPartial,
  setIsPartial,
  setCashGiven,
  setPaymentMethod,
  setIsTakeAway,
  setDrawerOpen,
  setDrawerSale,
  setSelectedProducts,
  setSelectedTable,
  setSelectedStaff,
  formatCurrency,
  addItemsToSale,
  deleteSale,
  closeSale,
  cancelSale,
  createSale,
  updateTableStatus,
  createOutput,
  onPartialPaymentRequest,
  fetchSaleById,
  showSuccessToast,
  showErrorToast,
}) => {

  useEffect(() => {
    if (drawerSale?.partialPayments && drawerSale.partialPayments.length > 0) {
      setIsPartial(true); // fuerza el estado
    }
  }, [drawerSale, setIsPartial]);

  useEffect(() => {
    if (drawerSale?.partialPayments?.length === 0 || !drawerSale?.partialPayments) {
      setIsPartial(false);
    }
  }, [drawerSale, setIsPartial]);

  useEffect(() => {
    if (saleMode !== "table") {
      setIsPartial(false); // ← desmarca cuando NO estás en Pedido en Mesa
    }
  }, [saleMode, setIsPartial]);

  
  const hasPartialPayments = !!drawerSale?.partialPayments && drawerSale.partialPayments.length > 0;
  //console.log("hasPartialPayments", hasPartialPayments, drawerSale?.partialPayments);

  const partialPaidAmount = drawerSale?.partialPayments?.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  ) || 0;

  //console.log("partialPaidAmount..", partialPaidAmount);

  const pendingBalance = total - partialPaidAmount;

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: { xs: 1, sm: 1.25 },
        position: "relative",
      }}
    >
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(false)}
          sx={{
            alignSelf: "flex-end",
            mb: 1,
            backgroundColor: "#fff",
            boxShadow: 1,
            zIndex: 10,
          }}
          aria-label="Cerrar carrito"
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* Aquí insertarías el contenido central del carrito igual que lo tienes actualmente */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                            disabled={isPartial}
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
                                await addItemsToSale({
                                  saleId: drawerSale._id,
                                  saleItems,
                                });
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
                            disabled={isPartial}
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
                                await addItemsToSale({
                                  saleId: drawerSale._id,
                                  saleItems,
                                });
                              }
                            }}
                          >
                            <Typography variant="body2">+</Typography>
                          </IconButton>

                          <IconButton
                            disabled={isPartial}
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
                                  await deleteSale(drawerSale._id);
                                  await updateTableStatus({ tableId: selectedTable, status: "available" });
                                  
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

                                  await addItemsToSale({
                                    saleId: drawerSale._id,
                                    saleItems,
                                  });
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

                {selectedProducts.length > 0 && (
                  <>
                    <Typography sx={{ mt: 1 }} variant="body1" color="text.primary">
                      Total: {formatCurrency(total, "€ ")}
                    </Typography>

                    {hasPartialPayments && (
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#444' }}>
                        Pagado: {formatCurrency(partialPaidAmount, "€ ")} – Saldo: {formatCurrency(pendingBalance, "€ ")}
                      </Typography>
                    )}

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

                    {saleMode === "table" && (
                      <>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isPartial}
                              disabled={hasPartialPayments} // 👈 importante
                              onChange={(e) => setIsPartial(e.target.checked)}
                            />
                          }
                          label="Pago Parcial"
                        />
                        
                              
                        {hasPartialPayments && (
                          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Este pedido ya tiene pagos parciales. No puedes desactivar esta opción.
                          </Typography>
                        )}

                        
                      </>
                    )}                    

                    {!["loss", "selfConsumption"].includes(saleMode) && (
                      <>
                        <Select
                          fullWidth
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
                          sx={{ mt: 1 }}
                        > 
                          <MenuItem value="cash">Efectivo</MenuItem>
                          <MenuItem value="card">Tarjeta</MenuItem>
                        </Select>
                                        
                        {/* Input del monto entregado */}
                        {paymentMethod === "cash" && (
                          <TextField
                            label="Monto Entregado"
                            type="number"
                            fullWidth
                            value={cashGiven}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d*\.?\d*$/.test(val)) {
                                setCashGiven(val);
                              }
                            }}
                            sx={{ mt: 2 }}
                            inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
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


                        {paymentMethod === "cash" && cashGiven !== "" && !isNaN(parsedCash) && !isPartial && (
                          <Typography sx={{ mt: 1 }}>
                            Vuelto: {formatCurrency(change, "€ ")}
                          </Typography>
                        )}                  
                      </>
                    )}                          

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2, alignSelf: "center", width: "90%" }}
                      disabled={selectedProducts.length === 0 || !isSelectionValid}
                      
                      onClick={async () => {
                        //const validCash = typeof cashGiven === "number" ? cashGiven : 0;
                        const validCash = parseFloat(cashGiven.replace(",", "."));

                        if (saleMode === "table" && drawerSale) {
                          if (isPartial) {
                            try {
                              //console.log('onPartialPaymentRequest initial...')
                              await onPartialPaymentRequest(validCash);
                              const updatedSale = await fetchSaleById(drawerSale._id);
                              setDrawerSale(updatedSale);
                              setCashGiven(""); // 🧼 Limpiar monto entregado
                              setPaymentMethod("cash");

                              showSuccessToast("Pago parcial registrado correctamente.");
                              setIsPartial(true); // 👈 opcional si quieres permitir solo 1 pago parcial por sesión
                            } catch (error) {
                              showErrorToast(
                                error instanceof Error ? error.message : "Error al registrar pago parcial"
                              );
                            }
                          } else {
                          // 🔷 Caso: Pedido en mesa ya creado → cerrar y liberar
                            try {
                              await closeSale({
                                saleId: drawerSale._id,
                                payment: {
                                  method: paymentMethod as "cash" | "card",
                                  amountPaid: paymentMethod === "cash" ? validCash : total,
                                  change: paymentMethod === "cash" ? validCash - total : 0,
                                }
                              });

                              if (selectedTable) {
                                await updateTableStatus({ tableId: selectedTable, status: "available" });
                              }

                              setSelectedProducts([]);
                              setDrawerSale(null);
                              setSelectedTable("");
                              setSelectedStaff("");
                              setCashGiven("");
                              setIsPartial(false);
                              setPaymentMethod("cash");

                              showSuccessToast("Pedido marcado como pagado y mesa liberada");
                            } catch (error) {
                              showErrorToast(error instanceof Error ? error.message : "Error al cerrar venta");
                            }
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

                            await createSale({
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
                            });

                            setSelectedProducts([]);
                            setCashGiven("");
                            setIsPartial(false);
                            setPaymentMethod("cash");
                            showSuccessToast("Pedido rápido registrado como pagado");
                          } catch (error) {
                            showErrorToast(error instanceof Error ? error.message : "Error al registrar pedido");
                          }
                        } else if (saleMode === "loss" || saleMode === "selfConsumption") {
                          try {
                            const sourceType = saleMode === "loss" ? "Loss" : "SelfConsumption";;
                            const saleItems = selectedProducts.map((item) => ({
                              productId: item._id,
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price,
                              subtotal: item.quantity * item.price,
                            }));
                            await createOutput({
                              sourceType,
                              saleItems,
                            });  
                            setSelectedProducts([]);
                            showSuccessToast(`Salida registrada como ${sourceType === "Loss" ? "Merma" : "Autoconsumo"}`);
                          } catch (error) {
                            showErrorToast(error instanceof Error ? error.message : "Error al registrar pedido");
                          }
                          
                        }
                      }}


                    >
                      {saleMode === "loss"
                        ? "Marcar como Merma"
                        : saleMode === "selfConsumption"
                        ? "Marcar como Autoconsumo"
                        : isPartial
                        ? "Registrar Pago Parcial"
                        : "Marcar como Pagado"}
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
                            await cancelSale(drawerSale._id);
                            await updateTableStatus({ tableId: selectedTable, status: "available" });

                            setSelectedProducts([]);
                            setDrawerSale(null);
                            setSelectedTable("");
                            setSelectedStaff("");
                            setCashGiven("");
                            setIsPartial(false);
                            setPaymentMethod("cash");

                            showSuccessToast("Pedido cancelado y mesa liberada");
                          } else if (saleMode === "quick") {
                            setSelectedProducts([]);
                            setCashGiven("");
                            setIsPartial(false);
                            setPaymentMethod("cash");

                            showSuccessToast("Pedido rápido cancelado");
                          } else if (saleMode === "loss" || saleMode === "selfConsumption") {
                            setSelectedProducts([]);
                            setCashGiven("");
                            setIsPartial(false);
                            setPaymentMethod("cash");

                            //showSuccessToast("Pedido rápido cancelado");
                          } 
                        } catch (error) {
                          showErrorToast(error instanceof Error ? error.message : "Error al cancelar el pedido");
                        }
                      }}
                    >
                      Cancelar Pedido
                    </Button>                    

                  </>

                  
                )}



              </Box>
            </Box>
         </Paper>
      </Box>      

    </Paper>
  );
};

export default RightPanelContent;

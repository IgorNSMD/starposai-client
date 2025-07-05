export interface ProductItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PaymentInfo {
  method: "cash" | "card";
  amountPaid: number;
  change: number;
}

export interface Table {
  _id: string;
  name: string;
  number: number;
  position: { x: number; y: number };
  status: "available" | "occupied" | "reserved";
  roomId: string;
  shape: string; // ✅ Nuevo campo agregado  
  companyId: string;
  venueId: string;
}

export type SaleStatus = "paid" | "cancelled" | "in_progress";
export type TableStatus = "available" | "occupied";

// Usado por dispatch (Redux Thunk)
export type ThunkActionResult = (dispatch: unknown) => Promise<unknown>;

export interface Table {
    _id: string;
    name: string;
    x: number;
    y: number;
    status: "available" | "occupied" | "reserved";
    roomId: string;
    shape: string;
    companyId: string;
    venueId: string;
    createdAt?: string;
  }
  
  export interface Warehouse {
    _id: string;
    name: string;
    location: string;
    status: 'active' | 'inactive';
    description?: string;
    companyId: string;
    venueId?: string;
    createdBy: string;
    createdAt: string;
  }

  // 📁 src/types/index.ts (o donde definas tus tipos)

export interface Parameter {
  key: string;
  value: string;
  description?: string;
  category: string;
  isActive?: boolean; // 👈 Añadir esta línea
  icon?: string; // ✅ <--- Añade esta línea
}

// Interfaces para tipado
export interface InventoryMovement {
  _id: string;
  warehouse: string | { _id: string; name: string }; // 👈 corregido
  referenceId: string | { _id: string; name: string }; // 👈 igual acá
  referenceType: 'Product' | 'Kit';
  sourceType: 'PurchaseOrder' | 'SalesOrder' | 'Manual' | 'Adjustment' | 'Disassembly' | 'Return'| 'Transfer';
  sourceId?: string;
  type: 'entry' | 'exit' | 'transfer' | 'adjustment' | 'disassembly';
  quantity: number;
  reason?: string;
  linkedMovementId?: string;
  status: 'pending' | 'validated' | 'cancelled';
  date: string;
  createdBy: string;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  kitComponents?: { productId: string; quantity: number }[];
}

// types/inventory.ts o dentro del slice por ahora
export interface GenericOutputParams {
  companyId: string;
  venueId: string;
  userId: string;
  sourceType: 'Loss' | 'SelfConsumption';
  reason?: string;
  movementType: 'Output';
  items: {
    productId: string;
    quantity: number;
  }[];
}

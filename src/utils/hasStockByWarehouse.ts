export interface StockByWarehouseEntry {
  warehouse: string;
  quantity: number;
}

export interface WithStockByWarehouse {
  stockByWarehouse: StockByWarehouseEntry[];
}

/**
 * Type guard para validar si un objeto tiene stockByWarehouse válido.
 */
export function hasStockByWarehouse(
  obj: unknown
): obj is WithStockByWarehouse {
  return (
    !!obj &&
    typeof obj === "object" &&
    Array.isArray((obj as WithStockByWarehouse).stockByWarehouse) &&
    (obj as WithStockByWarehouse).stockByWarehouse.every(
      (entry) =>
        typeof entry.warehouse === "string" &&
        typeof entry.quantity === "number"
    )
  );
}

export interface MenuCatalog {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  recipe: {
    product: string | { _id: string; name: string }; // puede venir solo el ID o el objeto poblado
    productName: string;
    quantity: number;
  }[];
  categoryId?: { _id: string; name: string }; // 👈 tipo poblado opcional
  subcategoryId?: { _id: string; name: string }; // 👈 tipo poblado opcional
  companyId: string;
  venueId?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

  
  export interface RecipeItem {
    product: string;         // ID del producto (insumo)
    productName: string;     // Nombre del producto en el momento
    quantity: number;        // Cantidad utilizada
  }
  
  export interface MenuCatalogInput {
    name: string;
    description?: string;
    category: string;
    subcategory: string;
    price: number;
    cost?: number;
    image?: string;
    recipe: RecipeItem[];
    status?: 'active' | 'inactive';
  }
  
export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export interface CreateCatalogItemDto {
  name: string;
  description?: string;
  price: number;
  available?: boolean;
}

export type Section = {
  id: string;
  name: string;
  icon?: string;
  created_at?: string;
};

export type Product = {
  id: string;
  section_id: string;
  name: string;
  brand_id?: string | null;
  image_url?: string | null;
  created_at?: string;
};

export type Brand = {
  id: string;
  name: string;
  created_at?: string;
};

export type Variant = {
  id: string;
  product_id: string;
  label: string;
  retail_price: number;
  wholesale_price?: number | null;
  box_price?: number | null;
  box_quantity?: number | null;
  image_url?: string | null;
  created_at?: string;
};

export type CartItem = {
  variantId: string;
  productName: string;
  variantLabel: string;
  retailPrice: number;
  quantity: number;
};

export type KioskData = {
  sections: Section[];
  products: Product[];
  variants: Variant[];
};

export type InvoiceItem = {
  product_name: string;
  variant_label: string;
  retail_price: number;
  quantity: number;
};

export type Invoice = {
  id: string;
  customer_name?: string | null;
  items: InvoiceItem[];
  item_count: number;
  subtotal: number;
  cash_received: number;
  change_due: number;
  created_at?: string;
};

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
  price: number;
  created_at?: string;
};

export type CartItem = {
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
};

export type KioskData = {
  sections: Section[];
  products: Product[];
  variants: Variant[];
};

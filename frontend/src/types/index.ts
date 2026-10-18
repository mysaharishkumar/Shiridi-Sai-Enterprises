export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  street_address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin' | 'product_manager' | 'order_manager';
  is_active: boolean;
  addresses?: Address[];
  created_at: string;
  updated_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Subcategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  subcategories: Subcategory[];
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary: boolean;
  public_id?: string;
  color?: string;
}

export interface ProductColor {
  name: string;
  hex_code?: string;
  image_url?: string;
  images?: string[];
}

export interface ProductVariant {
  variant_id: string;
  sku?: string;
  color?: string;
  dimensions?: string;
  price_override?: number;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  selling_price: number;
  original_price?: number;
  discount_percentage?: number;
  sku?: string;
  brand?: string;
  material?: string;
  finish?: string;
  dimensions?: ProductDimensions;
  weight?: string;
  total_stock: number;
  in_stock: boolean;
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  features: string[];
  warranty_info?: string;
  assembly_required: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_special_offer: boolean;
  is_published: boolean;
  is_archived: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge_text?: string;
  image_url: string;
  mobile_image_url?: string;
  cta_text?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  item_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_slug: string;
  color?: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
  in_stock: boolean;
  available_stock: number;
}

export interface Cart {
  id?: string;
  user_id?: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  delivery_charge: number;
  free_delivery_threshold: number;
  free_delivery_remaining: number;
  discount: number;
  final_total: number;
  updated_at?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed_delivery';
export type PaymentStatus = 'pending' | 'collected' | 'refunded' | 'failed';

export interface OrderItemSnapshot {
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_slug: string;
  color?: string;
  sku?: string;
  unit_price: number;
  original_price?: number;
  quantity: number;
  item_total: number;
  image_url?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  updated_by: string;
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  delivery_instructions?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  final_total: number;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  status_history: StatusHistoryEntry[];
  tracking_number?: string;
  courier_partner?: string;
  estimated_delivery_date?: string;
  can_cancel?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  id?: string;
  store_name: string;
  tagline: string;
  logo_url?: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  address: string;
  google_maps_url?: string;
  currency_symbol: string;
  currency_code: string;
  standard_delivery_fee: number;
  free_delivery_threshold: number;
  cod_enabled: boolean;
  announcement_enabled: boolean;
  announcement_text: string;
  about_us: string;
  delivery_info: string;
  return_policy: string;
  privacy_policy: string;
  terms_and_conditions: string;
  social_links: SocialLink[];
  updated_at?: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface AdminKPIs {
  total_products: number;
  total_categories: number;
  total_customers: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_order_value: number;
  collected_revenue: number;
}

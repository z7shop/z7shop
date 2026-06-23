export interface Product {
  id: string;
  name_fa: string;
  name_en: string;
  description_fa: string;
  description_en: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  sizes: string;
  colors: string;
  images: string;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_fa: string;
  name_en: string;
  slug: string;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address_id: string;
  shipping_method: string;
  coupon_code: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  is_default: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_discount: number;
  min_order: number;
  is_active: boolean;
  expires_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  department: string;
  priority: 'low' | 'normal' | 'high';
  status: 'open' | 'answered' | 'closed';
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count?: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user_name?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  ref_number: string;
  card_number: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title_fa: string;
  title_en: string;
  message_fa: string;
  message_en: string;
  link: string;
  is_read: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title_fa: string;
  title_en: string;
  slug: string;
  excerpt_fa: string;
  excerpt_en: string;
  content_fa: string;
  content_en: string;
  cover_image: string;
  author_id: string;
  author_name?: string;
  tags: string;
  is_published: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPoint {
  id: string;
  user_id: string;
  points: number;
  type: 'earn' | 'spend';
  description_fa: string;
  description_en: string;
  order_id: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  badge_fa: string;
  badge_en: string;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  cta_fa: string;
  cta_en: string;
  cta_link: string;
  gradient: string;
  accent_color: string;
  image: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  email: string;
  user_id: string | null;
  notified: number;
  created_at: string;
}

export interface Bundle {
  id: string;
  name_fa: string;
  name_en: string;
  description_fa: string;
  description_en: string;
  discount_percent: number;
  image: string;
  is_active: number;
  created_at: string;
  products?: Product[];
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  user_name?: string;
  created_at: string;
}

export interface CouponCheckResult {
  valid: boolean;
  discount_percent?: number;
  max_discount?: number;
  min_order?: number;
}

export type Locale = 'fa' | 'en';

export interface Dictionary {
  [key: string]: string | Dictionary;
}

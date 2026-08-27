export type Role = "ADMIN" | "SUPER_ADMIN" | "STAFF" | "CONTENT_MANAGER" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DescriptionSection {
  title: string;
  items: string[];
}

export interface DescriptionSections {
  color: string;
  sections: DescriptionSection[];
  note: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: ProductImage[];
  categories: Category[];
  categoryId?: string;
  variants?: ProductVariant[];
  descriptionSections?: DescriptionSections;
  fabric?: string;
  careInstructions?: string[];
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  parentId?: string;
  parent?: Category;
  subcategories?: Category[];
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  productCount?: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  codFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  internalNotes?: string;
  statusHistory: OrderStatusEntry[];
  validTransitions?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "quality_check"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface OrderItem {
  id: string;
  product: Product;
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderStatusEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  addresses: Address[];
  notes?: string;
  createdAt: string;
  lastOrderAt?: string;
}

export interface Address {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  sortOrder: number;
  type: "hero" | "editorial" | "announcement";
  createdAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerImage?: string;
  content: string;
  rating: number;
  type: "gallery" | "video" | "instagram" | "story";
  image?: string;
  videoUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email?: string;
  hours: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full_time" | "part_time" | "contract" | "internship";
  description: string;
  requirements: string[];
  salary?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  reference?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  product: Product;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  images?: string[];
  createdAt: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
}

export interface SiteSettings {
  brandName: string;
  brandDescription: string;
  logo: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shippingCost: number;
  freeShippingThreshold: number;
  codFee: number;
  returnWindowDays: number;
  exchangeWindowDays: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  seoDefaults: {
    metaTitle: string;
    metaDescription: string;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  categoryPerformance: { name: string; products: number; revenue: number }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; lowStockThreshold: number }[];
}

export interface DashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  revenueChart: { date: string; revenue: number }[];
  ordersChart: { date: string; orders: number }[];
  customerGrowth: { date: string; customers: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  categoryPerformance: { name: string; products: number; revenue: number }[];
  recentOrders: Order[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; lowStockThreshold: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    { resource: "all", actions: ["create", "read", "update", "delete"] },
  ],
  ADMIN: [
    { resource: "products", actions: ["create", "read", "update", "delete"] },
    { resource: "categories", actions: ["create", "read", "update", "delete"] },
    { resource: "orders", actions: ["read", "update"] },
    { resource: "customers", actions: ["read", "update"] },
    { resource: "coupons", actions: ["create", "read", "update", "delete"] },
    { resource: "payments", actions: ["read", "update"] },
    { resource: "reviews", actions: ["read", "update", "delete"] },
    { resource: "settings", actions: ["read", "update"] },
    { resource: "analytics", actions: ["read"] },
  ],
  STAFF: [
    { resource: "products", actions: ["read", "update"] },
    { resource: "orders", actions: ["read", "update"] },
    { resource: "customers", actions: ["read"] },
    { resource: "reviews", actions: ["read"] },
  ],
  CONTENT_MANAGER: [
    { resource: "products", actions: ["read"] },
    { resource: "categories", actions: ["read", "update"] },
    { resource: "content", actions: ["create", "read", "update", "delete"] },
    { resource: "reviews", actions: ["read", "update"] },
  ],
  CUSTOMER: [
    { resource: "orders", actions: ["read", "create"] },
  ],
};

export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PAID' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type DeliveryType = 'HOME_DELIVERY' | 'AGENT_PICKUP';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
  seller?: SellerBrief;
}

export interface SellerBrief {
  id: string;
  storeName: string;
  approved: boolean;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  approved: boolean;
  revenue: number;
  createdAt: string;
  user?: Pick<User, 'email' | 'firstName' | 'lastName' | 'phone'>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  featured: boolean;
}

export interface Inventory {
  id: string;
  productId: string;
  sku: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantitySold: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  featured: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  category?: Category;
  seller?: Pick<Seller, 'id' | 'storeName' | 'description' | 'logo'>;
  inventory?: Inventory;
}

export interface AgentLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Pick<Product, 'name' | 'images' | 'price'>;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: PaymentStatus;
  reference?: string;
  amount: number;
  phone: string;
  paidAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  agentLocationId?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  payment?: Payment;
  agentLocation?: AgentLocation;
  customer?: Pick<User, 'email' | 'firstName' | 'lastName' | 'phone'>;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SellerDashboard {
  seller: Seller;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
  };
  lowStockProducts: Product[];
}

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalSellers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
  };
  ordersByStatus: Array<{ status: OrderStatus; _count: number }>;
  recentOrders: Order[];
}

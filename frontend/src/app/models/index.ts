export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: Role;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  unit?: string;
  price: number;
  unitCost?: number;
  costPrice?: number;
  reorderLevel?: number;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE';

export interface Warehouse {
  id: number;
  code?: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  contactPerson?: string;
  contactNumber: string;
  email?: string;
  capacity: number;
  status: WarehouseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inventory {
  id: number;
  product?: Product;
  productId?: number;
  warehouse?: Warehouse;
  warehouseId?: number;
  quantity: number;
  reservedQuantity: number;
  reorderLevel?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id?: number;
  product?: Product;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer?: Customer;
  customerId?: number;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  orderItems: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  paymentTerms?: string;
  status: SupplierStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseOrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ORDERED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: number;
  product?: Product | { id: number; name?: string; sku?: string };
  productId?: number;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: number;
  purchaseOrderNumber: string;
  supplier?: Supplier;
  supplierId?: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes?: string;
  purchaseOrderItems: PurchaseOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

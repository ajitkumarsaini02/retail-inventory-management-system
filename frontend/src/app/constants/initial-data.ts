import { Product, Warehouse, Inventory, Customer, Order, Supplier, PurchaseOrder, User } from '../models';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 5, name: 'Dell Inspiron 15 Laptop', sku: 'PROD-ELEC-001', category: 'Electronics', brand: 'Dell', price: 749.99, unitCost: 620, reorderLevel: 10, status: 'ACTIVE' },
  { id: 6, name: 'Logitech MX Master 3S Mouse', sku: 'PROD-ELEC-002', category: 'Accessories', brand: 'Logitech', price: 99.99, unitCost: 72, reorderLevel: 20, status: 'ACTIVE' },
  { id: 7, name: 'Sony WH-1000XM5 Headphones', sku: 'PROD-ELEC-003', category: 'Audio', brand: 'Sony', price: 399.99, unitCost: 310, reorderLevel: 10, status: 'ACTIVE' },
  { id: 8, name: 'Samsung 27-inch 4K Monitor', sku: 'PROD-ELEC-004', category: 'Displays', brand: 'Samsung', price: 299.99, unitCost: 235, reorderLevel: 8, status: 'ACTIVE' },
  { id: 9, name: 'Ergonomic Mesh Office Chair', sku: 'PROD-OFF-005', category: 'Furniture', brand: 'Herman Miller', price: 189.50, unitCost: 130, reorderLevel: 10, status: 'ACTIVE' },
  { id: 10, name: 'Motorized Standing Desk', sku: 'PROD-OFF-006', category: 'Furniture', brand: 'Fully', price: 449.00, unitCost: 340, reorderLevel: 5, status: 'ACTIVE' },
  { id: 11, name: 'TP-Link WiFi 6 Gigabit Router', sku: 'PROD-NET-007', category: 'Networking', brand: 'TP-Link', price: 79.99, unitCost: 55, reorderLevel: 12, status: 'ACTIVE' },
  { id: 12, name: 'SanDisk 1TB Portable SSD', sku: 'PROD-STO-008', category: 'Storage', brand: 'SanDisk', price: 119.99, unitCost: 85, reorderLevel: 10, status: 'ACTIVE' },
  { id: 13, name: 'Apple iPad Air M2', sku: 'PROD-TAB-009', category: 'Electronics', brand: 'Apple', price: 599.00, unitCost: 490, reorderLevel: 8, status: 'ACTIVE' },
  { id: 14, name: 'Keychron Q1 Pro Mechanical Keyboard', sku: 'PROD-ACC-010', category: 'Accessories', brand: 'Keychron', price: 199.00, unitCost: 140, reorderLevel: 15, status: 'ACTIVE' },
  { id: 15, name: 'Anker 737 Power Bank 140W', sku: 'PROD-PWR-011', category: 'Accessories', brand: 'Anker', price: 149.99, unitCost: 95, reorderLevel: 12, status: 'ACTIVE' },
  { id: 16, name: 'Bose QuietComfort Ultra Earbuds', sku: 'PROD-AUD-012', category: 'Audio', brand: 'Bose', price: 299.00, unitCost: 210, reorderLevel: 10, status: 'ACTIVE' }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 2, code: 'WH-DEL-01', name: 'Delhi Northern Distribution Hub', city: 'New Delhi', state: 'Delhi', address: 'Khasra 45, NH-8, Kapashera', capacity: 50000, contactPerson: 'Vikram Joshi', contactNumber: '+91-9811001122', status: 'ACTIVE' },
  { id: 3, code: 'WH-BLR-02', name: 'Bangalore Southern Tech Logistics', city: 'Bengaluru', state: 'Karnataka', address: 'Plot 12B, Electronic City Phase 1', capacity: 75000, contactPerson: 'Priya Nair', contactNumber: '+91-9845012345', status: 'ACTIVE' },
  { id: 4, code: 'WH-BOM-03', name: 'Mumbai Western Fulfillment Center', city: 'Mumbai', state: 'Maharashtra', address: 'Bhiwandi Logistics Park, Sector 4', capacity: 60000, contactPerson: 'Rohan Mehta', contactNumber: '+91-9820055443', status: 'ACTIVE' },
  { id: 5, code: 'WH-CCU-04', name: 'Kolkata Eastern Regional Depot', city: 'Kolkata', state: 'West Bengal', address: 'Dankuni Industrial Zone, NH-2', capacity: 35000, contactPerson: 'Sourav Ganguly', contactNumber: '+91-9830099887', status: 'ACTIVE' }
];

export const INITIAL_INVENTORY: Inventory[] = [
  { id: 2, productId: 5, product: INITIAL_PRODUCTS[0], warehouseId: 2, warehouse: INITIAL_WAREHOUSES[0], quantity: 120, reservedQuantity: 15, reorderLevel: 20 },
  { id: 3, productId: 6, product: INITIAL_PRODUCTS[1], warehouseId: 3, warehouse: INITIAL_WAREHOUSES[1], quantity: 95, reservedQuantity: 10, reorderLevel: 15 },
  { id: 4, productId: 7, product: INITIAL_PRODUCTS[2], warehouseId: 4, warehouse: INITIAL_WAREHOUSES[2], quantity: 60, reservedQuantity: 8, reorderLevel: 10 },
  { id: 5, productId: 8, product: INITIAL_PRODUCTS[3], warehouseId: 2, warehouse: INITIAL_WAREHOUSES[0], quantity: 54, reservedQuantity: 5, reorderLevel: 60 },
  { id: 6, productId: 9, product: INITIAL_PRODUCTS[4], warehouseId: 3, warehouse: INITIAL_WAREHOUSES[1], quantity: 45, reservedQuantity: 4, reorderLevel: 50 },
  { id: 7, productId: 10, product: INITIAL_PRODUCTS[5], warehouseId: 4, warehouse: INITIAL_WAREHOUSES[2], quantity: 35, reservedQuantity: 2, reorderLevel: 40 },
  { id: 8, productId: 11, product: INITIAL_PRODUCTS[6], warehouseId: 5, warehouse: INITIAL_WAREHOUSES[3], quantity: 10, reservedQuantity: 0, reorderLevel: 15 }
];
export const INITIAL_INVENTORIES = INITIAL_INVENTORY;

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 3, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9876543210', address: 'Flat 402, Green Valley', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', country: 'India' },
  { id: 4, name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '+91-9830112244', address: '15B Southern Avenue', city: 'Kolkata', state: 'West Bengal', pincode: '700029', country: 'India' },
  { id: 5, name: 'Rajesh Patel', email: 'rajesh.patel@gmail.com', phone: '+91-9820556677', address: 'B-304, Palm Beach', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', country: 'India' },
  { id: 6, name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91-9849001122', address: 'Plot 88, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', country: 'India' },
  { id: 7, name: 'Arjun Kapoor', email: 'arjun.kapoor@gmail.com', phone: '+91-9811443322', address: '12, Golf Links Road', city: 'New Delhi', state: 'Delhi', pincode: '110003', country: 'India' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 2,
    orderNumber: 'ORD-2026-101',
    customer: INITIAL_CUSTOMERS[0],
    customerId: 3,
    orderDate: '2026-10-01T10:15:00.000Z',
    status: 'DELIVERED',
    totalAmount: 849.98,
    shippingAddress: 'Flat 402, Green Valley, Noida',
    orderItems: [
      { id: 1, productId: 5, product: INITIAL_PRODUCTS[0], quantity: 1, unitPrice: 749.99, totalPrice: 749.99 },
      { id: 2, productId: 6, product: INITIAL_PRODUCTS[1], quantity: 1, unitPrice: 99.99, totalPrice: 99.99 }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD-2026-102',
    customer: INITIAL_CUSTOMERS[1],
    customerId: 4,
    orderDate: '2026-10-01T11:20:00.000Z',
    status: 'DELIVERED',
    totalAmount: 399.99,
    shippingAddress: '15B Southern Avenue, Kolkata',
    orderItems: [
      { id: 3, productId: 7, product: INITIAL_PRODUCTS[2], quantity: 1, unitPrice: 399.99, totalPrice: 399.99 }
    ]
  },
  {
    id: 4,
    orderNumber: 'ORD-2026-103',
    customer: INITIAL_CUSTOMERS[2],
    customerId: 5,
    orderDate: '2026-10-01T11:45:00.000Z',
    status: 'DELIVERED',
    totalAmount: 789.48,
    shippingAddress: 'B-304, Palm Beach Heights, Navi Mumbai',
    orderItems: [
      { id: 4, productId: 5, product: INITIAL_PRODUCTS[0], quantity: 1, unitPrice: 749.99, totalPrice: 749.99 },
      { id: 5, productId: 8, product: INITIAL_PRODUCTS[3], quantity: 1, unitPrice: 39.49, totalPrice: 39.49 }
    ]
  },
  {
    id: 5,
    orderNumber: 'ORD-2026-104',
    customer: INITIAL_CUSTOMERS[3],
    customerId: 6,
    orderDate: '2026-10-01T12:05:00.000Z',
    status: 'DELIVERED',
    totalAmount: 199.98,
    shippingAddress: 'Plot 88, Jubilee Hills Road 36, Hyderabad',
    orderItems: [
      { id: 6, productId: 6, product: INITIAL_PRODUCTS[1], quantity: 2, unitPrice: 99.99, totalPrice: 199.98 }
    ]
  },
  {
    id: 6,
    orderNumber: 'ORD-2026-105',
    customer: INITIAL_CUSTOMERS[4],
    customerId: 7,
    orderDate: '2026-10-01T12:30:00.000Z',
    status: 'DELIVERED',
    totalAmount: 449.00,
    shippingAddress: '12, Golf Links Road, New Delhi',
    orderItems: [
      { id: 7, productId: 10, product: INITIAL_PRODUCTS[5], quantity: 1, unitPrice: 449.00, totalPrice: 449.00 }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 2, name: 'Apex Electronics Components Ltd', contactPerson: 'Amit Verma', email: 'sales@apextech.com', phone: '+91-9811223344', address: 'Sector 62, Electronic City', city: 'Gurgaon', state: 'Haryana', status: 'ACTIVE' },
  { id: 3, name: 'Nexus Global Hardware Supplies', contactPerson: 'Sunita Deshmukh', email: 'orders@nexusglobal.com', phone: '+91-9820112233', address: 'Andheri MIDC, Cross Road 5', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 4, name: 'Zenith Consumer Goods Corp', contactPerson: 'Karan Johar', email: 'contact@zenithgoods.in', phone: '+91-9844001122', address: 'Whitefield Main Road', city: 'Bengaluru', state: 'Karnataka', status: 'ACTIVE' },
  { id: 5, name: 'OmniTrade Supply Logistics', contactPerson: 'Priya Mehra', email: 'info@omnitrade.in', phone: '+91-9810554433', address: 'Connaught Place, Block B', city: 'New Delhi', state: 'Delhi', status: 'ACTIVE' },
  { id: 6, name: 'Quantum Core Technologies', contactPerson: 'Vikram Singh', email: 'support@quantumcore.com', phone: '+91-9822445566', address: 'Hinjawadi Phase 1', city: 'Pune', state: 'Maharashtra', status: 'ACTIVE' }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 2, purchaseOrderNumber: 'PO-2026-001', supplier: INITIAL_SUPPLIERS[0], supplierId: 2, orderDate: '2026-09-28T09:00:00.000Z', expectedDeliveryDate: '2026-10-05T00:00:00.000Z', status: 'RECEIVED', totalAmount: 8360.00, purchaseOrderItems: [] },
  { id: 3, purchaseOrderNumber: 'PO-2026-002', supplier: INITIAL_SUPPLIERS[1], supplierId: 3, orderDate: '2026-09-29T10:30:00.000Z', expectedDeliveryDate: '2026-10-08T00:00:00.000Z', status: 'ORDERED', totalAmount: 4650.00, purchaseOrderItems: [] },
  { id: 4, purchaseOrderNumber: 'PO-2026-003', supplier: INITIAL_SUPPLIERS[2], supplierId: 4, orderDate: '2026-09-30T14:15:00.000Z', expectedDeliveryDate: '2026-10-10T00:00:00.000Z', status: 'APPROVED', totalAmount: 2350.00, purchaseOrderItems: [] },
  { id: 5, purchaseOrderNumber: 'PO-2026-004', supplier: INITIAL_SUPPLIERS[3], supplierId: 5, orderDate: '2026-10-01T08:45:00.000Z', expectedDeliveryDate: '2026-10-12T00:00:00.000Z', status: 'PENDING', totalAmount: 1560.00, purchaseOrderItems: [] }
];

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Ajit Kumar', email: 'ajit@retailerp.com', role: 'ADMIN', enabled: true, createdAt: '2026-09-29T00:00:00.000Z' },
  { id: 2, name: 'Akash', email: 'akash@retailerp.com', role: 'ADMIN', enabled: true, createdAt: '2026-09-29T00:00:00.000Z' },
  { id: 3, name: 'Store Operator (Pooja)', email: 'operator@retailerp.com', role: 'USER', enabled: true, createdAt: '2026-09-30T00:00:00.000Z' }
];

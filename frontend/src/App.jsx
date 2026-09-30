import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/Dashboard';

// Products
import Products from './pages/products/Products';
import AddProduct from './pages/products/AddProduct';
import EditProduct from './pages/products/EditProduct';

// Warehouses
import Warehouses from './pages/warehouses/Warehouses';
import AddWarehouse from './pages/warehouses/AddWarehouse';
import EditWarehouse from './pages/warehouses/EditWarehouse';

// Customers
import Customers from './pages/customers/Customers';
import AddCustomer from './pages/customers/AddCustomer';
import EditCustomer from './pages/customers/EditCustomer';

// Inventory
import Inventory from './pages/inventory/Inventory';

// Orders
import Orders from './pages/orders/Orders';
import AddOrder from './pages/orders/AddOrder';
import OrderDetails from './pages/orders/OrderDetails';

// Suppliers (Admin only)
import Suppliers from './pages/suppliers/Suppliers';
import AddSupplier from './pages/suppliers/AddSupplier';
import EditSupplier from './pages/suppliers/EditSupplier';

// Purchase Orders (Admin only)
import PurchaseOrders from './pages/purchase-orders/PurchaseOrders';
import AddPurchaseOrder from './pages/purchase-orders/AddPurchaseOrder';
import PurchaseOrderDetails from './pages/purchase-orders/PurchaseOrderDetails';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Main Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Products */}
            <Route path="/products" element={<Products />} />
            <Route
              path="/products/add"
              element={
                <ProtectedRoute requireAdmin>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* Warehouses */}
            <Route path="/warehouses" element={<Warehouses />} />
            <Route
              path="/warehouses/add"
              element={
                <ProtectedRoute requireAdmin>
                  <AddWarehouse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouses/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EditWarehouse />
                </ProtectedRoute>
              }
            />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />
            <Route
              path="/customers/add"
              element={
                <ProtectedRoute requireAdmin>
                  <AddCustomer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EditCustomer />
                </ProtectedRoute>
              }
            />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />

            {/* Orders */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/add" element={<AddOrder />} />
            <Route path="/orders/:id" element={<OrderDetails />} />

            {/* Suppliers (Admin only) */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute requireAdmin>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/add"
              element={
                <ProtectedRoute requireAdmin>
                  <AddSupplier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EditSupplier />
                </ProtectedRoute>
              }
            />

            {/* Purchase Orders (Admin only) */}
            <Route
              path="/purchase-orders"
              element={
                <ProtectedRoute requireAdmin>
                  <PurchaseOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders/add"
              element={
                <ProtectedRoute requireAdmin>
                  <AddPurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <PurchaseOrderDetails />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all Wildcard Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

export default App;

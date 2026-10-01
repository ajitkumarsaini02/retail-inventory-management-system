import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './pages/dashboards/dashboard/dashboard.component';
import { AdminDashboardComponent } from './pages/dashboards/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/dashboards/user-dashboard/user-dashboard.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { WarehouseListComponent } from './pages/warehouses/warehouse-list/warehouse-list.component';
import { WarehouseFormComponent } from './pages/warehouses/warehouse-form/warehouse-form.component';
import { InventoryListComponent } from './pages/inventory/inventory-list/inventory-list.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';
import { OrderFormComponent } from './pages/orders/order-form/order-form.component';
import { OrderDetailComponent } from './pages/orders/order-detail/order-detail.component';
import { CustomerListComponent } from './pages/customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './pages/customers/customer-form/customer-form.component';
import { SupplierListComponent } from './pages/suppliers/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './pages/suppliers/supplier-form/supplier-form.component';
import { PurchaseOrderListComponent } from './pages/purchase-orders/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './pages/purchase-orders/purchase-order-form/purchase-order-form.component';
import { PurchaseOrderDetailComponent } from './pages/purchase-orders/purchase-order-detail/purchase-order-detail.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
      { path: 'dashboard/user', component: UserDashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/add', component: ProductFormComponent, canActivate: [adminGuard] },
      { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [adminGuard] },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'warehouses', component: WarehouseListComponent },
      { path: 'warehouses/add', component: WarehouseFormComponent, canActivate: [adminGuard] },
      { path: 'warehouses/edit/:id', component: WarehouseFormComponent, canActivate: [adminGuard] },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/add', component: OrderFormComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'customers/add', component: CustomerFormComponent },
      { path: 'customers/edit/:id', component: CustomerFormComponent },
      { path: 'suppliers', component: SupplierListComponent, canActivate: [adminGuard] },
      { path: 'suppliers/add', component: SupplierFormComponent, canActivate: [adminGuard] },
      { path: 'suppliers/edit/:id', component: SupplierFormComponent, canActivate: [adminGuard] },
      { path: 'purchase-orders', component: PurchaseOrderListComponent, canActivate: [adminGuard] },
      { path: 'purchase-orders/add', component: PurchaseOrderFormComponent, canActivate: [adminGuard] },
      { path: 'purchase-orders/:id', component: PurchaseOrderDetailComponent, canActivate: [adminGuard] },
      { path: 'users', component: UserListComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

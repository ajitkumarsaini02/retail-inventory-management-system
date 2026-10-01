import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InventoryService } from './inventory.service';
import { OrderService } from './order.service';
import { PurchaseOrderService } from './purchase-order.service';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  type: 'stock' | 'order' | 'po' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private inventoryService = inject(InventoryService);
  private orderService = inject(OrderService);
  private poService = inject(PurchaseOrderService);
  private authService = inject(AuthService);

  private readonly STORAGE_KEY = 'rims_read_notifications';

  notifications = signal<AppNotification[]>([]);
  isLoading = signal<boolean>(false);

  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  constructor() {
    this.refresh();
  }

  private getReadIds(): Set<string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  }

  private saveReadIds(readIds: Set<string>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(readIds)));
    } catch {
      // Ignore localStorage errors
    }
  }

  refresh(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isLoading.set(true);
    const readIds = this.getReadIds();

    forkJoin({
      inventories: this.inventoryService.getAllInventory().pipe(catchError(() => of([]))),
      orders: this.orderService.getAllOrders().pipe(catchError(() => of([]))),
      pos: this.poService.getAllPurchaseOrders().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ inventories, orders, pos }) => {
        const list: AppNotification[] = [];

        // 1. Check Low Stock Items
        for (const item of inventories) {
          const available = item.quantity - (item.reservedQuantity || 0);
          const threshold = item.reorderLevel ?? item.product?.reorderLevel ?? 10;
          if (available <= threshold) {
            const notifId = `stock-${item.id}`;
            list.push({
              id: notifId,
              type: 'stock',
              title: `Low Stock: ${item.product?.name || 'SKU ' + (item.productId || '')}`,
              message: `${available} units left in ${item.warehouse?.name || 'Warehouse'} (Threshold: ${threshold})`,
              time: 'Stock Alert',
              read: readIds.has(notifId),
              link: '/inventory',
              severity: available <= 0 ? 'critical' : 'warning'
            });
          }
        }

        // 2. Check Pending Orders
        for (const order of orders) {
          if (order.status === 'PENDING') {
            const notifId = `order-${order.id}`;
            list.push({
              id: notifId,
              type: 'order',
              title: `New Order: #${order.orderNumber}`,
              message: `Order total $${(order.totalAmount || 0).toLocaleString()} awaiting processing`,
              time: 'Pending Order',
              read: readIds.has(notifId),
              link: `/orders/${order.id}`,
              severity: 'info'
            });
          }
        }

        // 3. Check Pending Purchase Orders (Admin)
        if (this.authService.isAdmin()) {
          for (const po of pos) {
            if (po.status === 'PENDING' || po.status === 'ORDERED') {
              const notifId = `po-${po.id}`;
              list.push({
                id: notifId,
                type: 'po',
                title: `PO #${po.purchaseOrderNumber || po.id}: ${po.status}`,
                message: `Supplier ${po.supplier?.name || 'Vendor'} ($${(po.totalAmount || 0).toLocaleString()})`,
                time: 'Procurement',
                read: readIds.has(notifId),
                link: `/purchase-orders/${po.id}`,
                severity: po.status === 'PENDING' ? 'warning' : 'info'
              });
            }
          }
        }

        // Fallback default message if list is completely empty
        if (list.length === 0) {
          const notifId = 'system-online';
          list.push({
            id: notifId,
            type: 'system',
            title: 'System Synced & Healthy',
            message: 'All inventory levels, orders, and warehouses are operating smoothly.',
            time: 'Live',
            read: readIds.has(notifId),
            link: '/dashboard',
            severity: 'success'
          });
        }

        this.notifications.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: string): void {
    const readIds = this.getReadIds();
    readIds.add(id);
    this.saveReadIds(readIds);

    this.notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    const readIds = this.getReadIds();
    const current = this.notifications();
    current.forEach((n) => readIds.add(n.id));
    this.saveReadIds(readIds);

    this.notifications.update((list) =>
      list.map((n) => ({ ...n, read: true }))
    );
  }
}

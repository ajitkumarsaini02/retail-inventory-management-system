import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS } from '../constants/initial-data';
import { Order, OrderStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${API_BASE_URL}/api/orders`;
  private cache: Order[] = [...INITIAL_ORDERS];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Order[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData.map((o) => {
          const cust = o.customer || INITIAL_CUSTOMERS.find((c) => c.id === o.customerId);
          return { ...o, customer: cust };
        });
      }
    });
  }

  getOrderById(id: number): Observable<Order> {
    const cached = this.cache.find((o) => o.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Order));
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    const cached = this.cache.find((o) => o.orderNumber === orderNumber);
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Order));
  }

  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    const filtered = this.cache.filter((o) => o.status === status);
    return of(filtered);
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    const cust = order.customer || INITIAL_CUSTOMERS.find((c) => c.id === order.customerId);
    const mock: Order = {
      id: Date.now(),
      orderNumber: order.orderNumber || `ORD-2026-${Date.now().toString().slice(-3)}`,
      customer: cust,
      customerId: order.customerId,
      orderDate: order.orderDate || new Date().toISOString(),
      status: order.status || 'CONFIRMED',
      totalAmount: order.totalAmount || 0,
      shippingAddress: order.shippingAddress || 'Store Pickup',
      orderItems: order.orderItems || [],
      ...order
    } as Order;

    this.cache = [mock, ...this.cache];

    return this.http.post<Order>(this.apiUrl, order).pipe(
      tap((newOrder) => {
        this.cache = this.cache.map((o) => (o.id === mock.id ? newOrder : o));
      }),
      catchError(() => of(mock))
    );
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    this.cache = this.cache.map((o) => (o.id === id ? ({ ...o, ...order } as Order) : o));
    const updated = this.cache.find((o) => o.id === id) || (order as Order);

    return this.http.put<Order>(`${this.apiUrl}/${id}`, order).pipe(
      tap((serverOrder) => {
        this.cache = this.cache.map((o) => (o.id === id ? serverOrder : o));
      }),
      catchError(() => of(updated))
    );
  }

  deleteOrder(id: number): Observable<void> {
    this.cache = this.cache.filter((o) => o.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

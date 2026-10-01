import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_PURCHASE_ORDERS, INITIAL_SUPPLIERS } from '../constants/initial-data';
import { PurchaseOrder, PurchaseOrderStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = `${API_BASE_URL}/api/purchase-orders`;
  private cache: PurchaseOrder[] = [...INITIAL_PURCHASE_ORDERS];

  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllPurchaseOrders(): Observable<PurchaseOrder[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<PurchaseOrder[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData.map((po) => {
          const supp = po.supplier || INITIAL_SUPPLIERS.find((s) => s.id === (po.supplierId || po.supplier?.id));
          return { ...po, supplier: supp };
        });
      }
    });
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    const cached = this.cache.find((po) => po.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.cache[0] || ({} as PurchaseOrder)))
    );
  }

  getPurchaseOrderByNumber(poNumber: string): Observable<PurchaseOrder> {
    const cached = this.cache.find((po) => po.purchaseOrderNumber === poNumber);
    if (cached) {
      return of(cached);
    }
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/number/${poNumber}`).pipe(
      catchError(() => of(this.cache[0] || ({} as PurchaseOrder)))
    );
  }

  getPurchaseOrdersByStatus(status: PurchaseOrderStatus): Observable<PurchaseOrder[]> {
    const filtered = this.cache.filter((po) => po.status === status);
    return of(filtered);
  }

  createPurchaseOrder(po: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, po).pipe(
      tap((newPo) => {
        this.cache = [newPo, ...this.cache];
      }),
      catchError(() => {
        const supp = po.supplier || INITIAL_SUPPLIERS.find((s) => s.id === po.supplierId);
        const mock: PurchaseOrder = {
          id: Date.now(),
          purchaseOrderNumber: po.purchaseOrderNumber || `PO-2026-${Date.now().toString().slice(-3)}`,
          supplier: supp,
          supplierId: po.supplierId,
          orderDate: po.orderDate || new Date().toISOString(),
          expectedDeliveryDate: po.expectedDeliveryDate,
          status: po.status || 'PENDING',
          totalAmount: po.totalAmount || 0,
          purchaseOrderItems: po.purchaseOrderItems || [],
          ...po
        } as PurchaseOrder;
        this.cache = [mock, ...this.cache];
        return of(mock);
      })
    );
  }

  updatePurchaseOrder(id: number, po: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}`, po).pipe(
      tap((updated) => {
        this.cache = this.cache.map((p) => (p.id === id ? { ...p, ...updated } : p));
      }),
      catchError(() => {
        this.cache = this.cache.map((p) => (p.id === id ? ({ ...p, ...po } as PurchaseOrder) : p));
        const updated = this.cache.find((p) => p.id === id) || (po as PurchaseOrder);
        return of(updated);
      })
    );
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache = this.cache.filter((p) => p.id !== id);
      }),
      catchError(() => {
        this.cache = this.cache.filter((p) => p.id !== id);
        return of(undefined);
      })
    );
  }
}

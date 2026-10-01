import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_INVENTORY, INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../constants/initial-data';
import { Inventory } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${API_BASE_URL}/api/inventory`;
  private cache: Inventory[] = [...INITIAL_INVENTORY];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<Inventory[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Inventory[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData.map((item) => {
          const prod = item.product || INITIAL_PRODUCTS.find((p) => p.id === (item.productId || item.product?.id));
          const wh = item.warehouse || INITIAL_WAREHOUSES.find((w) => w.id === (item.warehouseId || item.warehouse?.id));
          return { ...item, product: prod, warehouse: wh };
        });
      }
    });
  }

  getInventoryById(id: number): Observable<Inventory> {
    const cached = this.cache.find((i) => i.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Inventory));
  }

  getInventoryByProductId(productId: number): Observable<Inventory[]> {
    const items = this.cache.filter((i) => (i.productId || i.product?.id) === Number(productId));
    return of(items);
  }

  getInventoryByWarehouseId(warehouseId: number): Observable<Inventory[]> {
    const items = this.cache.filter((i) => (i.warehouseId || i.warehouse?.id) === Number(warehouseId));
    return of(items);
  }

  createInventory(inv: Partial<Inventory>): Observable<Inventory> {
    const prod = inv.product || INITIAL_PRODUCTS.find((p) => p.id === inv.productId);
    const wh = inv.warehouse || INITIAL_WAREHOUSES.find((w) => w.id === inv.warehouseId);
    const mock: Inventory = {
      id: Date.now(),
      productId: inv.productId,
      product: prod,
      warehouseId: inv.warehouseId,
      warehouse: wh,
      quantity: inv.quantity || 0,
      reservedQuantity: inv.reservedQuantity || 0,
      reorderLevel: inv.reorderLevel || 10,
      ...inv
    } as Inventory;

    this.cache = [mock, ...this.cache];

    return this.http.post<Inventory>(this.apiUrl, inv).pipe(
      tap((newInv) => {
        this.cache = this.cache.map((i) => (i.id === mock.id ? newInv : i));
      }),
      catchError(() => of(mock))
    );
  }

  updateInventory(id: number, inv: Partial<Inventory>): Observable<Inventory> {
    this.cache = this.cache.map((i) => (i.id === id ? ({ ...i, ...inv } as Inventory) : i));
    const updated = this.cache.find((i) => i.id === id) || (inv as Inventory);

    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, inv).pipe(
      tap((serverInv) => {
        this.cache = this.cache.map((i) => (i.id === id ? serverInv : i));
      }),
      catchError(() => of(updated))
    );
  }

  deleteInventory(id: number): Observable<void> {
    this.cache = this.cache.filter((i) => i.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

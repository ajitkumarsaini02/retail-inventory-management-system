import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_WAREHOUSES } from '../constants/initial-data';
import { Warehouse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = `${API_BASE_URL}/api/warehouses`;
  private cache: Warehouse[] = [...INITIAL_WAREHOUSES];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllWarehouses(): Observable<Warehouse[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Warehouse[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData;
      }
    });
  }

  getWarehouseById(id: number): Observable<Warehouse> {
    const cached = this.cache.find((w) => w.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Warehouse));
  }

  createWarehouse(warehouse: Partial<Warehouse>): Observable<Warehouse> {
    const mock: Warehouse = {
      id: Date.now(),
      name: warehouse.name || 'New Warehouse',
      code: warehouse.code || `WH-${Date.now().toString().slice(-4)}`,
      city: warehouse.city || 'City',
      state: warehouse.state || 'State',
      address: warehouse.address || 'Address',
      capacity: warehouse.capacity || 50000,
      contactNumber: warehouse.contactNumber || '+91-9999999999',
      status: warehouse.status || 'ACTIVE',
      ...warehouse
    } as Warehouse;

    this.cache = [mock, ...this.cache];

    return this.http.post<Warehouse>(this.apiUrl, warehouse).pipe(
      tap((newWh) => {
        this.cache = this.cache.map((w) => (w.id === mock.id ? newWh : w));
      }),
      catchError(() => of(mock))
    );
  }

  updateWarehouse(id: number, warehouse: Partial<Warehouse>): Observable<Warehouse> {
    this.cache = this.cache.map((w) => (w.id === id ? ({ ...w, ...warehouse } as Warehouse) : w));
    const updated = this.cache.find((w) => w.id === id) || (warehouse as Warehouse);

    return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, warehouse).pipe(
      tap((serverWh) => {
        this.cache = this.cache.map((w) => (w.id === id ? serverWh : w));
      }),
      catchError(() => of(updated))
    );
  }

  deleteWarehouse(id: number): Observable<void> {
    this.cache = this.cache.filter((w) => w.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

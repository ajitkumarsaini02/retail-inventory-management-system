import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_SUPPLIERS } from '../constants/initial-data';
import { Supplier } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `${API_BASE_URL}/api/suppliers`;
  private cache: Supplier[] = [...INITIAL_SUPPLIERS];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<Supplier[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Supplier[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData;
      }
    });
  }

  getSupplierById(id: number): Observable<Supplier> {
    const cached = this.cache.find((s) => s.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Supplier));
  }

  createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    const mock: Supplier = {
      id: Date.now(),
      name: supplier.name || 'New Supplier',
      contactPerson: supplier.contactPerson || 'Contact Person',
      email: supplier.email || `supplier-${Date.now()}@example.com`,
      phone: supplier.phone || '+91-9999999999',
      address: supplier.address || 'Address',
      status: supplier.status || 'ACTIVE',
      ...supplier
    } as Supplier;

    this.cache = [mock, ...this.cache];

    return this.http.post<Supplier>(this.apiUrl, supplier).pipe(
      tap((newSupp) => {
        this.cache = this.cache.map((s) => (s.id === mock.id ? newSupp : s));
      }),
      catchError(() => of(mock))
    );
  }

  updateSupplier(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
    this.cache = this.cache.map((s) => (s.id === id ? ({ ...s, ...supplier } as Supplier) : s));
    const updated = this.cache.find((s) => s.id === id) || (supplier as Supplier);

    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier).pipe(
      tap((serverSupp) => {
        this.cache = this.cache.map((s) => (s.id === id ? serverSupp : s));
      }),
      catchError(() => of(updated))
    );
  }

  deleteSupplier(id: number): Observable<void> {
    this.cache = this.cache.filter((s) => s.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

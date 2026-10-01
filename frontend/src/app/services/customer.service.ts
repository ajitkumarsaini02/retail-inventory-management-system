import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_CUSTOMERS } from '../constants/initial-data';
import { Customer } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${API_BASE_URL}/api/customers`;
  private cache: Customer[] = [...INITIAL_CUSTOMERS];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Customer[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData;
      }
    });
  }

  getCustomerById(id: number): Observable<Customer> {
    const cached = this.cache.find((c) => c.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Customer));
  }

  createCustomer(cust: Partial<Customer>): Observable<Customer> {
    const mock: Customer = {
      id: Date.now(),
      name: cust.name || 'New Customer',
      email: cust.email || `customer-${Date.now()}@example.com`,
      phone: cust.phone || '+91-9999999999',
      address: cust.address || 'Address',
      city: cust.city || 'City',
      state: cust.state || 'State',
      pincode: cust.pincode || '110001',
      ...cust
    } as Customer;

    this.cache = [mock, ...this.cache];

    return this.http.post<Customer>(this.apiUrl, cust).pipe(
      tap((newCust) => {
        this.cache = this.cache.map((c) => (c.id === mock.id ? newCust : c));
      }),
      catchError(() => of(mock))
    );
  }

  updateCustomer(id: number, cust: Partial<Customer>): Observable<Customer> {
    this.cache = this.cache.map((c) => (c.id === id ? ({ ...c, ...cust } as Customer) : c));
    const updated = this.cache.find((c) => c.id === id) || (cust as Customer);

    return this.http.put<Customer>(`${this.apiUrl}/${id}`, cust).pipe(
      tap((serverCust) => {
        this.cache = this.cache.map((c) => (c.id === id ? serverCust : c));
      }),
      catchError(() => of(updated))
    );
  }

  deleteCustomer(id: number): Observable<void> {
    this.cache = this.cache.filter((c) => c.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

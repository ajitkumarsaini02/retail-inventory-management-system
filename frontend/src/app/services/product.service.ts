import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_PRODUCTS } from '../constants/initial-data';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${API_BASE_URL}/api/products`;
  private cache: Product[] = [...INITIAL_PRODUCTS];
  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData;
      }
    });
  }

  getProductById(id: number): Observable<Product> {
    const cached = this.cache.find((p) => p.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return of(this.cache[0] || ({} as Product));
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    const mock: Product = {
      id: Date.now(),
      name: product.name || '',
      sku: product.sku || `PROD-${Date.now().toString().slice(-4)}`,
      category: product.category || 'General',
      price: product.price || 0,
      unitCost: product.unitCost || 0,
      reorderLevel: product.reorderLevel || 10,
      status: product.status || 'ACTIVE',
      ...product
    } as Product;

    this.cache = [mock, ...this.cache];

    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap((newProd) => {
        this.cache = this.cache.map((p) => (p.id === mock.id ? newProd : p));
      }),
      catchError(() => of(mock))
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    this.cache = this.cache.map((p) => (p.id === id ? ({ ...p, ...product } as Product) : p));
    const updated = this.cache.find((p) => p.id === id) || (product as Product);

    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap((serverProd) => {
        this.cache = this.cache.map((p) => (p.id === id ? serverProd : p));
      }),
      catchError(() => of(updated))
    );
  }

  deleteProduct(id: number): Observable<void> {
    this.cache = this.cache.filter((p) => p.id !== id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}

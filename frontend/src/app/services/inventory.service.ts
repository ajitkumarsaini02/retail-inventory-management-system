import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants';
import { Inventory } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${API_BASE_URL}/api/inventory`;

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiUrl);
  }

  getInventoryById(id: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
  }

  getInventoryByProductId(productId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.apiUrl}/product/${productId}`);
  }

  getInventoryByWarehouseId(warehouseId: number): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.apiUrl}/warehouse/${warehouseId}`);
  }

  createInventory(inv: Partial<Inventory>): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiUrl, inv);
  }

  updateInventory(id: number, inv: Partial<Inventory>): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, inv);
  }

  deleteInventory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

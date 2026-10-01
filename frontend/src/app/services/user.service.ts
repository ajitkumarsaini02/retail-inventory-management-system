import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../constants';
import { INITIAL_USERS } from '../constants/initial-data';
import { User } from '../models';

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  operatorCount: number;
  activeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/api/users`;
  private cache: User[] = [...INITIAL_USERS];

  private isSyncing = false;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    this.syncWithBackend();
    return of([...this.cache]);
  }

  private syncWithBackend(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.http.get<User[]>(this.apiUrl).pipe(
      catchError(() => of(null))
    ).subscribe((serverData) => {
      this.isSyncing = false;
      if (serverData && serverData.length > 0) {
        this.cache = serverData;
      }
    });
  }

  getUserStats(): Observable<UserStats> {
    const total = this.cache.length;
    const adminCount = this.cache.filter((u) => u.role === 'ADMIN').length;
    const operatorCount = this.cache.filter((u) => u.role === 'USER').length;
    const activeCount = this.cache.filter((u) => u.enabled).length;

    const localStats: UserStats = {
      totalUsers: total,
      adminCount,
      operatorCount,
      activeCount
    };

    return of(localStats);
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      catchError(() => of(this.cache[0]))
    );
  }

  getUserById(id: number): Observable<User> {
    const cached = this.cache.find((u) => u.id === Number(id));
    if (cached) {
      return of(cached);
    }
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(this.cache[0]))
    );
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      tap((updated) => {
        this.cache = this.cache.map((u) => (u.id === id ? { ...u, ...updated } : u));
      }),
      catchError(() => {
        this.cache = this.cache.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u));
        const updated = this.cache.find((u) => u.id === id) || this.cache[0];
        return of(updated);
      })
    );
  }
}

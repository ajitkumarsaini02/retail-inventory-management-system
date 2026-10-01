import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../constants';
import { AuthResponse, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_BASE_URL}/api/auth`;

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  isUser = computed(() => this.currentUser()?.role === 'USER');

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  private restoreSession() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.token.set(res.token);
        const userData: User = {
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role,
          enabled: true,
        };
        this.currentUser.set(userData);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        this.token.set(res.token);
        const userData: User = {
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role,
          enabled: true,
        };
        this.currentUser.set(userData);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }

  toggleRole() {
    const current = this.currentUser();
    if (!current) return;
    const newRole = current.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const updated: User = { ...current, role: newRole };
    this.currentUser.set(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    if (newRole === 'ADMIN') {
      this.router.navigate(['/dashboard'], { queryParams: { view: 'admin' } });
    } else {
      this.router.navigate(['/dashboard'], { queryParams: { view: 'user' } });
    }
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

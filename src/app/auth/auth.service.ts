
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDto } from '../models/login-dto';
import { TokenResponseDto } from '../models/token-response-dto';
import { jwtDecode } from 'jwt-decode'; // Fixed import: Named import
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.capStockManagerApiUrl;
  private rolesSubject = new BehaviorSubject<string[]>([]);
  roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.isLoggedIn()) {
      this.updateRoles();
    }
  }

  login(loginData: LoginDto): Observable<TokenResponseDto> {
    return this.http.post<TokenResponseDto>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('Login successful! Token stored:', response.token);
          this.logTokenDetails(response.token);
          this.updateRoles();
        } else {
          console.error('No token in response');
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('authToken');
        console.log('Logout successful! Token removed from localStorage');
        this.rolesSubject.next([]);
      })
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('Retrieved token:', token ? 'Exists' : 'None');
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const isExpired = this.isTokenExpired(token);
      console.log('Token status:', isExpired ? 'Expired' : 'Valid');
      if (isExpired) {
        localStorage.removeItem('authToken');
        this.rolesSubject.next([]);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

private decodeToken(token: string): any {
    try {
      const payload = jwtDecode(token);
      console.log('decodeToken: Decoded payload:', payload); // New log for debug
      return payload;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const payload = this.decodeToken(token);

    console.log('getRoles: Raw token payload:', payload);

    let roles = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                payload?.role ||
                payload?.roles ||
                [];

    if (typeof roles === 'string') {
      roles = [roles];
    }

    console.log('getRoles: Extracted roles:', roles); // Existing, but emphasize for debug

    return roles;
  }

  private updateRoles() {
    this.rolesSubject.next(this.getRoles());
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    const has = roles.includes(role);
    console.log(`hasRole: Checking for "${role}" in user roles ${roles} - Result: ${has}`); // New debug log
    return has;
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }

  isAdmin(): boolean {
    return this.hasRole('Admin') || this.isSuperAdmin();
  }

  isUser(): boolean {
    return this.hasRole('User') || this.isAdmin();
  }

  private logTokenDetails(token: string): void {
    const payload = this.decodeToken(token);
    console.log('Decoded token payload for testing:', payload);
  }
}
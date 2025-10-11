// src/app/guards/role.guard.ts (New File)
// Explanation: Checks if user has required roles for the route.
// - Usage: In routes, add data: { roles: ['Admin', 'SuperAdmin'] }
// - Redirects to / if unauthorized.
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRoles = this.authService.getRoles();

    const hasRole = expectedRoles.some(role => userRoles.includes(role));
    if (hasRole) {
      return true;
    } else {
      this.router.navigate(['/']); // Redirect to dashboard or unauthorized page
      return false;
    }
  }
}
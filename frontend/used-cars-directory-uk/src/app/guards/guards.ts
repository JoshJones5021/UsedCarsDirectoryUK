import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CarService } from '../services/car.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decodedToken = this.authService.jwtHelper.decodeToken(token);
      if (decodedToken && decodedToken.role === 'admin') {
        return true;
      }
    }
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private carService: CarService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const carId = route.paramMap.get('id');
    if (!carId) {
      this.router.navigate(['/cars']);
      return false;
    }

    return this.carService.getCar(carId).pipe(
      map(car => {
        const currentUser = this.authService.getCurrentUser();
        if (car.current_owner.user_id === currentUser.user_id || currentUser.role === 'admin') {
          return true;
        } else {
          this.router.navigate(['/cars']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/cars']);
        return of(false);
      })
    );
  }
}
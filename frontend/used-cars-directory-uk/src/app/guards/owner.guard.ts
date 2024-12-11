import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CarService } from '../services/car.service';
import { map, catchError } from 'rxjs/operators';

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
        console.log("test", currentUser);
        console.log("car", car); // Add logging to verify the structure of the car object
        if (currentUser && car.current_owner && car.current_owner.user_id === currentUser.user_id) {
          console.log("success", currentUser);
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
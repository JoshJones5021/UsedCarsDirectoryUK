import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css']
})
export class CarDetailComponent implements OnInit {
  car: any;
  ownershipHistory: any[] = [];
  serviceHistory: any[] = [];

  constructor(private route: ActivatedRoute, private carService: CarService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchCarDetails(id);
    }
  }

  fetchCarDetails(id: string): void {
    this.carService.getCar(id).subscribe(
      car => {
        this.car = car;
        this.ownershipHistory = car.owners;
        this.serviceHistory = car.services;
      },
      error => {
        console.error('Error fetching car details:', error);
      }
    );
  }

  navigateToCarList(): void {
    this.router.navigate(['/cars']);
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        localStorage.removeItem('access_token');
      },
      (error: any) => {
        console.error('Error logging out:', error);
      }
    );
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
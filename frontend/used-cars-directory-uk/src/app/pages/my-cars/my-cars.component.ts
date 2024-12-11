import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-cars',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-cars.component.html',
  styleUrls: ['./my-cars.component.css']
})
export class MyCarsComponent implements OnInit {
  cars: any[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  isCarListPage: boolean = false;
  isSearchPage: boolean = false;

  constructor(private carService: CarService, private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkCurrentRoute();
    this.fetchMyCars();
  }

  checkCurrentRoute(): void {
    const currentRoute = this.router.url;
    this.isCarListPage = currentRoute.includes('/cars') && !currentRoute.includes('/cars/');
    this.isSearchPage = currentRoute.includes('/search');
  }

  fetchMyCars(): void {
    this.carService.getMyCars(this.page, this.limit).subscribe(
      response => {
        this.cars = response.cars;
        this.total = response.total;
      },
      error => {
        console.error('Error fetching my cars:', error);
      }
    );
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.fetchMyCars();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchMyCars();
    }
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
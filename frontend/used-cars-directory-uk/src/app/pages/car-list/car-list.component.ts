import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { SearchService } from '../../services/search.service';
import { FilterService } from '../../services/filter.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {
  cars: any[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 36;
  searchQuery: string = '';
  sidebarVisible: boolean = true;
  sortField: string = 'title';
  sortOrder: number = 1;
  currentSearchParams: any = {};

  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private filterService: FilterService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length === 0) {
        this.fetchCars({ page: 1, limit: 36 });
      } else {
        this.sortField = params['sort_field'] || 'title';
        this.sortOrder = params['sort_order'] || 1;
        this.currentSearchParams = { ...params };
        this.fetchCars({ ...params, page: 1, limit: 36 });
      }
    });
  }

  fetchCars(params: any = {}): void {
    const searchParams = {
      ...this.currentSearchParams,
      ...params,
      sort_field: this.sortField,
      sort_order: this.sortOrder
    };
    this.carService.searchCars(searchParams).subscribe(
      response => {
        this.cars = response.cars;
        this.total = response.total;
      },
      error => {
        console.error('Error fetching cars:', error);
      }
    );
  }

  nextPage(): void {
    this.page++;
    this.fetchCars({ page: this.page, limit: this.limit });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchCars({ page: this.page, limit: this.limit });
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSortChange(): void {
    this.fetchCars({ page: 1, limit: this.limit });
  }

  navigateToCarList(): void {
    this.router.navigate(['/cars']);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
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
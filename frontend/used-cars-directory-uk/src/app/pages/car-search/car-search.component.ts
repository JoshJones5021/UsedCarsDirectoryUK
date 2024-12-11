import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CarService } from '../../services/car.service';
import { SearchService } from '../../services/search.service';
import { FilterService } from '../../services/filter.service';
import { AuthService } from '../../services/auth.service';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxSliderModule
  ],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.css']
})
export class CarSearchComponent implements OnInit {
  totalCars: number = 0;
  currentYear: number = new Date().getFullYear();
  filters: any = {
    price_min: 0,
    price_max: 100000,
    mileage_min: 0,
    mileage_max: 300000,
    registration_year_min: 1900,
    registration_year_max: this.currentYear,
    fuel_type: '',
    body_type: '',
    engine: '',
    gearbox: '',
    doors: '',
    seats: '',
    colour: '',
    emission_class: '',
    make: '',
    model: '',
    title: ''
  };
  distinctValues: any = {
    fuel_type: [],
    body_type: [],
    engine: [],
    gearbox: [],
    colour: [],
    emission_class: [],
    make: [],
    model: [],
    doors: [],
    seats: []
  };

  priceOptions: Options = {
    floor: 0,
    ceil: 100000
  };

  mileageOptions: Options = {
    floor: 0,
    ceil: 300000
  };

  yearOptions: Options = {
    floor: 1900,
    ceil: this.currentYear
  };

  private updateTotalCars: boolean = true;

  constructor(
    private carService: CarService,
    private router: Router,
    private http: HttpClient,
    private searchService: SearchService,
    private filterService: FilterService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchDistinctValues();
    this.fetchTotalCars();
  }

  fetchDistinctValues(): void {
    this.filterService.fetchDistinctValues(this.filters, (distinctValues: any) => {
      this.distinctValues = distinctValues;
    });
  }

  fetchTotalCars(): void {
    const searchParams = {
      page: 1,
      limit: 12
    };
    this.carService.searchCars(searchParams).subscribe((response: any) => {
      this.totalCars = response.total;
    });
  }

  onFilterChange(): void {
    const searchParams: any = {
      price_min: this.filters.price_min,
      price_max: this.filters.price_max,
      mileage_min: this.filters.mileage_min,
      mileage_max: this.filters.mileage_max,
      registration_year_min: this.filters.registration_year_min,
      registration_year_max: this.filters.registration_year_max,
      fuel_type: this.filters.fuel_type,
      body_type: this.filters.body_type,
      engine: this.filters.engine,
      gearbox: this.filters.gearbox,
      doors: this.filters.doors,
      seats: this.filters.seats,
      colour: this.filters.colour,
      emission_class: this.filters.emission_class,
      model: this.filters.model
    };
  
    if (this.filters.make && this.filters.model) {
      searchParams.title = `${this.filters.make} ${this.filters.model}`;
      delete searchParams.make;
    } else if (this.filters.make) {
      searchParams.make = this.filters.make;
    }
  
    // Remove empty parameters
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] === '' || searchParams[key] === null) {
        delete searchParams[key];
      }
    });
  
    this.carService.searchCars(searchParams).subscribe((response: any) => {
      if (this.updateTotalCars) {
        this.totalCars = response.total;
      }
  
      this.distinctValues.fuel_type = this.filterService.getDistinctValuesWithCount(response.cars, 'fuel_type');
      this.distinctValues.body_type = this.filterService.getDistinctValuesWithCount(response.cars, 'body_type');
      this.distinctValues.engine = this.filterService.getDistinctValuesWithCount(response.cars, 'engine');
      this.distinctValues.gearbox = this.filterService.getDistinctValuesWithCount(response.cars, 'gearbox');
      this.distinctValues.colour = this.filterService.getDistinctValuesWithCount(response.cars, 'colour');
      this.distinctValues.emission_class = this.filterService.getDistinctValuesWithCount(response.cars, 'emission_class');
      this.distinctValues.doors = this.filterService.getDistinctValuesWithCount(response.cars, 'doors');
      this.distinctValues.seats = this.filterService.getDistinctValuesWithCount(response.cars, 'seats');
      this.distinctValues.make = this.filterService.getDistinctValuesWithCount(response.cars, 'make');
      this.distinctValues.model = this.filterService.getDistinctModelsWithCount(response.cars, this.filters.make);
  
      if (response.total === 0) {
        this.distinctValues.make = [{ value: this.filters.make, count: 0 }];
        this.distinctValues.model = [{ value: this.filters.model, count: 0 }];
      }
    });
  }

  onMakeChange(): void {
    this.resetFiltersExcept(['make']);
    this.filters.model = '';
    this.updateTotalCars = false;
    this.onFilterChange();
    this.updateTotalCars = true;
  }

  fetchDistinctValuesForMake(): void {
    const searchParams: any = {
      make: this.filters.make
    };
  
    // Remove empty parameters
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] === '' || searchParams[key] === null) {
        delete searchParams[key];
      }
    });
  
    this.filterService.fetchDistinctValues(searchParams, (distinctValues: any) => {
      this.distinctValues = distinctValues;
    });
  }

  onModelChange(): void {
    this.resetFiltersExcept(['make', 'model']);
    this.updateTotalCars = false;
    this.onFilterChange();
    this.updateTotalCars = true;
  }

  resetFiltersExcept(exceptions: (keyof typeof this.filters)[]): void {
    const defaultFilters: typeof this.filters = {
      price_min: 0,
      price_max: 100000,
      mileage_min: 0,
      mileage_max: 300000,
      registration_year_min: 1900,
      registration_year_max: this.currentYear,
      fuel_type: '',
      body_type: '',
      engine: '',
      gearbox: '',
      doors: '',
      seats: '',
      colour: '',
      emission_class: '',
      make: '',
      model: '',
      title: ''
    };
    (Object.keys(defaultFilters) as (keyof typeof this.filters)[]).forEach(key => {
      if (!exceptions.includes(key)) {
        this.filters[key] = defaultFilters[key];
      }
    });
  }

  onSearch(): void {
    const searchParams: any = { ...this.filters };
  
    if (this.filters.make && this.filters.model) {
      searchParams.title = `${this.filters.make} ${this.filters.model}`;
      delete searchParams.make;
      delete searchParams.model;
    } else if (this.filters.make) {
      searchParams.make = this.filters.make;
    }
  
    // Remove empty parameters and pagination parameters
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] === '' || searchParams[key] === null || key === 'page' || key === 'limit') {
        delete searchParams[key];
      }
    });
  
    let httpParams = new HttpParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== '') {
        httpParams = httpParams.set(key, searchParams[key]);
      }
    });
  
    this.http.get<any>('http://localhost:5000/api/cars/search', { params: httpParams }).subscribe((response: any) => {
      this.searchService.setSearchResults(response.cars);
      this.router.navigate(['/cars'], { queryParams: searchParams });
    });
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
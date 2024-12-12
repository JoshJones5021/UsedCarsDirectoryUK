import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarSearchComponent } from './car-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CarService } from '../../services/car.service';
import { SearchService } from '../../services/search.service';
import { FilterService } from '../../services/filter.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('CarSearchComponent', () => {
  let component: CarSearchComponent;
  let fixture: ComponentFixture<CarSearchComponent>;
  let carService: CarService;
  let filterService: FilterService;
  let searchService: SearchService;
  let authService: AuthService;
  let router: Router;

  const mockDistinctValues = {
    fuel_type: [{ value: 'Petrol', count: 10 }],
    body_type: [{ value: 'Sedan', count: 5 }],
    engine: [{ value: '2.0L', count: 3 }],
    gearbox: [{ value: 'Manual', count: 4 }],
    colour: [{ value: 'Red', count: 2 }],
    emission_class: [{ value: 'Euro 6', count: 6 }],
    make: [{ value: 'Volkswagen', count: 8 }],
    model: [{ value: 'Golf', count: 7 }],
    doors: [{ value: 4, count: 5 }],
    seats: [{ value: 5, count: 6 }]
  };

  const mockCarsResponse = {
    total: 2,
    cars: [
      {
        _id: '1',
        title: 'Volkswagen Golf',
        registration_number: 'ABC123',
        make: 'Volkswagen',
        model: 'Golf',
        price: 10000,
        mileage: 50000,
        registration_year: 2020,
        fuel_type: 'Petrol',
        body_type: 'Sedan',
        engine: '2.0L',
        gearbox: 'Manual',
        doors: 4,
        seats: 5,
        colour: 'Red',
        emission_class: 'Euro 6'
      },
      {
        _id: '2',
        title: 'Volkswagen Passat',
        registration_number: 'DEF456',
        make: 'Volkswagen',
        model: 'Passat',
        price: 15000,
        mileage: 30000,
        registration_year: 2019,
        fuel_type: 'Diesel',
        body_type: 'SUV',
        engine: '2.5L',
        gearbox: 'Automatic',
        doors: 5,
        seats: 7,
        colour: 'Blue',
        emission_class: 'Euro 6'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        NgxSliderModule,
        CarSearchComponent // Import the standalone component
      ],
      providers: [
        CarService,
        SearchService,
        FilterService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarSearchComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    filterService = TestBed.inject(FilterService);
    searchService = TestBed.inject(SearchService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(filterService, 'fetchDistinctValues').and.callFake((filters, callback) => {
      callback(mockDistinctValues);
    });
    spyOn(carService, 'searchCars').and.returnValue(of(mockCarsResponse));
    spyOn(searchService, 'setSearchResults').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch distinct values on init', () => {
    component.ngOnInit();
    expect(filterService.fetchDistinctValues).toHaveBeenCalled();
    expect(component.distinctValues).toEqual(mockDistinctValues);
  });

  it('should fetch total cars on init', () => {
    component.ngOnInit();
    expect(carService.searchCars).toHaveBeenCalled();
    expect(component.totalCars).toBe(2);
  });

  it('should handle filter changes', () => {
    component.filters.make = 'Volkswagen';
    component.filters.model = 'Golf';
    component.onFilterChange();
    expect(carService.searchCars).toHaveBeenCalled();
  });

  it('should fetch distinct values for make', () => {
    component.filters.make = 'Volkswagen';
    component.fetchDistinctValuesForMake();
    expect(filterService.fetchDistinctValues).toHaveBeenCalled();
    expect(component.distinctValues.model).toEqual(mockDistinctValues.model);
  });

  it('should reset filters except specified ones', () => {
    component.filters = {
      price_min: 1000,
      price_max: 50000,
      mileage_min: 10000,
      mileage_max: 100000,
      registration_year_min: 2000,
      registration_year_max: 2020,
      fuel_type: 'Petrol',
      body_type: 'Sedan',
      engine: '2.0L',
      gearbox: 'Manual',
      doors: 4,
      seats: 5,
      colour: 'Red',
      emission_class: 'Euro 6',
      make: 'Volkswagen',
      model: 'Golf',
      title: ''
    };
    component.resetFiltersExcept(['make', 'model']);
    expect(component.filters).toEqual({
      price_min: 0,
      price_max: 100000,
      mileage_min: 0,
      mileage_max: 300000,
      registration_year_min: 1900,
      registration_year_max: component.currentYear,
      fuel_type: '',
      body_type: '',
      engine: '',
      gearbox: '',
      doors: '',
      seats: '',
      colour: '',
      emission_class: '',
      make: 'Volkswagen',
      model: 'Golf',
      title: ''
    });
  });

  it('should call logout on authService', () => {
    spyOn(authService, 'logout').and.returnValue(of({}));
    spyOn(localStorage, 'removeItem');

    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
  });

  it('should return true if authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
  });

  it('should navigate to login on navigateToLogin', () => {
    spyOn(router, 'navigate').and.stub();

    component.navigateToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
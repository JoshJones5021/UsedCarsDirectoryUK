import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarListComponent } from './car-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CarService } from '../../services/car.service';
import { SearchService } from '../../services/search.service';
import { FilterService } from '../../services/filter.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;
  let carService: CarService;
  let authService: AuthService;
  let router: Router;

  const mockCars = {
    cars: [
      {
        _id: '1',
        title: 'Test Car 1',
        registration_number: 'ABC123',
        make: 'Test Make 1',
        model: 'Test Model 1',
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
        title: 'Test Car 2',
        registration_number: 'DEF456',
        make: 'Test Make 2',
        model: 'Test Model 2',
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
    ],
    total: 2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CarListComponent // Import the standalone component
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        CarService,
        SearchService,
        FilterService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarListComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(carService, 'searchCars').and.returnValue(of(mockCars));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch cars on init', () => {
    component.ngOnInit();
    expect(carService.searchCars).toHaveBeenCalled();
    expect(component.cars.length).toBe(2);
    expect(component.total).toBe(2);
  });

  it('should fetch cars with search parameters', () => {
    const searchParams = { make: 'Test Make' };
    component.fetchCars(searchParams);
    expect(carService.searchCars).toHaveBeenCalledWith(jasmine.objectContaining(searchParams));
    expect(component.cars.length).toBe(2);
    expect(component.total).toBe(2);
  });

  it('should navigate to the next page', () => {
    component.page = 1;
    component.nextPage();
    expect(component.page).toBe(2);
    expect(carService.searchCars).toHaveBeenCalledWith(jasmine.objectContaining({ page: 2, limit: component.limit }));
  });

  it('should navigate to the previous page', () => {
    component.page = 2;
    component.prevPage();
    expect(component.page).toBe(1);
    expect(carService.searchCars).toHaveBeenCalledWith(jasmine.objectContaining({ page: 1, limit: component.limit }));
  });

  it('should display car details', () => {
    component.cars = mockCars.cars;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const carElements = compiled.querySelectorAll('.car-card');
    expect(carElements.length).toBe(2);
    expect(carElements[0].querySelector('h2').textContent).toContain('Test Car 1');
    expect(carElements[1].querySelector('h2').textContent).toContain('Test Car 2');
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
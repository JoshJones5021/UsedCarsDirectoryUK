import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCarsComponent } from './my-cars.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('MyCarsComponent', () => {
  let component: MyCarsComponent;
  let fixture: ComponentFixture<MyCarsComponent>;
  let carService: CarService;
  let authService: AuthService;
  let router: Router;

  const mockCarsResponse = {
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
        MyCarsComponent // Import the standalone component
      ],
      providers: [
        CarService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCarsComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(carService, 'getMyCars').and.returnValue(of(mockCarsResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user cars on init', () => {
    component.ngOnInit();
    expect(carService.getMyCars).toHaveBeenCalledWith(component.page, component.limit);
    expect(component.cars.length).toBe(2);
    expect(component.total).toBe(2);
  });

  it('should display car details', () => {
    component.cars = mockCarsResponse.cars;
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
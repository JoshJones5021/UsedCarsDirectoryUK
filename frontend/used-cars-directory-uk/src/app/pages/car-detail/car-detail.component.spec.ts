import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarDetailComponent } from './car-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

describe('CarDetailComponent', () => {
  let component: CarDetailComponent;
  let fixture: ComponentFixture<CarDetailComponent>;
  let carService: CarService;
  let authService: AuthService;
  let router: Router;

  const mockCar = {
    _id: '1',
    title: 'Test Car',
    registration_number: 'ABC123',
    make: 'Test Make',
    model: 'Test Model',
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
    emission_class: 'Euro 6',
    purchase_date: '2020-01-01',
    services: [],
    owners: [],
    current_owner: { username: 'admin' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CarDetailComponent // Import the standalone component
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1' // Mock the car ID
              }
            }
          }
        },
        CarService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarDetailComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(carService, 'getCar').and.returnValue(of(mockCar));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch car details on init', () => {
    component.ngOnInit();
    expect(carService.getCar).toHaveBeenCalledWith('1');
    expect(component.car).toEqual(mockCar);
  });

  it('should navigate to car list on navigateToCarList', () => {
    spyOn(router, 'navigate').and.stub();

    component.navigateToCarList();
    expect(router.navigate).toHaveBeenCalledWith(['/cars']);
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
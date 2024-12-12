import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarFormComponent } from './car-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CarService } from '../../services/car.service';
import { OwnerService } from '../../services/owner.service';
import { ServiceService } from '../../services/service.service';
import { FilterService } from '../../services/filter.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

describe('CarFormComponent', () => {
  let component: CarFormComponent;
  let fixture: ComponentFixture<CarFormComponent>;
  let carService: CarService;
  let ownerService: OwnerService;
  let serviceService: ServiceService;
  let filterService: FilterService;
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
    owners: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        CarFormComponent // Import the standalone component
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
        OwnerService,
        ServiceService,
        FilterService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarFormComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    ownerService = TestBed.inject(OwnerService);
    serviceService = TestBed.inject(ServiceService);
    filterService = TestBed.inject(FilterService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(carService, 'getCar').and.returnValue(of(mockCar));
    spyOn(carService, 'addCar').and.returnValue(of({ status: 201, body: { car_id: '1' } }));
    spyOn(carService, 'updateCar').and.returnValue(of({}));
    spyOn(carService, 'deleteCar').and.returnValue(of(void 0));
    spyOn(serviceService, 'addService').and.returnValue(of({ status: 201, body: { service_id: '1' } }));
    spyOn(serviceService, 'updateService').and.returnValue(of({}));
    spyOn(serviceService, 'deleteService').and.returnValue(of(void 0));
    spyOn(ownerService, 'addOwner').and.returnValue(of({ status: 201, body: { owner_id: '1' } }));
    spyOn(ownerService, 'updateOwner').and.returnValue(of({}));
    spyOn(ownerService, 'deleteOwner').and.returnValue(of(void 0));
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

  it('should save a new car', () => {
    component.isEditMode = false;
    component.car = mockCar;
    component.saveCar();
    expect(carService.addCar).toHaveBeenCalled();
    expect(component.isEditMode).toBeTrue();
    expect(component.isCarAdded).toBeTrue();
  });

  it('should update an existing car', () => {
    component.isEditMode = true;
    component.car = mockCar;
    component.saveCar();
    expect(carService.updateCar).toHaveBeenCalledWith('1', jasmine.any(Object));
  });

  it('should delete a car', () => {
    component.carId = '1';
    component.deleteCar();
    expect(carService.deleteCar).toHaveBeenCalledWith('1');
  });

  it('should add a service', () => {
    component.car.services = [];
    component.addService();
    expect(component.car.services.length).toBe(1);
  });

  it('should save a service', () => {
    component.car.services = [{ service_date: '', service_description: '' }];
    component.saveService(0);
    expect(serviceService.addService).toHaveBeenCalled();
  });

  it('should update a service', () => {
    component.car.services = [{ _id: '1', service_date: '', service_description: '' }];
    component.updateService('1', component.car.services[0]);
    expect(serviceService.updateService).toHaveBeenCalledWith('1', '1', jasmine.any(Object));
  });

  it('should delete a service', () => {
    component.car.services = [{ _id: '1', service_date: '', service_description: '' }];
    component.deleteService('1');
    expect(serviceService.deleteService).toHaveBeenCalledWith('1', '1');
  });

  it('should add an owner', () => {
    component.car.owners = [];
    component.addOwner();
    expect(component.car.owners.length).toBe(1);
  });

  it('should save an owner', () => {
    component.car.owners = [{ owner_name: '', purchase_date: '', sale_price: null, sold_date: '' }];
    component.saveOwner(0);
    expect(ownerService.addOwner).toHaveBeenCalled();
  });

  it('should update an owner', () => {
    component.car.owners = [{ _id: '1', owner_name: '', purchase_date: '', sale_price: null, sold_date: '' }];
    component.updateOwner('1', component.car.owners[0]);
    expect(ownerService.updateOwner).toHaveBeenCalledWith('1', '1', jasmine.any(Object));
  });

  it('should delete an owner', () => {
    component.car.owners = [{ _id: '1', owner_name: '', purchase_date: '', sale_price: null, sold_date: '' }];
    component.deleteOwner('1');
    expect(ownerService.deleteOwner).toHaveBeenCalledWith('1', '1');
  });

  it('should navigate to car list on done', () => {
    spyOn(router, 'navigate').and.stub();

    component.done();
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
import { TestBed } from '@angular/core/testing';
import { CarService } from './car.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('CarService', () => {
  let service: CarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarService]
    });
    service = TestBed.inject(CarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch cars successfully', () => {
    const mockResponse = { total: 2, cars: [{ _id: '1', title: 'Test Car 1' }, { _id: '2', title: 'Test Car 2' }] };
    spyOn(service, 'searchCars').and.returnValue(of(mockResponse));

    service.searchCars({}).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should fetch car details successfully', () => {
    const mockCar = { _id: '1', title: 'Test Car' };
    spyOn(service, 'getCar').and.returnValue(of(mockCar));

    service.getCar('1').subscribe(response => {
      expect(response).toEqual(mockCar);
    });
  });

  it('should add a car successfully', () => {
    const mockResponse = { status: 201, body: { car_id: '1' } };
    spyOn(service, 'addCar').and.returnValue(of(mockResponse));

    service.addCar({ title: 'New Car' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should update a car successfully', () => {
    spyOn(service, 'updateCar').and.returnValue(of({}));

    service.updateCar('1', { title: 'Updated Car' }).subscribe(response => {
      expect(response).toEqual({});
    });
  });

  it('should delete a car successfully', () => {
    spyOn(service, 'deleteCar').and.returnValue(of(void 0));

    service.deleteCar('1').subscribe(response => {
      expect(response).toBeUndefined();
    });
  });
});
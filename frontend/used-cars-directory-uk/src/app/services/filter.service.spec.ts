import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { CarService } from './car.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('FilterService', () => {
  let service: FilterService;
  let carService: CarService;

  const mockCarsResponse = {
    total: 2,
    cars: [
      { _id: '1', fuel_type: 'Petrol', body_type: 'Sedan', engine: '2.0L', gearbox: 'Manual' },
      { _id: '2', fuel_type: 'Diesel', body_type: 'SUV', engine: '2.5L', gearbox: 'Automatic' }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FilterService, CarService]
    });
    service = TestBed.inject(FilterService);
    carService = TestBed.inject(CarService);

    spyOn(carService, 'searchCars').and.returnValue(of(mockCarsResponse));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch distinct values successfully', () => {
    const filters = { make: 'Volkswagen' };
    service.fetchDistinctValues(filters, (distinctValues) => {
      expect(distinctValues.fuel_type.length).toBe(2);
      expect(distinctValues.body_type.length).toBe(2);
      expect(distinctValues.engine.length).toBe(2);
      expect(distinctValues.gearbox.length).toBe(2);
    });
  });

  it('should get distinct values with count', () => {
    const cars = mockCarsResponse.cars;
    const distinctValues = service.getDistinctValuesWithCount(cars, 'fuel_type');
    expect(distinctValues.length).toBe(2);
  });

  it('should get distinct models with count', () => {
    const cars = mockCarsResponse.cars;
    const distinctModels = service.getDistinctModelsWithCount(cars, 'Volkswagen');
    expect(distinctModels.length).toBe(0); // Assuming no models for 'Volkswagen' in mock data
  });
});
import { Injectable } from '@angular/core';
import { CarService } from './car.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  constructor(private carService: CarService) {}

  getDistinctValuesWithCount(cars: any[], field: string): any[] {
    const counts = cars.reduce((acc, car) => {
      const value = car[field];
      if (value !== undefined && value !== null) {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ value: key, count: counts[key] }));
  }

  getDistinctModelsWithCount(cars: any[], make: string): any[] {
    const models = cars
      .filter(car => car.make === make)
      .map(car => car.title.split(' ').slice(1).join(' ')); // Extract model from title
    const counts = models.reduce((acc, model) => {
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ value: key, count: counts[key] }));
  }

  fetchDistinctValues(filters: any, callback: (distinctValues: any) => void): void {
    const searchParams = { ...filters };

    // Remove empty parameters and pagination parameters
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] === '' || searchParams[key] === null || key === 'page' || key === 'limit') {
        delete searchParams[key];
      }
    });

    this.carService.searchCars(searchParams).subscribe(response => {
      const distinctValues: { [key: string]: any[] } = {
        fuel_type: this.getDistinctValuesWithCount(response.cars, 'fuel_type'),
        body_type: this.getDistinctValuesWithCount(response.cars, 'body_type'),
        engine: this.getDistinctValuesWithCount(response.cars, 'engine'),
        gearbox: this.getDistinctValuesWithCount(response.cars, 'gearbox'),
        colour: this.getDistinctValuesWithCount(response.cars, 'colour'),
        emission_class: this.getDistinctValuesWithCount(response.cars, 'emission_class'),
        make: this.getDistinctValuesWithCount(response.cars, 'make'),
        model: this.getDistinctModelsWithCount(response.cars, filters.make),
        doors: this.getDistinctValuesWithCount(response.cars, 'doors'),
        seats: this.getDistinctValuesWithCount(response.cars, 'seats')
      };

      // Ensure current filter values are included with a count of 0 if not present
      Object.keys(filters).forEach(key => {
        if (filters[key] && !distinctValues[key]?.some((item: any) => item.value === filters[key])) {
          distinctValues[key]?.push({ value: filters[key], count: 0 });
        }
      });

      callback(distinctValues);
    });
  }
}
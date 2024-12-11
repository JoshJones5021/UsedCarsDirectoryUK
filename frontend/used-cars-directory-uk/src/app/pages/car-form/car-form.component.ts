import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CarService } from '../../services/car.service';
import { OwnerService } from '../../services/owner.service';
import { ServiceService } from '../../services/service.service';
import { FilterService } from '../../services/filter.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit {
  car: any = {
    registration_number: '',
    make: '',
    model: '',
    price: null,
    mileage: null,
    registration_year: null,
    fuel_type: '',
    body_type: '',
    engine: '',
    gearbox: '',
    doors: null,
    seats: null,
    colour: '',
    emission_class: '',
    purchase_date: '',
    services: [],
    owners: []
  };
  isEditMode: boolean = false;
  carId: string | null = null;
  isCarAdded: boolean = false; // Flag to track if the car has been added
  isCarListPage: boolean = false;
  isSearchPage: boolean = false;
  distinctValues: any = {
    fuel_type: [],
    body_type: [],
    engine: [],
    gearbox: [],
    colour: [],
    emission_class: []
  };

  constructor(
    private carService: CarService,
    private ownerService: OwnerService,
    private serviceService: ServiceService,
    private filterService: FilterService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchDistinctValues();
    this.checkCurrentRoute();
    const carId = this.route.snapshot.paramMap.get('id');
    if (carId) {
      this.isEditMode = true;
      this.carId = carId;
      this.fetchCarDetails(carId);
    }
  }

  fetchDistinctValues(): void {
    this.filterService.fetchDistinctValues({}, (distinctValues: any) => {
      // Sort the values alphabetically
      Object.keys(distinctValues).forEach(key => {
        distinctValues[key].sort((a: any, b: any) => a.value.localeCompare(b.value));
      });
      this.distinctValues = distinctValues;
    });
  }

  fetchCarDetails(carId: string): void {
    this.carService.getCar(carId).subscribe(car => {
      this.car = car;
      this.car.model = this.car.title.split(' ').slice(1).join(' '); // Extract model from title
      this.car.services = car.services;
      this.car.owners = car.owners;
      this.isCarAdded = true; // Set the flag to true when car details are fetched
    });
  }

  saveCar(): void {
    this.car.title = `${this.car.make} ${this.car.model}`.trim();
    this.car.model = this.car.title.split(' ').slice(1).join(' '); // Extract model from title

    const carPayload = {
      registration_number: this.car.registration_number,
      title: this.car.title, // Use title instead of model
      price: this.car.price,
      mileage: this.car.mileage,
      registration_year: this.car.registration_year,
      fuel_type: this.car.fuel_type,
      body_type: this.car.body_type,
      engine: this.car.engine,
      gearbox: this.car.gearbox,
      doors: this.car.doors,
      seats: this.car.seats,
      colour: this.car.colour,
      emission_class: this.car.emission_class,
      purchase_date: this.car.purchase_date
    };

    if (this.isEditMode) {
      this.carService.updateCar(this.carId!, carPayload).subscribe(() => {
        // Stay on the current page after updating the car
      });
    } else {
      this.carService.addCar(carPayload).subscribe(response => {
        if (response.status === 201) {
          this.carId = response.body.car_id;
          this.car._id = this.carId; // Set the car ID in the car object
          this.isCarAdded = true; // Set the flag to true
          this.isEditMode = true; // Switch to edit mode
        }
      });
    }
  }

  deleteCar(): void {
    if (this.carId) {
      this.carService.deleteCar(this.carId).subscribe(() => {
        this.router.navigate(['/cars']);
      });
    }
  }

  addService(): void {
    this.car.services.push({ service_date: '', service_description: '' });
  }

  saveService(index: number): void {
    if (this.carId) {
      const service = this.car.services[index];
      this.serviceService.addService(this.carId, service).subscribe((response: any) => {
        if (response.status === 201) {
          this.car.services[index]._id = response.body.service_id;
        }
      });
    }
  }

  updateService(serviceId: string, service: any): void {
    if (this.carId) {
      this.serviceService.updateService(this.carId, serviceId, service).subscribe();
    }
  }

  deleteService(serviceId: string): void {
    if (this.carId) {
      this.serviceService.deleteService(this.carId, serviceId).subscribe(() => {
        this.car.services = this.car.services.filter((service: any) => service._id !== serviceId);
      });
    }
  }

  removeService(index: number): void {
    if (this.carId && this.car.services[index]._id) {
      this.serviceService.deleteService(this.carId, this.car.services[index]._id).subscribe(() => {
        this.car.services.splice(index, 1);
      });
    } else {
      this.car.services.splice(index, 1);
    }
  }

  addOwner(): void {
    this.car.owners.push({ owner_name: '', purchase_date: '', sale_price: null, sold_date: '' });
  }

  saveOwner(index: number): void {
    if (this.carId) {
      const owner = this.car.owners[index];
      this.ownerService.addOwner(this.carId, owner).subscribe((response: any) => {
        if (response.status === 201) {
          this.car.owners[index]._id = response.body.owner_id;
        }
      });
    }
  }

  updateOwner(ownerId: string, owner: any): void {
    if (this.carId) {
      this.ownerService.updateOwner(this.carId, ownerId, owner).subscribe();
    }
  }

  deleteOwner(ownerId: string): void {
    if (this.carId) {
      this.ownerService.deleteOwner(this.carId, ownerId).subscribe(() => {
        this.car.owners = this.car.owners.filter((owner: any) => owner._id !== ownerId);
      });
    }
  }

  removeOwner(index: number): void {
    if (this.carId && this.car.owners[index]._id) {
      this.ownerService.deleteOwner(this.carId, this.car.owners[index]._id).subscribe(() => {
        this.car.owners.splice(index, 1);
      });
    } else {
      this.car.owners.splice(index, 1);
    }
  }

  done(): void {
    this.router.navigate(['/cars']);
  }

  checkCurrentRoute(): void {
    const currentRoute = this.router.url;
    this.isCarListPage = currentRoute.includes('/cars') && !currentRoute.includes('/cars/');
    this.isSearchPage = currentRoute.includes('/search');
  }

  navigateToCarList(): void {
    this.router.navigate(['/cars']);
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
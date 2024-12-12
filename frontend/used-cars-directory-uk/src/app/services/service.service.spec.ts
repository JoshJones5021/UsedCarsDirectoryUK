import { TestBed } from '@angular/core/testing';
import { ServiceService } from './service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('ServiceService', () => {
  let service: ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceService]
    });
    service = TestBed.inject(ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a service successfully', () => {
    const mockResponse = { id: 1, name: 'Service 1' };
    spyOn(service, 'addService').and.returnValue(of(mockResponse));

    service.addService('1', { name: 'Service 1' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should update a service successfully', () => {
    spyOn(service, 'updateService').and.returnValue(of({}));

    service.updateService('1', '1', { name: 'Updated Service' }).subscribe(response => {
      expect(response).toEqual({});
    });
  });

  it('should delete a service successfully', () => {
    spyOn(service, 'deleteService').and.returnValue(of(void 0));

    service.deleteService('1', '1').subscribe(response => {
      expect(response).toBeUndefined();
    });
  });
});
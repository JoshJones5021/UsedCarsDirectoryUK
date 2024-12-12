import { TestBed } from '@angular/core/testing';
import { OwnerService } from './owner.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('OwnerService', () => {
  let service: OwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OwnerService]
    });
    service = TestBed.inject(OwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add an owner successfully', () => {
    const mockResponse = { status: 201, body: { owner_id: '1' } };
    spyOn(service, 'addOwner').and.returnValue(of(mockResponse));

    service.addOwner('1', { owner_name: 'John Doe' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should update an owner successfully', () => {
    spyOn(service, 'updateOwner').and.returnValue(of({}));

    service.updateOwner('1', '1', { owner_name: 'John Doe' }).subscribe(response => {
      expect(response).toEqual({});
    });
  });

  it('should delete an owner successfully', () => {
    spyOn(service, 'deleteOwner').and.returnValue(of(void 0));

    service.deleteOwner('1', '1').subscribe(response => {
      expect(response).toBeUndefined();
    });
  });
});
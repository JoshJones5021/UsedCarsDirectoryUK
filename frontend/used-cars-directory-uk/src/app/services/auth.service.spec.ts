import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockResponse = { access_token: 'test_token' };
    spyOn(service, 'login').and.returnValue(of(mockResponse));

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should register successfully', () => {
    const mockResponse = { message: 'Registration successful' };
    spyOn(service, 'register').and.returnValue(of(mockResponse));

    service.register({ email: 'test@example.com', password: 'password', username: 'testuser', full_name: 'Test User' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should logout successfully', () => {
    spyOn(service, 'logout').and.returnValue(of({}));

    service.logout().subscribe(response => {
      expect(response).toEqual({});
    });
  });

  it('should return true if authenticated', () => {
    spyOn(service, 'isAuthenticated').and.returnValue(true);
    expect(service.isAuthenticated()).toBeTrue();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginRegisterComponent } from './login-register.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        LoginRegisterComponent // Import the standalone component
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle between login and register modes', () => {
    component.isRegisterMode = false;
    component.toggleMode();
    expect(component.isRegisterMode).toBeTrue();
    component.toggleMode();
    expect(component.isRegisterMode).toBeFalse();
  });

  it('should perform login', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    spyOn(authService, 'login').and.returnValue(of({ access_token: 'test_token' }));
    spyOn(localStorage, 'setItem');
    spyOn(router, 'navigate');

    component.email = credentials.email;
    component.password = credentials.password;
    component.login();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'test_token');
    expect(router.navigate).toHaveBeenCalledWith(['/search']);
  });

  it('should display error message on login failure', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const errorResponse = { error: { message: 'Login failed' } };
    spyOn(authService, 'login').and.returnValue(throwError(errorResponse));

    component.email = credentials.email;
    component.password = credentials.password;
    component.login();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(component.errorMessage).toBe('Login failed');
  });

  it('should perform registration', () => {
    const user = {
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      full_name: 'Test User'
    };
    spyOn(authService, 'register').and.returnValue(of({ message: 'Registration successful' }));
    spyOn(component, 'toggleMode');

    component.email = user.email;
    component.password = user.password;
    component.username = user.username;
    component.fullName = user.full_name;
    component.register();

    expect(authService.register).toHaveBeenCalledWith(user);
    expect(component.toggleMode).toHaveBeenCalled();
  });

  it('should display error message on registration failure', () => {
    const user = {
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
      full_name: 'Test User'
    };
    const errorResponse = { error: { message: 'Registration failed' } };
    spyOn(authService, 'register').and.returnValue(throwError(errorResponse));

    component.email = user.email;
    component.password = user.password;
    component.username = user.username;
    component.fullName = user.full_name;
    component.register();

    expect(authService.register).toHaveBeenCalledWith(user);
    expect(component.errorMessage).toBe('Registration failed');
  });
});
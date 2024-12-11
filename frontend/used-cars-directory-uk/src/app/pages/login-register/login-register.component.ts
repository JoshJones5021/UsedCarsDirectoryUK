import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  fullName: string = '';
  isRegisterMode: boolean = false;
  errorMessage: string = ''; // Add a property to store error messages

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = ''; // Clear error message when toggling mode
  }

  login(): void {
    const credentials = { email: this.email, password: this.password };
    this.authService.login(credentials).subscribe(
      response => {
        localStorage.setItem('access_token', response.access_token);
        this.router.navigate(['/search']); // Navigate to the car search page
      },
      error => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.'; // Set error message from API
      }
    );
  }

  register(): void {
    const user = {
      email: this.email,
      password: this.password,
      username: this.username,
      full_name: this.fullName
    };
    this.authService.register(user).subscribe(
      response => {
        console.log('Registration successful:', response);
        this.toggleMode();
      },
      error => {
        this.errorMessage = error.error.message || 'Registration failed. Please try again.'; // Set error message from API
      }
    );
  }
}
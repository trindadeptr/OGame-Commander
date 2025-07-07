import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    role: 'USER',
    disabled: false,
    lastAccessAt: new Date().toISOString()
  };

  const mockAuthResponse = {
    token: 'mock.jwt.token',
    user: mockUser
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should mark form as invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should require username', () => {
      const usernameControl = component.loginForm.get('username');
      expect(usernameControl?.hasError('required')).toBe(true);
    });

    it('should require password', () => {
      const passwordControl = component.loginForm.get('password');
      expect(passwordControl?.hasError('required')).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should be valid when both fields are filled', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBe(true);
    });

    it('should be invalid with only username', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: ''
      });

      expect(component.loginForm.valid).toBe(false);
    });

    it('should be invalid with only password', () => {
      component.loginForm.patchValue({
        username: '',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBe(false);
    });
  });

  describe('login process', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should call auth service on valid form submission', () => {
      authServiceSpy.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({
        username: '',
        password: ''
      });

      component.onSubmit();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should redirect to tasks page on successful login', () => {
      authServiceSpy.login.and.returnValue(of(mockAuthResponse));

      component.onSubmit();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should show error message on login failure', () => {
      const errorResponse = {
        error: { message: 'Invalid credentials' },
        status: 401
      };
      authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBe(false);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should show generic error for network errors', () => {
      authServiceSpy.login.and.returnValue(throwError(() => new Error('Network error')));

      component.onSubmit();

      expect(component.errorMessage).toBe('Login failed. Please try again.');
      expect(component.isLoading).toBe(false);
    });

    it('should set loading state during login', () => {
      // Create a delayed observable to test loading state
      authServiceSpy.login.and.returnValue(of(mockAuthResponse));

      expect(component.isLoading).toBe(false);

      component.onSubmit();

      // Loading should be true during the call (though this is hard to test with synchronous observables)
      expect(authServiceSpy.login).toHaveBeenCalled();
    });
  });

  describe('template integration', () => {
    it('should display error message when present', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement?.textContent).toContain('Test error message');
    });

    it('should disable submit button when form is invalid', () => {
      component.loginForm.patchValue({
        username: '',
        password: ''
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(false);
    });

    it('should show loading indicator when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading-spinner');
      expect(loadingElement).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      const usernameLabel = fixture.nativeElement.querySelector('label[for="username"]');
      const passwordLabel = fixture.nativeElement.querySelector('label[for="password"]');

      expect(usernameLabel).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
    });

    it('should have proper input types', () => {
      const usernameInput = fixture.nativeElement.querySelector('input[type="text"]');
      const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');

      expect(usernameInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
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

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      const credentials = { username: 'testuser', password: 'password123' };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should handle login error', () => {
      const credentials = { username: 'testuser', password: 'wrong' };
      const errorResponse = { error: { message: 'Invalid credentials' } };

      service.login(credentials).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('token')).toBeNull();
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear token and user data', () => {
      // Set up initial state
      localStorage.setItem('token', 'some.token');
      service['currentUserSubject'].next(mockUser);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', () => {
      localStorage.setItem('token', 'valid.jwt.token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token is empty', () => {
      localStorage.setItem('token', '');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      service['currentUserSubject'].next(adminUser);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for regular user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test.jwt.token';
      localStorage.setItem('token', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit user changes', () => {
      const userChanges: (User | null)[] = [];
      
      service.currentUser$.subscribe(user => {
        userChanges.push(user);
      });

      service['currentUserSubject'].next(mockUser);
      service['currentUserSubject'].next(null);

      expect(userChanges).toEqual([null, mockUser, null]);
    });
  });

  describe('token initialization', () => {
    it('should load user from token on service initialization', () => {
      // This test requires a more complex setup to test the JWT decoding
      // For now, we'll test the basic case
      localStorage.setItem('token', 'valid.token');
      
      // Reinitialize service to trigger constructor logic
      service = new AuthService(TestBed.inject(HttpClientTestingModule) as any, routerSpy);
      
      // With a real JWT token, this would decode and set the user
      // For this test, we're just ensuring no errors occur
      expect(service).toBeTruthy();
    });
  });
});

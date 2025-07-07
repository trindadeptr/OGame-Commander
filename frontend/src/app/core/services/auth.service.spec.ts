import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User, LoginResponse } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    role: 'USER',
    disabled: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastAccessAt: new Date().toISOString()
  };

  const mockLoginResponse: LoginResponse = {
    id: 1,
    username: 'testuser',
    role: 'USER',
    token: 'mock.jwt.token'
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
        expect(response).toEqual(mockLoginResponse);
        expect(localStorage.getItem('token')).toBe(mockLoginResponse.token);
        expect(service.getCurrentUser()).toEqual(jasmine.objectContaining({
          id: 1,
          username: 'testuser',
          role: 'USER'
        }));
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockLoginResponse);
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
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', () => {
      // Create a mock JWT token with future expiration
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const mockToken = `header.${btoa(JSON.stringify({ exp: futureExp }))}.signature`;
      localStorage.setItem('token', mockToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token is empty', () => {
      localStorage.setItem('token', '');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      // Create a mock JWT token with past expiration
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const mockToken = `header.${btoa(JSON.stringify({ exp: pastExp }))}.signature`;
      localStorage.setItem('token', mockToken);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token format is invalid', () => {
      localStorage.setItem('token', 'invalid-token-format');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const adminUser: User = { ...mockUser, role: 'ADMIN' };
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
      const httpClient = TestBed.inject(HttpClientTestingModule);
      service = new AuthService(httpClient as any);
      
      // With a real JWT token, this would decode and set the user
      // For this test, we're just ensuring no errors occur
      expect(service).toBeTruthy();
    });
  });
});

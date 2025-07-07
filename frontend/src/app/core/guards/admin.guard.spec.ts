import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'isAdmin']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated and is admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(true);

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to login when user is not authenticated', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should return false and redirect to tasks when user is authenticated but not admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });

  describe('canActivateChild', () => {
    it('should return true when user is authenticated and is admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(true);

      const result = guard.canActivateChild();

      expect(result).toBe(true);
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
    });

    it('should return false when user is not admin', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = guard.canActivateChild();

      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });

  describe('edge cases', () => {
    it('should handle auth service errors gracefully', () => {
      authServiceSpy.isAuthenticated.and.throwError('Auth error');

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle admin check errors gracefully', () => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.isAdmin.and.throwError('Admin check error');

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should prioritize authentication over admin check', () => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
      // isAdmin shouldn't be called if user is not authenticated

      const result = guard.canActivate();

      expect(result).toBe(false);
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).not.toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});

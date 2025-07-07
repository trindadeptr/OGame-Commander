import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(adminGuard).toBeTruthy();
  });

  describe('guard execution', () => {
    it('should return true when user is admin', () => {
      authServiceSpy.isAdmin.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => adminGuard());

      expect(result).toBe(true);
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to tasks when user is not admin', () => {
      authServiceSpy.isAdmin.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => adminGuard());

      expect(result).toBe(false);
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });

  describe('edge cases', () => {
    it('should handle authentication service throwing error', () => {
      authServiceSpy.isAdmin.and.throwError('Auth service error');

      expect(() => TestBed.runInInjectionContext(() => adminGuard())).toThrow();
    });
  });
});

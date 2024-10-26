import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  private allowedLoggedOutUrls = [
    '/loyalty/egift',
    '/loyalty/check-balance',
    '/loyalty/orders'
  ]

  constructor(private router: Router,
              private cookieService: CookieService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.isLoggedIn() && this.allowedLoggedOutUrls.includes(state.url)) {
      return true;
    }
    if (!this.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    return this.isLoggedIn();
  }

  isLoggedIn(): boolean {
    let local_access_token = this.cookieService.get('accesstoken');
    return !!local_access_token;
  }
}

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(private router: Router,
              private authService: AuthenticationService,
              private cookieService: CookieService) {
  }

  private isAccountInvalid = this.cookieService.get('isAccountInvalid');

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot) {
    if (!this.isLoggedIn() && !this.isAccountInvalid) {
      this.cookieService.set('isAccountInvalid', 'false');
      return true;
    } else if (this.isLoggedIn() && !this.isAccountInvalid) {
      return this.isUserValidated().then(isValid => {
        if (isValid) {
          return true;
        } else {
          // return this.router.createUrlTree(['/not-authorized']);
          this.router.navigate(['/loyalty/login']);
          return false;
        }
      }).catch(error => {
        console.error('Error:', error);
        this.router.navigate(['/loyalty/login']);
        return false;
      });
    } else if ((this.isLoggedIn() && this.isAccountInvalid !== 'true') || (!this.isLoggedIn() && this.isAccountInvalid !== 'true')) {
      return true;
    } else {
      this.router.navigate(['/loyalty/login']);
      return false;
    }
  }

  isUserValidated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.userIsValidate().subscribe({
        next: (data: any) => {
          if (data.isValidated) {
            this.cookieService.set('isAccountInvalid', 'false');
          } else {
            this.cookieService.set('isAccountInvalid', 'true');
          }
          resolve(data.isValidated);
        },
        error: (error) => {
          console.log('message-error', error.status);
          console.log(error.error.error.errors[0].message);
          reject(error);
        }
      });
    });
  }

  isLoggedIn(): boolean {
    let local_access_token = this.cookieService.get('accesstoken');
    return !!local_access_token;
  }
}

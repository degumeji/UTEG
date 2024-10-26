import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CookieService} from 'ngx-cookie-service';


@Injectable()
export class AuthenticationService {

  private loginEndpoint = environment.apiUrl + '/user/authenticate';
  private registerEndpoint = environment.apiUrl + '/user/register';
  private passResetEmailEndpoint = environment.apiUrl + '/user/password-reset/reset';
  private passResetApplyEndpoint = environment.apiUrl + '/user/password-reset/apply';
  private userExistsEndpoint = environment.apiUrl + '/user/email/exists?email=';
  private cedulaExistsEndpoint = environment.apiUrl + '/user/cedula/exists?cedula=';
  private mobileExistsEndpoint = environment.apiUrl + '/user/mobile/exists?mobile=';
  private userActivateEndpoint = environment.apiUrl + '/user/activate';
  private emailActivateEndpoint = environment.apiUrl + '/user/activate/email?session_identifier=';
  public userValidateEndpoint = environment.apiUrl + '/user/isValidated?session=';

  constructor(private http: HttpClient,
              private cookieService: CookieService) {
  }

  login(params: any) {
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.loginEndpoint,
      params,
      { headers: headers })
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  register(params: any) {
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.registerEndpoint,
      params,
      { headers: headers })
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  userExists(email: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.userExistsEndpoint + email + '&vendor=' + environment.vendor,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  cedulaExists(userId: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.cedulaExistsEndpoint + userId + '&vendor=' + environment.vendor,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  mobileExists(mobile_data: any) {
    console.log(mobile_data);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.mobileExistsEndpoint + mobile_data.number + '&country=' + mobile_data.country + '&vendor=' + mobile_data.vendor_id,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  sendCodeToEmail(params: any) {
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.passResetEmailEndpoint,
      params,
      { headers: headers })
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  resetPassword(params: any) {
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.passResetApplyEndpoint + '?vendor=' + environment.vendor,
      params,
      { headers: headers })
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  userActivate(code: any) {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.userActivateEndpoint + '?token=' + code + '&session_identifier=' + session_key,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  userActivateEmail() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.emailActivateEndpoint + session_key,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  userIsValidate() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.userValidateEndpoint + session_key,
      { headers: headers }
    )
      .pipe(map(response => response || {}))
      .pipe(tap(
        data => {
        },
        (err: Response) => {
          if (err instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('An error occurred:', err.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.log(`Backend returned code ${ err.status }, body was: ${ err }`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }


  handleErrors(error: Response) {
    return throwError(error);
  }
}

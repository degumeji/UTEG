import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {environment} from "../environments/environment";
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class DeleteAccountService {
  private deleteAccountEndPoint = `${environment.apiUrl}/vendor/${environment.vendor}/customers`;

  constructor(private http: HttpClient,
              private cookieService: CookieService) {

  }

  deleteAccount(code: any) {
    const body = JSON.stringify({'code': code});
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.delete(this.deleteAccountEndPoint,
      {headers, body})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  handleErrors(error: Response) {
    return throwError(error);
  }
}

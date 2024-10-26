import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {Paginator} from 'src/interfaces/app';

@Injectable()
export class WalletsService {
  private downloadGoogleWalletEndpoint = `${ environment.apiUrl }/vendor/${ environment.vendor }/googlepaypass/${ environment.googlepay_pass_id }/export/`;
  private downloadAppleWalletEndpointEndpoint = `${ environment.apiUrl }/vendor/${ environment.vendor }/passbook/card/export/`;

  constructor(private http: HttpClient,
              private cookieService: CookieService) {
  }

  downloadGoogleWallet() {
    let session_key = this.cookieService.get('accesstoken');
    let userId = this.cookieService.get('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get(
      `${ this.downloadGoogleWalletEndpoint }${ userId }?session_key=${ session_key }`,
      { headers: headers, responseType: 'json' }
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  downloadAppleWallet() {
    let userId = this.cookieService.get('userId');
    let sessionKey = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get(
      `${ this.downloadAppleWalletEndpointEndpoint }${ userId }?session_key=${ sessionKey }`,
      { headers: headers, responseType: 'blob', observe: 'response' }
    )

  }

  handleErrors(error: Response) {
    return throwError(error);
  }
}

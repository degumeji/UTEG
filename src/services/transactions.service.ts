import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {endWith, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {Paginator} from '../interfaces/app';

@Injectable()
export class TransactionService {

  //barcode
  private barcodeType = 2;
  private barcodeStyle = 'QR CODE';

  private allTransactionEndpoint = environment.apiUrl + '/user/transaction/list';
  private allSTCCEndpoint = environment.apiUrl + '/user/card-3rdparty/list.json?session_key=';
  private allCCEndpoint = environment.apiUrl + '/user/billing-profile/list?session_key=';
  private saveCCEndpoint = environment.apiUrl + '/user/billing-profile/add?session_key=';
  private deleteCCEndpoint = environment.apiUrl + '/user/billing-profile?session_key=';
  private egiftEndpoint = environment.apiUrl + '/vendor/' + environment.vendor + '/egift?session_key=';
  private egiftEndpointLogout = environment.apiUrl + '/vendor/' + environment.vendor + '/egift';
  private reloadEndpoint = environment.apiUrl + '/user/billing-profile/reload?session_key=';
  private reloadSettingsEndpoint = environment.apiUrl + '/user/reload/settings?session_key=';
  private cardBalanceEndpoint = environment.apiUrl + '/card/balance?';
  private barCodeEndpoint = environment.apiUrl + '/user/token/request?session_key=';
  //check balance
  private checkBalanceEndPoint = `${environment.apiUrl}/card-3rdparty/balance?number=`
  private checkBalanceWithPinEndPoint = `${environment.apiUrl}/card/balance?number=`
  private getCardsWithPinEndPoint = environment.apiUrl + '/user/card/list.json?session_key=';

  constructor(private http: HttpClient,
              private cookieService: CookieService) {
  }

  getBalance(cardNumber: string, hasPin: boolean, pin: any) {
    //9999906133557350&pin=906&vendor={{vendor_id}}

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const endpoint = hasPin ? this.checkBalanceWithPinEndPoint : this.checkBalanceEndPoint;
    const pinNumber = hasPin ? pin : '';

    return this.http.get(`${endpoint}${cardNumber}&pin=${pinNumber}&vendor=${environment.vendor}`,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  getTransactions(paginator?: Paginator) {
    const session_key = this.cookieService.get('accesstoken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const pageParams = paginator ? `&page=${paginator.page}&limit=${paginator.limit}` : ''
    const queryParams = `?order=${environment.order}&session_key=${session_key}${pageParams}`;
    return this.http.get(
      this.allTransactionEndpoint + queryParams,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  getSTCC() {
    const session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.allSTCCEndpoint + session_key,
      {headers: headers}
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
            console.log(`Backend returned code ${err.status}, body was: ${err}`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  getCardsWithPin() {
    const session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.getCardsWithPinEndPoint + session_key,
      {headers: headers}
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
            console.log(`Backend returned code ${err.status}, body was: ${err}`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  getCC() {
    const session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.allCCEndpoint + session_key,
      {headers: headers}
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
            console.log(`Backend returned code ${err.status}, body was: ${err}`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  saveCC(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.saveCCEndpoint + session_key,
      params,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
      }))
      .pipe(catchError(this.handleErrors));
  }

  deleteCC(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.delete(
      this.deleteCCEndpoint + session_key,
      {headers: headers, body: params})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  getCardBalance(number: any, pin: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.cardBalanceEndpoint + 'number=' + number + '&pin=' + pin + '&vendor=' + environment.vendor,
      {headers: headers}
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
            console.log(`Backend returned code ${err.status}, body was: ${err}`);
          }
        }
      ))
      .pipe(catchError(this.handleErrors));
  }

  sendEgift(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    const isLogged = !!session_key;
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let endpointRequest = '';
    if (isLogged) {
      endpointRequest = this.egiftEndpoint + session_key;
    } else {
      endpointRequest = this.egiftEndpointLogout;
    }

    return this.http.post(
      endpointRequest,
      params,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  reload(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.reloadEndpoint + session_key,
      params,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  autoReload(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(
      this.reloadEndpoint + session_key,
      params,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  autoReloadoff(params: any) {
    const session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(
      this.reloadSettingsEndpoint + session_key,
      params,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  getBarCode() {
    const session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      token_type: this.barcodeType, style: this.barcodeStyle
    };

    return this.http.post(
      this.barCodeEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  handleErrors(error: Response) {
    return throwError(error);
  }
}

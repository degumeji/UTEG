import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";
import { Paginator } from "../interfaces/app";

@Injectable()
export class UtilsService {

  private countriesEndpoint = environment.apiUrl + "/vendor/countries";
  private termsEndpoint = environment.apiUrl + "/vendor/content/terms-of-service";
  private privacyEndpoint = environment.apiUrl + "/vendor/content/privacy-policy";
  private locationEndpoint = environment.apiUrl + "/vendor/store/list?vendor=" + environment.vendor;

  constructor(private http: HttpClient,
    private cookieService : CookieService) {}

  getCountries(){
    let headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    return this.http.get(
      this.countriesEndpoint,
      { headers: headers }
    )
    .pipe(map(response => response || {}))
    .pipe(catchError(this.handleErrors));
  }

  getTermsOfService(){
    let language =  this.cookieService.get('defaultLang');

    let headers = new HttpHeaders({
      "spoonity-request-user-language": language
    });

    return this.http.get(
      this.termsEndpoint + "?vendor=" + environment.vendor,
      { headers: headers }
    )
    .pipe(map(response => response || {}))
    .pipe(catchError(this.handleErrors));
  }

  getPrivicyPolicy(){
    let language =  this.cookieService.get('defaultLang');

    let headers = new HttpHeaders({
      "spoonity-request-user-language": language
    });

    return this.http.get(
      this.privacyEndpoint + "?vendor=" + environment.vendor,
      { headers: headers }
    )
    .pipe(map(response => response || {}))
    .pipe(catchError(this.handleErrors));
  }

  getLocales(lat: any, long: any, paginator?: Paginator){
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
    const pageParams = paginator ?
      `&page=${paginator.page}&limit=${paginator.limit}` :
      `&page=${environment.page}&limit=${environment.limitStores}`
    return this.http.get(
      // this.locationEndpoint,
      this.locationEndpoint +
      "&latitude=" + lat +
      "&longitude=" + long +
      "&distance="+ environment.distance +
      "&unit="+ environment.unit + pageParams,
      { headers: headers }
    )
    .pipe(map(response => response || {}))
    .pipe(catchError(this.handleErrors));
  }

  handleErrors(error: Response) {
    return throwError(error);
  }
}

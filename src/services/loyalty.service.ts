import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable()
export class LoyaltyService {

  private endpoint = environment.apiUrl + "/order?api_key=";

  constructor(private http: HttpClient) {}

  orderProcess(apiKey:any, params:any){
    let headers = new HttpHeaders({
        "Content-Type": "application/json"
    });

    return this.http.post(
      this.endpoint + apiKey,
      params,
      { headers: headers })
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

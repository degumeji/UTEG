import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LinkCardService {
  baseUrl: string = environment.apiUrl;
  endpoint = `${this.baseUrl}/user/`;
  call1 = `/resources/RewardsCard?number__iexact=3012110530003950`/*${ environment.linkCardApiUrl }*/
  user_session_key = this.getAccessTokenFromCookie();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService) {
  }

  call1Method() {
    return this.http.post(
      this.call1,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'API-AUTHENTICATION': 'bd279a0dc12447f7a5282cd5ef0177fe:ce55264f31ff41fc8b8c96cce4a768f165da901291e04e4b974bd93f97f167b8'
        }
      })
  }

  handleErrors(error: Response) {
    return throwError(error);
  }

  getAccessTokenFromUrl() {
    const url = window.location.href;
    const match = url.match(/#access_token=([^&]*)/);
    return match && match[1];
  }

  getAccessTokenFromCookie() {
    return this.cookieService.get('accesstoken');
  }

  linkCard(cardDetails: {
    user: number;
    number: any;
    pin: string
  }): Observable<any> {
    return this.http.post(this.endpoint + 'card-3rdparty/add?session_key=' + this.user_session_key, cardDetails);
  }

  deleteCard(user_card: any): Observable<any> {
    const url = `${this.endpoint}card-3rdparty?session_key=${this.user_session_key}`;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const body = JSON.stringify({'user_card3rdparty': user_card});

    return this.http.delete(url, {headers, body});
  }

  getUser() {
    const url = `${this.endpoint}profile?session_key=${this.user_session_key}`;
    return this.http.get(url)
  }

  getCard() {
    const url = `${this.endpoint}card-3rdparty/list?session_key=${this.user_session_key}`;
    return this.http.get(url)
  }
}

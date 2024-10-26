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
export class ProfileService {

  private profileEndpoint = environment.apiUrl + '/user/profile?session_key=';
  private getbalanceEndpoint = environment.apiUrl + '/user/quick-pay/balance?session_key=';
  private getreloadSettingsEndpoint = environment.apiUrl + '/user/reload/settings?session_key=';
  private getrewards = environment.apiUrl + '/user/reward/list';
  private barCodeEndpoint = environment.apiUrl + '/user/token/request?session_key=';
  private activationSMSEndPoint = environment.apiUrl + '/user/activate/sms?session_identifier=';
  private deleteProfileEndpoint = environment.apiUrl + '/vendor/' + environment.vendor + '/customers/';
  private activatePromotionEndpoint = environment.apiUrl + '/vendor/promotion/award.json?session_key=';
  private checkinEndpoint = environment.apiUrl + '/vendor/store/check-in?session_key=';
  private rewardRedeemEndpoint = environment.apiUrl + '/user/reward/redeem?session_key=';
  private transferEgiftEndpoint = environment.apiUrl + '/egift/transfer.json?session_key=';
  private addCardEndPoint = environment.apiUrl + '/user/card-3rdparty/add?session_key=';
  private addCardWithPinEndPoint = environment.apiUrl + '/user/card/add?session_key=';

  constructor(private http: HttpClient,
              private cookieService: CookieService) {
  }

  getProfile() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.profileEndpoint + session_key,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  //Get BarCode (POST)
  getBarCode() {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {token_type: environment.barcodeType, style: environment.barcodeStyle};

    return this.http.post(
      this.barCodeEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  updateProfile(body: any) {
    let session_key = this.cookieService.get('accesstoken');
    //Put
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put(
      this.profileEndpoint + session_key,
      body,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  //Consume el saldo disponible en Cashback
  user_quickpay_balance() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.getbalanceEndpoint + session_key,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  user_rewards() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get(
      this.getrewards + '?session_key=' + session_key,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  user_coupons(paginator?: Paginator) {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const pageParams = paginator ? `&page=${paginator.page}&limit=${paginator.limit}` : '';
    return this.http.get(
      this.getrewards + '?session_key=' + session_key + pageParams,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  //Get Reload Settings
  user_reload_settings_read() {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      this.getreloadSettingsEndpoint + session_key,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  sendActivationSMS(phone: string | null, country: string | null) {
    let session_key = this.cookieService.get('accesstoken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      phone ? this.activationSMSEndPoint + session_key + '&phone=' + phone + '&country=' + country : this.activationSMSEndPoint + session_key,
      {headers: headers}
    )
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  deleteProfileSubmit() {
    let userId = this.cookieService.get('userId');
    let session_key = this.cookieService.get('accesstoken');
    //Delete
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.delete(
      this.deleteProfileEndpoint + userId + '/submit?session_key=' + session_key,
      {headers: headers, body: {}})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  deleteProfile(codeSubmitted: any) {
    // let body = new HttpParams().set("code", codeSubmitted);
    // let session_key = this.cookieService.get('accesstoken');
    // //Delete
    // let headers = new HttpHeaders({
    //     "Content-Type": "application/json"
    // });
    // let options = {params: body}
    // return this.http.delete(
    //     this.deleteProfileEndpoint,
    //     options
    // )
    // .pipe(map(response => response || {}))
    // .pipe(catchError(this.handleErrors));
  }

  activatePromotion(code: string) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {code: code};

    return this.http.post(
      this.activatePromotionEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  checkin(vendor: any, table: any, payment_method: string | null) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      vendor_id: vendor,
      table_number: table,
      payment_method: payment_method
    };

    return this.http.post(
      this.checkinEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  rewardRedeem(pos_session: number, rewardId: number) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      pos_session_id: pos_session,
      vendor_perk_redemption_id: rewardId
    };

    return this.http.post(
      this.rewardRedeemEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  transferEgift(token: string) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {user_token: token};

    return this.http.post(
      this.transferEgiftEndpoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(catchError(this.handleErrors));
  }

  user_prepaid(number: any) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      number: number,
      pin: ' ',
      user: +this.cookieService.get('userId')
    };

    return this.http.post(
      this.addCardEndPoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
        // console.log(data);
      }))
      .pipe(catchError(this.handleErrors));
  }

  user_prepaidWithPin(number: any, pin: any) {
    let session_key = this.cookieService.get('accesstoken');
    //Headers
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      number: number,
      pin: pin,
      user: +this.cookieService.get('userId')
    };

    return this.http.post(
      this.addCardWithPinEndPoint + session_key,
      body,
      {headers: headers})
      .pipe(map(response => response || {}))
      .pipe(tap(data => {
      }))
      .pipe(catchError(this.handleErrors));
  }


  handleErrors(error: Response) {
    return throwError(error);
  }
}

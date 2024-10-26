import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
import {Country} from 'src/models/utils';
// import { NgxSpinnerService } from 'ngx-spinner';
import {AuthenticationService} from 'src/services/authentication.service';
import {ModalService} from 'src/services/modal.service';
import {ProfileService} from 'src/services/profile.service';
import {UtilsService} from 'src/services/util.service';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit {

  public digitos = "";
  public logoUrl: string;
  public verificationMethod: string = "";

  public genericMsg = "";
  public phoneCode: string = "";
  public phoneNumber: string = "";
  public phoneCountry: string = "";
  public alertPhoneNumber = "";

  public enterCodeView = true;
  public enterPhoneView = false;
  public isPhoneNumberExists = false;

  public isValidPhoneNumber = false;
  public isInvalidPhoneNumber = false;
  public showInvalidPhoneNumberAlert = false;
  public countries: Array<Country>;
  public filteredCountries: Array<Country>;

  constructor(
    private router: Router,
    // private spinner: NgxSpinnerService,
    private utilsService: UtilsService,
    private modalService: ModalService,
    private authService: AuthenticationService,
    private translate: TranslateService,
    private profileService: ProfileService,
    private cookieService: CookieService) {
    this.countries = new Array<Country>();
    this.filteredCountries = new Array<Country>();
    this.logoUrl = environment.baseAssetsUrl + "assets/images/logo-login.png";
    this.phoneCountry = this.cookieService.get("phone_country") || environment.phone_number_country;
    this.phoneCode = this.cookieService.get("phone_code") || environment.phone_number_code;
    this.phoneNumber = this.cookieService.get("phone") || "";
  }

  ngOnInit(): void {
    this.getCountries(null);
    this.isUserValidated();
  }

  isUserValidated() {
    this.authService.userIsValidate()
      .subscribe({
        next: (data: any) => {
          const userMethods = data.methods || [];
          this.verificationMethod = userMethods[userMethods.length - 1] || '';
          if (data.isValidated) {
            let promotionCode = this.cookieService.get("redeem");
            let checkinVendor = this.cookieService.get("vendorId");
            let transferAcount = this.cookieService.get("user_token");
            if (promotionCode) {
              this.router.navigateByUrl("/activate-promotion");
            } else if (checkinVendor) {
              this.router.navigateByUrl("/check-in");
            } else if (transferAcount) {
              this.router.navigateByUrl("/transfer-account");
            } else {
              this.cookieService.set("isAccountInvalid", 'false')
              this.router.navigateByUrl("/loyalty/orders");
            }
          } else {
            setTimeout(() => {
              this.isUserValidated();
            }, 5000);
          }
        },
        error: (error) => {
          console.log("message-error", error.status);
          console.log(error.error.error.errors[0].message);
        },
        complete: () => console.info('complete')
      });
  }

  getResendAction() {
    const resendActions: any = {
      'sms': 'resend_sms',
      'email': 'resend_email'
    }
    return resendActions[(this.verificationMethod || '').toLowerCase()] || 'resend'
  }

  onValidateCode() {
    if (this.digitos != "" && this.digitos.length == 6) {
      this.authService.userActivate(this.digitos)
        .subscribe({
          next: (response: any) => {
            let promotionCode = this.cookieService.get("redeem");
            let checkinVendor = this.cookieService.get("vendorId");
            let transferAcount = this.cookieService.get("user_token");
            if (promotionCode) {
              this.router.navigateByUrl("/activate-promotion");
            } else if (checkinVendor) {
              this.router.navigateByUrl("/check-in");
            } else if (transferAcount) {
              this.router.navigateByUrl("/transfer-account");
            } else {
              this.router.navigateByUrl("/loyalty/orders");
            }
          },
          error: (error) => {
            if (error.status == 200) {
              let promotionCode = this.cookieService.get("redeem");
              let checkinVendor = this.cookieService.get("vendorId");
              let transferAcount = this.cookieService.get("user_token");
              if (promotionCode) {
                this.router.navigateByUrl("/activate-promotion");
              } else if (checkinVendor) {
                this.router.navigateByUrl("/check-in");
              } else if (transferAcount) {
                this.router.navigateByUrl("/transfer-account");
              } else {
                this.router.navigateByUrl("/loyalty/orders");
              }
            } else {
              this.digitos = "";
            }
          },
          complete: () => console.info('complete')
        });
    }
  }

  onCheckPhoneNumber() {
    let mobile_data = {
      number: this.phoneNumber,
      country: this.phoneCountry,
      vendor_id: environment.vendor
    };
    this.authService.mobileExists(mobile_data)
      .subscribe({
        next: (response: any) => {
          console.log(response.available)
          this.isPhoneNumberExists = !response.available;
        },
        error: (error) => {
          console.log("message-error", error.status);
        },
        complete: () => console.info('complete')
      });
  }

  onResend() {
    switch ((this.verificationMethod || '').toLowerCase()) {
      case "sms":
        this.onSendSMSActivation(this.phoneNumber, this.phoneCountry);
        break;
      case "email":
        this.onSendEmailActivation();
        break;
      default:
        this.onSendEmailActivation();
        break;
    }
  }

  onSendEmailActivation() {
    this.authService.userActivateEmail()
      .subscribe({
        next: (response: any) => {
          this.genericMsg = this.translate.instant("view_alerts.email_send");
          this.openModal('modal-generic');
        },
        error: (error) => {

          console.log("message-error", error.status);
          if (error.status == 200) {
            this.genericMsg = this.translate.instant("view_alerts.email_send");
            this.openModal('modal-generic');
          }
        },
        complete: () => console.info('complete')
      });
  }

  onSendSMSActivation(phone: string | null, country: string | null) {
    this.profileService.sendActivationSMS(phone, country)
      .subscribe({
        next: (response: any) => {
          this.genericMsg = this.translate.instant("view_alerts.sms_send");
          this.openModal('modal-generic');
        },
        error: (error) => {

          console.log("message-error", error.status);
          if (error.status == 200) {
            this.genericMsg = this.translate.instant("view_alerts.sms_send");
            this.openModal('modal-generic');
          }
        },
        complete: () => console.info('complete')
      });
  }

  toggleView() {
    this.enterPhoneView = !this.enterPhoneView;
    this.enterCodeView = !this.enterCodeView;
    if (this.enterCodeView)
      this.onResend();
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  filterFunction(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.filteredCountries = this.performFilter(textvalue);
  }

  performFilter(filterBy: string): any[] {
    filterBy = filterBy.toLowerCase();
    return this.countries.filter((country: any) =>
      country.name.toLowerCase().indexOf(filterBy) !== -1 || country.phone_code.indexOf(filterBy) !== -1
    );
  }

  getCountries(listview: any) {
    this.utilsService.getCountries()
      .subscribe({
        next: (response: any) => {
          this.countries = <Array<Country>>response;
          this.filteredCountries = <Array<Country>>response;

          if (listview != null) {
            listview.notifyPullToRefreshFinished();
          }
        },
        error: (error) => {
          console.log("message-error", error.status);
        },
        complete: () => console.info('complete')
      });
  }

  get listFilter(): any {
    return this.filteredCountries;
  }

  set listFilter(value: any) {
    this.filteredCountries = value;
  }

  onCountryCodeSelected(selectedCountry: any): void {
    this.phoneCode = selectedCountry.phone_code;
    this.phoneCountry = selectedCountry.code;
  }

  onPhoneNumberChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    if (environment.isValidatePhoneNumberRequired) {
      if (!this.isValidUserPhoneNumber(textvalue)) {
        this.isValidPhoneNumber = false;
      } else {
        this.isValidPhoneNumber = true;
      }
    } else {
      this.showInvalidPhoneNumberAlert = true;
      if (textvalue.length == environment.phoneNumberLength) {
        this.isValidPhoneNumber = true;
        this.onCheckPhoneNumber();
      } else {
        this.isValidPhoneNumber = false;
      }
    }
  }

  isValidUserPhoneNumber(phoneNumer: any) {
    const valid_prefixes = [300, 301, 302, 303, 304, 305, 306, 310, 311, 312, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 350, 351];

    if (isNaN(phoneNumer)) {

      return false;
    }
    //Preguntamos si la phoneNumer consta de 10 digitos
    if (phoneNumer.length == 10) {

      //Obtenemos el digito de la region que sonlos tres primeros digitos
      let digito_region = phoneNumer.substring(0, 3);

      //Pregunto si la region existe Colombia
      for (let i = 0; i < valid_prefixes.length; i++) {
        if (digito_region == valid_prefixes[i]) {
          this.alertPhoneNumber = "";
          return true;
        }
      }

      // imprimimos en consola si la region no pertenece
      console.log('Este phoneNumer no pertenece a ninguna region');
      // this.alertPhoneNumber = this.translate.instant("phoneregion");
    } else {
      //imprimimos en consola si la phoneNumer tiene mas o menos de 10 digitos
      console.log('Este phoneNumer tiene menos de 10 Digitos', phoneNumer.length);
      // this.alertPhoneNumber = this.translate.instant("phonelength");
    }
    return false;
  }

  protected readonly environment = environment;
}

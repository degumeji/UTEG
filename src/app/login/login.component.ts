import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
import {AuthenticationService} from 'src/services/authentication.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgxSpinnerService} from 'ngx-spinner';
import {ModalService} from 'src/services/modal.service';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NavigationService} from 'src/services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  public email = '';
  public firstName = '';
  public lastName = '';
  public password = '';
  public sessionId = '';
  public userId = '';
  public hidePsw = true;

  public showLoginForm = true;
  public showFinalView = false;

  public dig1 = '';
  public dig2 = '';
  public dig3 = '';
  public dig4 = '';
  public dig5 = '';
  public dig6 = '';
  public digitos = '';

  public passicon = true;
  public showPass = '';
  public hidePass = '';
  public logoUrl: string;

  public genericMsg = '';

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private modalService: ModalService,
    private cookieService: CookieService,
    private navigationService: NavigationService,
    private _snackBar: MatSnackBar) {
    this.logoUrl = environment.baseAssetsUrl + 'assets/images/logo-login.png';
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.navigationService.onUpdateEmail.subscribe((value: boolean) => {
      if (value) {
        this.openSnackBar();
      }
    });
  }

  openSnackBar() {
    this._snackBar.open(this.translate.instant('view_alerts.email_updated'), this.translate.instant('close_btn'), {
      duration: 2000,
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    this.spinner.show();

    let email_address = this.loginForm.value.email.toLowerCase();
    let password = this.loginForm.value.password;
    let vendor = environment.vendor;

    if (email_address == 'jefe@uteg.edu.ec' || email_address == 'empleado@uteg.edu.ec') {
      this.spinner.hide();
      this.sessionId = (email_address == 'jefe@uteg.edu.ec' ? '1' : '2');
      this.userId = (email_address == 'jefe@uteg.edu.ec' ? '1' : '2');
      this.firstName = (email_address == 'jefe@uteg.edu.ec' ? 'jefe' : 'empleado');
      this.lastName = (email_address == 'jefe@uteg.edu.ec' ? 'jefe' : 'empleado');
      this.cookieService.set('email', email_address);
      this.cookieService.set('firstName', this.firstName);
      this.cookieService.set('lastName', this.lastName);
      this.cookieService.set('userId', this.userId);
      this.cookieService.set('isPendingValidation', 'false');
      let isARChecked = 1;
      this.cookieService.set('isAutoReloadActive', `${isARChecked}`, {
        path: '/',
        sameSite: 'Strict'
      })
      
      this.router.navigateByUrl('/home2');

    }else{

      this.spinner.hide();
      this.genericMsg = this.translate.instant('view_alerts.invalid_credentials');
      this.openModal('modal-generic');

    }    

    /*
    const user_data = {
      email_address: this.loginForm.value.email.toLowerCase(),
      password: this.loginForm.value.password,
      vendor: environment.vendor,
    };
    this.authService.login(user_data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            this.sessionId = response.session_identifier;
            this.userId = response.user_vendor.user.id;
            this.firstName = response.user_vendor.user.first_name;
            this.lastName = response.user_vendor.user.last_name;
            this.cookieService.set('email', user_data.email_address);
            this.cookieService.set('firstName', this.firstName);
            this.cookieService.set('lastName', this.lastName);
            this.cookieService.set('userId', this.userId);
            this.cookieService.set('isPendingValidation', 'false');
            let isARChecked = response.user_vendor.billing_profile !== null;
            this.cookieService.set('isAutoReloadActive', `${isARChecked}`, {
              path: '/',
              sameSite: 'Strict'
            })
            this.isUserValidated();
          }
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status === 401) {
            this.genericMsg = this.translate.instant('view_alerts.invalid_credentials');
            this.openModal('modal-generic');
          }
        },
        complete: () => {
        }
      });
    */
  }

  isUserValidated() {
    if (this.sessionId != '') {
      this.cookieService.set('accesstoken', this.sessionId, {
        path: '/',
        sameSite: 'Lax'
      });
      this.authService.userIsValidate()
        .subscribe({
          next: (response: any) => {
            if (response.isValidated) {
              let promotionCode = this.cookieService.get('redeem');
              let checkinVendor = this.cookieService.get('vendorId');
              let transferAcount = this.cookieService.get('user_token');
              if (promotionCode) {
                this.router.navigateByUrl('/activate-promotion');
              } else if (checkinVendor) {
                this.router.navigateByUrl('/check-in');
              } else if (transferAcount) {
                this.router.navigateByUrl('/transfer-account');
              } else {
                this.cookieService.set('isAccountInvalid', 'false');
                this.router.navigateByUrl('/loyalty/orders');
              }
            } else {
              this.cookieService.set('isAccountInvalid', 'true');
              this.router.navigateByUrl('/validate');
            }
          },
          error: (error) => {
            console.log('message-error', error.status);
          },
          complete: () => console.info('complete')
        });
    }
  }

  checkError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  }

  tapPass() {
    this.passicon = !this.passicon;
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  protected readonly environment = environment;
}

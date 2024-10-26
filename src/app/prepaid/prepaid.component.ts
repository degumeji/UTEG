import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {ProfileService} from 'src/services/profile.service';
import {TransactionService} from 'src/services/transactions.service';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-prepaid',
  templateUrl: './prepaid.component.html'
})
export class PrepaidComponent {

  public balance = 0;
  public isLoading = true;
  public statusAR = false;
  public isARChecked = false;

  public barcodeToken = "";
  public imagePath: any;

  constructor(
    private router: Router,
    public profileService: ProfileService,
    private transactionService: TransactionService,
    private translate: TranslateService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer) {
    /*  let isAutoReloadActive = this.cookieService.get('isAutoReloadActive');
      this.statusAR = JSON.parse(isAutoReloadActive);*/
  }

  ngOnInit(): void {
    this.getBalance();
    this.getBarCode();
  }

  getBalance() {
    this.isLoading = true;
    this.profileService.user_quickpay_balance()
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.balance = response.amount;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 403) {
            this.onLogout();
          }
        }
      });
  }

  goToAutoReload() {
    /*    this.statusAR = JSON.parse(this.cookieService.get('isAutoReloadActive'));
        if (this.statusAR) {
          this.onAutoReload();
        } else {
          this.cookieService.set('ARChecked', 'true');
          this.router.navigate(['/loyalty/auto-reload']);
        }*/
  }

  onAutoReload() {
    this.isLoading = true;
    var data = {
      user_billingprofile: null
    }
    this.transactionService.autoReloadoff(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.cookieService.set('isAutoReloadActive', 'false', {
              path: '/',
              sameSite: 'Strict'
            });
            this.cookieService.set('ARChecked', 'false', {
              path: '/',
              sameSite: 'Strict'
            });
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
          this.isLoading = false;
        }
      });
  }

  onLogout() {
    this.cookieService.deleteAll();
    this.cookieService.deleteAll('/uteg/loyalty');
    this.router.navigate(['/']);
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant('close_btn'), {
      duration: 8000,
    });
  }

  getBarCode() {

    this.profileService.getBarCode()
      .subscribe({
        next: (response: any) => {
          if (response) {
            if (response.barcode) {
              this.barcodeToken = response.token;
              this.getImgFromBase64(response.barcode);
            }

          }
        },
        error: (error) => {

          console.log("message-error", error.status);
        },
        complete: () => console.info('complete')
      });
  }

  getImgFromBase64(base64String: string) {
    this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(base64String);
  }
}

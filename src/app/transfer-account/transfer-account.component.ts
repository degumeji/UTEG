import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {NgxSpinnerService} from 'ngx-spinner';
import {environment} from 'src/environments/environment';
import {LanguageOption} from 'src/interfaces/sideMenu';
import {AuthGuardService} from 'src/services/auth-guard.service';
import {ProfileService} from 'src/services/profile.service';
import {TransactionService} from 'src/services/transactions.service';

@Component({
  selector: 'app-transfer-account',
  templateUrl: './transfer-account.component.html'
})
export class TransferAccountComponent implements OnInit {

  public viewStep1 = true;
  public viewStep2 = false;
  public viewStep3 = false;
  public finalStepTitle: string;
  public logoUrl: string;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private transactionService: TransactionService,
    private authguardService: AuthGuardService,
    private cookieService: CookieService,
    private activeroute: ActivatedRoute,
    private _snackBar: MatSnackBar) {
    this.finalStepTitle = "";
    this.logoUrl = environment.baseAssetsUrl + "assets/images/logo-login.png";
  }

  ngOnInit(): void {
    let userToken = this.activeroute.snapshot.queryParams['user_token'];
    if (userToken) {
      this.cookieService.set("user_token", userToken, {
        path: '/',
        sameSite: 'Lax'
      });
      this.cookieService.set("isPendingTransferAccount", 'true');
    }

    this.spinner.show();
    if (this.authguardService.isLoggedIn()) {
      this.spinner.hide();
      this.viewStep2 = true;
      this.viewStep1 = false;
    } else {
      this.spinner.hide();
    }
  }

  transferEgift() {
    this.spinner.show();
    let user_token = this.cookieService.get("user_token");
    console.log("user_token", user_token);
    this.profileService.transferEgift(user_token)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.finalStep(this.translate.instant("transfer_view.opt3") + response.amount + this.translate.instant("transfer_view.opt3_1"));
        },
        error: (error) => {
          this.spinner.hide();
          console.log("message-error", error.error.error.errors[0].message);
          if (error.status === 409) {
            this.finalStep(this.translate.instant("transfer_view.opt4"));
          } else {
            this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Invalid Token');
          }
        },
        complete: () => console.info('complete')
      });
  }

  finalStep(msg: string) {
    this.cookieService.set("user_token", "");
    this.cookieService.set("isPendingTransferAccount", 'false');
    this.viewStep3 = true;
    this.viewStep2 = false;
    this.viewStep1 = false;
    this.finalStepTitle = msg;
  }

  goToHome() {
    this.cookieService.set("user_token", "");
    this.cookieService.set("isPendingTransferAccount", 'false');
    this.router.navigateByUrl("/loyalty/orders");
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant("close_btn"), {
      duration: 8000,
    });
  }

  protected readonly environment = environment;
}

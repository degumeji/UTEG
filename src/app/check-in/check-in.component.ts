import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {NgxSpinnerService} from 'ngx-spinner';
import {environment} from 'src/environments/environment';
import {AuthGuardService} from 'src/services/auth-guard.service';
import {ProfileService} from 'src/services/profile.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html'
})
export class CheckInComponent implements OnInit {

  public viewStep0 = true;
  public viewStep1 = false;
  public viewStep2 = false;
  public viewStep3 = false;
  public logoUrl: string;
  public genericMsg = "";
  public isLoading = false;

  public paymentMethods: any[] = [];
  public rewards: any[] = [];
  public selectedRewardIndex: number = 0;
  public selectedPayMethodIndex: number = 0;
  private selectedPaymentMethod: string | null = null;
  private selectedReward: any;
  private pos_session: any;
  private tableId: any;
  public url: string = "";

  constructor(
    private router: Router,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService,
    private authguardService: AuthGuardService,
    private cookieService: CookieService,
    private activeroute: ActivatedRoute,
    private _snackBar: MatSnackBar) {
    this.logoUrl = environment.baseAssetsUrl + "assets/images/logo-login.png";
  }

  ngOnInit(): void {
    let vendorId = this.activeroute.snapshot.queryParams['vendor_id'];
    let table = this.activeroute.snapshot.queryParams['table'];
    this.url = this.activeroute.snapshot.queryParams['url'];
    if (vendorId && table) {
      this.cookieService.set("vendorId", vendorId);
      this.cookieService.set("table", table);
      this.cookieService.set("isPendingCheckIn", 'true');
    }
    this.paymentMethods = ["checkin_view.opt3_1", "checkin_view.opt3_2", "checkin_view.opt3_3"];


    let isCheckinSelected = this.cookieService.get("checkinSelected");
    if (isCheckinSelected) {
      this.goToCheckin();
    }
  }

  goToCheckin() {
    this.spinner.show();
    if (this.authguardService.isLoggedIn()) {
      this.cookieService.set("checkinSelected", "");
      this.spinner.hide();
      this.viewStep2 = true;
      this.viewStep1 = false;
      this.viewStep0 = false;
    } else {
      this.cookieService.set("checkinSelected", "true");
      this.viewStep1 = true;
      this.viewStep0 = false;
      this.spinner.hide();
    }
  }

  startCheckin() {
    this.viewStep3 = true;
    this.viewStep2 = false;
    this.viewStep1 = false;
    this.getRewards();
  }

  getRewards() {
    this.isLoading = true;
    this.profileService.user_rewards()
      .subscribe({
        next: (response: any) => {
          if (response) {
            for (let reward of response.data) {
              if (reward.catalog.id != environment.catalogId) {
                this.rewards.push(reward);
              }
            }
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.log("user_rewards error: " + error.error.error.errors[0].message);
        },
        complete: () => console.info('complete')
      });
  }

  onSelectPaymentMethod(paymentMethod: string, index: number) {
    this.selectedPayMethodIndex = index;
    switch (paymentMethod) {
      case "checkin_view.opt3_1":
        this.selectedPaymentMethod = "loyalty_pay";
        break;
      case "checkin_view.opt3_2":
        this.selectedPaymentMethod = "quickpay";
        break;
      case "checkin_view.opt3_3":
        this.selectedPaymentMethod = null
        break;
      default:
        this.selectedPaymentMethod = null
        break;
    }
  }

  onSelectReward(rewardId: any, index: number) {
    this.selectedRewardIndex = index;
    this.selectedReward = rewardId;
  }

  onCheckin() {
    this.isLoading = true;
    let vendorId = this.cookieService.get("vendorId");
    this.tableId = this.cookieService.get("table");
    this.profileService.checkin(vendorId, this.tableId, this.selectedPaymentMethod)
      .subscribe({
        next: (response: any) => {
          this.pos_session = response.pos_session.id;
          if (this.selectedReward) {
            this.onRedeemReward();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.openSnackBar(this.translate.instant("checkin_view.alert"));
        }
      });
  }

  onRedeemReward() {
    this.profileService.rewardRedeem(this.pos_session, this.selectedReward)
      .subscribe({
        next: (response: any) => {
          this.cookieService.set("vendorId", "");
          this.cookieService.set("table", "");
          this.cookieService.set("isPendingCheckIn", 'false');
          this.openSnackBar(this.translate.instant("checkin_view.alert1") + this.tableId);
          this.router.navigateByUrl("/loyalty/history");
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }

  goToPay(url: any) {
    this.cookieService.set("vendorId", "");
    this.cookieService.set("table", "");
    this.cookieService.set("isPendingCheckIn", 'false');
    window.open(url, '_blank');
  }

  goToHome() {
    this.cookieService.set("vendorId", "");
    this.cookieService.set("table", "");
    this.cookieService.set("isPendingCheckIn", 'false');
    this.router.navigateByUrl("/loyalty/orders");
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant("close_btn"), {
      duration: 8000,
    });
  }

  protected readonly environment = environment;
}

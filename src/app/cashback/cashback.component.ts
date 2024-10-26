import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from 'src/environments/environment';
import {ProfileService} from 'src/services/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {BreakpointObserver} from "@angular/cdk/layout";
import {WalletsService} from '../../services/wallets.service';
import {AngularDeviceInformationService} from 'angular-device-information';
import {CookieService} from 'ngx-cookie-service';
import {NgxSpinnerService} from "ngx-spinner";
import {IRewards} from "../../models/utils";

@Component({
  selector: 'app-cashback',
  animations: [
    trigger('cardFlip', [
      state('default', style({
        transform: 'none'
      })),
      state('flipped', style({
        transform: 'rotateY(180deg)'
      })),
      transition('default => flipped', [
        animate('400ms')
      ]),
      transition('flipped => default', [
        animate('400ms')
      ])
    ])
  ],
  templateUrl: './cashback.component.html',
  styleUrls: ['./cashback.component.scss']
})
export class CashbackComponent implements OnInit {

  private menuBreakPoint = 768;
  public barcodeToken = "";
  public imagePath: any;
  public points: number = 0;
  public showPoints = false;
  isFlipped = false;
  allowFlip = true;
  public bannerUrl: string;

  public downloadWalletClass = '';
  private operativeSystem = '';
  private appleOperativeSystems = [
    'Apple',
    'iOS'];
  showWalletButton = false;
  isGoogleWallet = false;

  public rewards: Array<IRewards> = [];

  toggle() {
    if (this.allowFlip) {
      this.isFlipped = !this.isFlipped;
    }
  }

  constructor(
    private router: Router,
    private _sanitizer: DomSanitizer,
    private observer: BreakpointObserver,
    private profileService: ProfileService,
    private walletsService: WalletsService,
    private spinner: NgxSpinnerService,
    private deviceInformationService: AngularDeviceInformationService,
    private cookieService: CookieService) {
    this.bannerUrl = environment.baseAssetsUrl + "assets/images/protecto_image_cashback.png";
    this.operativeSystem = deviceInformationService.getDeviceInfo().os;
  }

  ngOnInit(): void {
    this.getRewards();
    /*    this.getBalance();*/
    this.getBarCode();
  }

  ngAfterViewInit(): void {
    /*    this.observer
          .observe([`(min-width: ${this.menuBreakPoint}px)`])
          .subscribe((res: any) => {
            if (res.matches) {
              this.isFlipped = false;
            }
            this.allowFlip = !res.matches;
          });*/
    this.showWalletButton = (this.operativeSystem != 'Linux') && this.allowFlip;
    if (this.showWalletButton) {
      this.isGoogleWallet = !this.appleOperativeSystems.includes(this.operativeSystem);
      if (this.allowFlip) {
        this.setWalletButton();
      }
    }
  }

  setWalletButton() {
    this.downloadWalletClass = `cashback__wallet-button--${this.isGoogleWallet ? 'google' : 'apple'}-${this.cookieService.get("defaultLang")}`;
  }

  downloadWallet() {
    if (this.isGoogleWallet) {
      this.walletsService.downloadGoogleWallet()
        .subscribe({
          next: (response: any) => {
            window.open(response.google_pay_pass_url);
          },
          error: (error) => {
          },
          complete: () => {
          }
        });
    } else {
      this.walletsService.downloadAppleWallet()
        .subscribe((response => {
          let blob: Blob = response.body as Blob;
          const a = document.createElement('a');
          a.download = 'pass.pkpass';
          a.href = window.URL.createObjectURL(blob);
          a.click();
        }));
    }
  }

  getRewards() {
    this.spinner.show();
    this.profileService.user_rewards()
      .subscribe({
        next: (response: any) => {
          if (response) {
            for (let balance of response.balances) {
              if (balance.id == environment.currencyId) {
                this.points = balance.balance;
              }
            }

            for (let reward of response.data) {
              if (reward.template.id == environment.points_templateid) {
                const newReward: IRewards = {
                  name: reward.name,
                  maxValue: reward.cost,
                  valueNow: this.calculateRewardValueNow(reward.progress, reward.cost),
                  progress: reward.progress,
                  available: reward.available
                }
                this.cookieService.set('cost', reward.cost);
                this.rewards.push(newReward);
              }
            }
            this.spinner.hide();
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log("user_rewards error: " + error.error.error.errors[0].message);
        },
        complete: () => console.info('complete')
      });
  }

  calculateRewardValueNow = (progress: number, cost: number) => (progress * 100) / cost;

  /*  getBalance() {
      this.profileService.user_quickpay_balance()
        .subscribe({
          next: (response: any) => {
            this.points = response.amount;
          },
          error: (error) => {
            if (error.status === 403) {
              this.onLogout();
            }
          }
        });
    }*/

  onLogout() {
    this.cookieService.deleteAll();
    this.cookieService.deleteAll('/cocinaabierta/loyalty');
    this.router.navigate(['/']);
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

  fixedWithoutRound(number: any) {
    var num: string = number.toString();
    if (num.includes(".")) {
      num = num.slice(0, (num.indexOf(".")) + 3);
      if (num.toString().length == 3) {
        num = num + "0";
      }
      if (num.charAt(0) == "-") {
        if (num.toString().length == 4) {
          num = num + "0";
        }
      }
    } else {
      num = num + ".00";
    }
    return num;
  }

  protected readonly environment = environment;
}

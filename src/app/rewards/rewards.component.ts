import {Component, OnInit} from "@angular/core";
import {PageEvent} from "@angular/material/paginator";
import {Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {NgxSpinnerService} from "ngx-spinner";
import {environment} from "src/environments/environment";
import {Paginator} from "src/interfaces/app";
import {Coupon} from "src/models/utils";
import {ProfileService} from "src/services/profile.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html'
})
export class RewardsComponent implements OnInit {


  public rewards: any[] = [];
  public expiringRewards = [];
  public maxValue = 0;
  public progressValue = 0;
  public progressValueCalc = 0;
  public showExpiringListPuntos = false;

  public bronzeTier: number;
  public silverTier: number;
  public goldTier: number;
  public employeeTier: number;
  public ambassadorTier: number;
  public conveniosTier: number;
  public tierImg = "";
  public currentTierId = 0;
  public currentTierDescription = "";
  public nextTierName = "";
  public nextTierDescription = "";


  pageSizeOptions = [5, 10, 25];

  disabledPaginator = false;

  paginator: Paginator = {
    page: 0,
    limit: 5,
    total: 0
  }

  public isEmpty = false;
  public isError = false;
  public defaultImg = "";
  public protectoImg = "";
  public coupons: Array<Coupon>;


  constructor(
    private router: Router,
    private cookieService: CookieService,
    private profileService: ProfileService,
    private spinner: NgxSpinnerService,) {
    this.bronzeTier = environment.bronzeId;
    this.silverTier = environment.silverId;
    this.goldTier = environment.goldId;
    this.employeeTier = environment.goldId;
    this.ambassadorTier = environment.ambassadordId;
    this.conveniosTier = environment.conveniosId;
    this.defaultImg = environment.baseAssetsUrl + 'assets/images/logo.png';
    this.coupons = new Array<Coupon>();
    this.protectoImg = environment.baseAssetsUrl + "assets/images/protecto_image.png";
  }

  ngOnInit(): void {
    this.getRewards();
    this.getCoupons();

  }

  getRewards() {
    this.spinner.show();
    this.profileService.user_rewards()
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            for (let reward of response.data) {
              if (reward.catalog.id != environment.catalogId &&
                (reward.template.id == environment.item_templateid ||
                  reward.template.id == environment.points_templateid)) {
                this.rewards.push(reward);
              }
            }
            this.currentTierId = response.tier.current.id;
            this.currentTierDescription = response.tier.current.name;
            this.nextTierName = response.tier.next.name;
            this.nextTierDescription = response.tier.next.description;
            if (this.currentTierId != this.goldTier) {
              this.progressValue = response.tier.next.progress;
              this.maxValue = response.tier.next.amount;
              this.progressValueCalc = (response.tier.next.progress * 100) / this.maxValue;
            }
            this.getCurrentLevel(response.tier.current.id);
          }
        },
        error: (error) => {
          this.spinner.hide();
        },
        complete: () => console.info('complete')
      });
  }

  getCoupons() {
    this.isError = false;
    const paginatorRequest: Paginator = {
      page: this.paginator.page + 1,
      limit: this.paginator.limit
    };
    this.disabledPaginator = true;
    this.profileService.user_coupons(paginatorRequest)
      .subscribe({
        next: (response: any) => {
          this.paginator.total = response.count;
          let temp_coupons = [];
          const currentTotalPages = response.total_pages;
          for (let rewardDetail of response.data) {
            if (
              (rewardDetail.description != null || rewardDetail.description != "") &&
              (rewardDetail.template.id == environment.limited_templateid &&
                rewardDetail.available > 0) ||
              rewardDetail.template.id == environment.info_templateid
            ) {
              try {
                let coupon = new Coupon();
                let description = rewardDetail.description
                  .replace(/\" {/g, '{')
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/} \"/g, '}');
                coupon = JSON.parse(description);
                coupon.id = rewardDetail.template.id;
                coupon.name = rewardDetail.name;
                coupon.available = rewardDetail.available;
                temp_coupons.push(coupon);
              } catch (error) {
                // this.isError = true;
                let coupon = new Coupon();
                coupon.legales = rewardDetail.description;
                coupon.id = rewardDetail.template.id;
                coupon.name = rewardDetail.name;
                coupon.available = rewardDetail.available;
                temp_coupons.push(coupon);
              }
            }
          }
          if (temp_coupons.length > 0) {
            this.coupons = temp_coupons.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
            this.isEmpty = false;
          } else {
            this.isEmpty = true;
          }
          this.disabledPaginator = currentTotalPages === 0;
        },
        error: (error) => {
          if (error.status === 403) {
            this.onLogout();
          }
        },
        complete: () => console.info('complete')
      });
  }

  handlePageEvent(event: PageEvent) {
    this.paginator.limit = event.pageSize;
    this.paginator.page = event.pageIndex;
    this.getCoupons();
  }

  getFormatUTCDate(timestampdate: any) {
    if (timestampdate != undefined) {
      let d = new Date(timestampdate * 1000);
      return d.getUTCDate() + "/" + (d.getUTCMonth() + 1) + "/" + +d.getUTCFullYear();
    }
    return "";
  }

  getCurrentLevel(tierId: number) {
    if (tierId != undefined) {
      switch (tierId) {
        case this.bronzeTier:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_bronce.png";
          break;
        case this.silverTier:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_plata.png";
          break;
        case this.goldTier:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_oro.png";
          break;
        case this.employeeTier:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_black.png";
          break;
        case this.ambassadorTier:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_black.png";
          break;
        default:
          this.tierImg = environment.baseAssetsUrl + "assets/images/tarjeta_niveles_bronce.png";
          break;
      }
    }
  }

  onLogout() {
    this.cookieService.delete('accesstoken', '/');
    this.cookieService.deleteAll();
    this.router.navigate(['/']);
  }
}

import {Component, OnInit} from "@angular/core";
import {PageEvent} from "@angular/material/paginator";
import {Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {environment} from "src/environments/environment";
import {Paginator} from "src/interfaces/app";
import {Coupon} from "src/models/utils";
import {ProfileService} from "src/services/profile.service";

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html'
})
export class CouponsComponent implements OnInit {
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
  public coupons: Array<Coupon>;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private profileService: ProfileService) {
    this.defaultImg = environment.baseAssetsUrl + 'assets/images/logo.png';
    this.coupons = new Array<Coupon>();
  }

  ngOnInit(): void {
    this.getCoupons();
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
                temp_coupons.push(coupon);
              } catch (error) {
                // this.isError = true;
                let coupon = new Coupon();
                coupon.legales = rewardDetail.description;
                coupon.id = rewardDetail.template.id;
                coupon.name = rewardDetail.name;
                temp_coupons.push(coupon);
              }
            }
          }
          if (temp_coupons.length > 0) {
            this.coupons = temp_coupons.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
            this.isEmpty = false;
          } else {
            this.isEmpty = true;
            this.disabledPaginator = false;
          }
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

  seeDetail(transaction: any): void {
    this.router.navigate(["/coupon-detail", JSON.stringify(transaction)]);
  }

  onLogout() {
    this.cookieService.delete('accesstoken', '/');
    this.cookieService.deleteAll();
    this.router.navigate(['/']);
  }
}

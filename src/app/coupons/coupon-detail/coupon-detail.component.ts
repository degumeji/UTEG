import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: 'app-coupon-detail',
    templateUrl: './coupon-detail.component.html'
  })
  export class CouponDetailComponent {

    public coupon: any;

    constructor(private activeroute: ActivatedRoute) {
      this.coupon=JSON.parse(this.activeroute.snapshot.params["coupon"]);
    }
  }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { Paginator } from 'src/interfaces/app';
import { AuthGuardService } from 'src/services/auth-guard.service';
import { ModalService } from 'src/services/modal.service';
import { ProfileService } from 'src/services/profile.service';
import { TransactionService } from 'src/services/transactions.service';

@Component({
  selector: 'app-activate-promotion',
  templateUrl: './activate-promotion.component.html'
})
export class ActivatePromotionComponent implements OnInit {

  public viewStep1 = true;
  public viewStep2 = false;
  public viewStep3 = false;
  public logoUrl:string;
  public genericMsg = "";
  public isLoading = false;

  constructor(
    private router : Router,
    private modalService : ModalService,
    private translate : TranslateService,
    private spinner: NgxSpinnerService,
    private profileService : ProfileService,
    private transactionService : TransactionService,
    private authguardService : AuthGuardService,
    private cookieService : CookieService,
    private activeroute: ActivatedRoute) {
      this.logoUrl = environment.baseAssetsUrl + "assets/images/logo-login.png";
  }

  ngOnInit(): void {
    let promotionCode = this.activeroute.snapshot.queryParams['redeem'];
    if(promotionCode){
      this.cookieService.set("redeem", promotionCode);
      this.cookieService.set("isPendingPromotion",'true');
      // console.log("promotionCode",this.cookieService.get("redeem"));
    }

    this.spinner.show();
    if(this.authguardService.isLoggedIn()){
      this.spinner.hide();
      this.viewStep2 = true;
      this.viewStep1 = false;
    } else {
      this.spinner.hide();
    }
  }

  activatePromotion() {
    this.isLoading=true;
    let promotionCode = this.cookieService.get("redeem");
    this.profileService.activatePromotion(promotionCode)
    .subscribe({
      next: (response:any) => {
        this.validatePromotion();
      },
      error: (error) => {
        this.isLoading=false;
        console.log("message-error", error.status);
      }
    });
  }

  validatePromotion() {
    this.spinner.show();
    const paginatorRequest: Paginator = {
      page: 1,
      limit: 1
    };
    this.transactionService.getTransactions(paginatorRequest)
    .subscribe({
      next: (response:any) => {
        for(let transaction of response.data) {
          console.log(transaction.rewards[0]);
          if (transaction.rewards[0].perks[0] == "using an award link") {
            this.spinner.hide();
            this.cookieService.set("redeem", "");
            this.cookieService.set("isPendingPromotion",'false');
            this.isLoading=false;
            this.viewStep3 = true;
            this.viewStep2 = false;
            this.viewStep1 = false;
          } else {
            this.spinner.hide();
            this.genericMsg = this.translate.instant("promotion_view.alert1");
            this.openModal('modal-generic');
          }
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.isLoading=false;
      }
    });
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
    this.isLoading=false;
    if(this.authguardService.isLoggedIn()){
      this.router.navigateByUrl("/loyalty/history");
    } else {
      this.router.navigateByUrl("");
    }
  }

  protected readonly environment = environment;
}

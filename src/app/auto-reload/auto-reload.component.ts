import {Component, Input} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {CookieService} from "ngx-cookie-service";
import {NgxSpinnerService} from "ngx-spinner";
import {TransactionService} from "src/services/transactions.service";

@Component({
  selector: 'app-auto-reload',
  templateUrl: './auto-reload.component.html'
})
export class AutoReloadComponent {

  public valueAR = 0;
  public valueBB = 0;
  public currentStep = 1;

  // form
  public recipient_name = "";
  public recipient_email = "";
  public sender_name = "";
  public sender_email = "";
  public message = "";
  public date = 0;

  //cc
  public cc_name = "";
  public cc_nick = "";
  public cc_number = "";
  public cc_cvc = "";
  public cc_exp_mm = "";
  public cc_exp_yy = "";
  public cc_postalcode = "";

  //in case cc is selected
  public cc_selected = 0;
  public cc_selected_type = "";
  public cc_id = null;

  public showARView = true;
  public showBBView = true;
  public showPaymentView = true;
  public showAROtherView = false;
  public showBBOtherView = false;
  public showSelectedAmount = false;
  public showSelectedBalance = false;
  public showSelectedCc = false;
  public showAddCardView = false;

  ccList: any[] = [];
  public showCardsList = false;
  public isLoading = false;
  public isARChecked = false;
  public selectedPayMethodIndex: number = 0;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private cookieService: CookieService,
              private transactionService: TransactionService,
              private translate: TranslateService,
              private _snackBar: MatSnackBar) {
    this.onGetCC();
    let isARChecked = this.cookieService.get("ARChecked");
    this.isARChecked = isARChecked ? true : false;
  }


  onGetCC() {
    this.ccList.length = 0;
    this.transactionService.getCC()
      .subscribe({
        next: (response: any) => {
          if (response.data.length > 0) {
            for (let cc of response.data) {
              this.ccList.push(cc);
            }
            if (this.ccList.length > 0) {
              this.showCardsList = true;
            }
          } else {
            this.showCardsList = false;
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
  }

  onSaveCC() {
    var data = {
      name: this.cc_name,
      number: this.cc_number,
      expiry_month: this.cc_exp_mm,
      expiry_year: this.cc_exp_yy,
      cvv: this.cc_cvc,
      description: "",
      zip_code: this.cc_postalcode
    }
    this.spinner.show();
    this.transactionService.saveCC(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            this.showAddCardView = false;
            this.openSnackBar(this.translate.instant("egift_view.sent_msgs.msg"));
            this.onGetCC();
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
  }

  onAutoReload() {
    this.spinner.show();
    var data = {
      amount: this.valueAR,
      threshold: this.valueBB,
      user_billingprofile: this.cc_id
    }

    this.transactionService.autoReload(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            this.onBackToARView();
            this.onBackToBBView();
            this.onBackToPaymentView()
            this.isARChecked ? this.cookieService.set("isAutoReloadActive", 'true') : this.cookieService.set("isAutoReloadActive", 'false');
            this.cookieService.set("ARChecked", 'true');
            this.openSnackBar(this.translate.instant("egift_view.sent_msgs.msg"));
            this.isLoading = false;
            this.router.navigate(["/loyalty/orders"]);
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.cookieService.set("ARChecked", 'false');
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
          this.isLoading = false;
        }
      });
  }

  reloadAmountSelected(value: any) {
    this.valueAR = value;
    this.onARCustomValueNext();
  }

  balanceBelowSelected(value: any) {
    this.valueBB = value;
    this.onBBCustomValueNext();
  }

  enableRACustomValue() {
    this.valueAR = 0;
    this.showARView = false;
    this.showAROtherView = true;
  }

  enableBBCustomValue() {
    this.valueBB = 0;
    this.showBBView = false;
    this.showBBOtherView = true;
  }

  onARCustomValueNext() {
    this.showAROtherView = false;
    if (this.valueAR != 0) {
      this.showSelectedAmount = true;
      this.showARView = false;
    } else {
      this.showARView = true;
    }
  }

  onBBCustomValueNext() {
    this.showBBOtherView = false;
    if (this.valueBB != 0) {
      this.showSelectedBalance = true;
      this.showBBView = false;
    } else {
      this.showBBView = true;
    }
  }

  onCcSelected(index: any, cardSelected: any) {
    this.selectedPayMethodIndex = index;
    this.cc_id = cardSelected.id;
    this.cc_selected = cardSelected.card;
    this.cc_selected_type = cardSelected.type;
    this.showSelectedCc = true;
    this.showPaymentView = false;
  }

  onBackToARView() {
    this.showARView = true;
    this.showSelectedAmount = false;
  }

  onBackToBBView() {
    this.showBBView = true;
    this.showSelectedBalance = false;
  }

  onBackToPaymentView() {
    this.showSelectedCc = false;
    this.showPaymentView = true;
  }

  onShowAddCardView() {
    this.showAddCardView = true;
  }

  onHideAddCardView() {
    this.showAddCardView = false;
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant("close_btn"), {
      duration: 8000,
    });
  }

  goBack() {
    this.router.navigate(['/loyalty/prepaid'])
  }
}

import {Component} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {NgxSpinnerService} from "ngx-spinner";
import {TransactionService} from "src/services/transactions.service";

@Component({
  selector: 'app-reload',
  templateUrl: './reload.component.html',
  styleUrls: ['./reload.component.scss']
})
export class ReloadComponent {

  public value = 0;
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
  public cc_postalcode = '11111';

  //in case cc is selected
  public cc_selected = 0;
  public cc_selected_type = "";
  public cc_id = null;

  public showAmountView = true;
  public showOtherView = false;
  public showPaymentView = false;
  public showSelectedCc = false;
  public showCompleteView = false;
  public showAddCardView = false;

  ccList: any[] = [];
  public showCardsList = false;
  public isLoading = false;

  public selectedPayMethodIndex: number = 0;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private transactionService: TransactionService,
              private translate: TranslateService,
              private _snackBar: MatSnackBar) {
    this.onGetCC();
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
      description: this.cc_nick,
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

  onReload() {
    this.isLoading = true;
    var data = {
      user_billingprofile: this.cc_id,
      amount: this.value
    }

    this.transactionService.reload(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.showAmountView = false;
            this.showOtherView = false;
            this.showPaymentView = false;
            this.isLoading = false;
            this.openSnackBar(this.translate.instant("reload_view.complete") + '$' + this.value);
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
          this.isLoading = false;
        }
      });
  }

  valueSelected(value: any) {
    this.value = value;
    this.onCustomValueNext();
  }

  enableCustomValue() {
    this.value = 0;
    this.showAmountView = false;
    this.showOtherView = true;
  }

  onCcSelected(index: any, cardSelected: any) {
    this.selectedPayMethodIndex = index;
    this.cc_id = cardSelected.id;
    this.cc_selected = cardSelected.card;
    this.cc_selected_type = cardSelected.type;
    this.showSelectedCc = true;
  }

  onCustomValueNext() {
    this.showOtherView = false;
    if (this.value != 0) {
      this.showAmountView = false;
      this.showPaymentView = true;
    } else {
      this.showAmountView = true;
      this.showPaymentView = false;
    }
  }

  onBackToAmountView() {
    this.showAmountView = true;
    this.showOtherView = false;
    this.showPaymentView = false;
  }

  onBackToPaymentView() {
    this.showSelectedCc = false;
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

  onlyNumbersInput(event: Event, ngModelValue: any) {
    ngModelValue = this.notAllowSpecialChars(event);
  }

  notAllowSpecialChars(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    // Replace non-numeric characters using a regular expression
    const sanitizedValue = inputValue.replace(/\D/g, ''); // \D matches non-digits
    // Update the input value with sanitized content
    if (sanitizedValue !== inputValue) {
      inputElement.value = sanitizedValue;
    }
    return inputElement.value;
  }
}

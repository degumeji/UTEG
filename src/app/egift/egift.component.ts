import {Component, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {TransactionService} from 'src/services/transactions.service';
import * as moment from 'moment-timezone';
import {NgxSpinnerService} from 'ngx-spinner';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-egift',
  templateUrl: './egift.component.html',
  styleUrls: ['./egift.component.scss']
})
export class EgiftComponent {

  @ViewChild('picker') picker: any;
  private datetimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';
  private datetimeTotalFormat = 'MMM D YYYY h:mm A';
  public value = 0;
  public valueOption = '';
  public currentStep = 1;
  public customValue = false;
  public mvalueSelected = '';
  public fechaSelected = '';
  public alertConfirmRecipientEmail = '';
  public dateTypeSelected = 'today';
  public isValidConfirmRecipientEmail = true;
  public minDate = moment().toDate();
  public maxLengthMessage = 300;

  // form
  public recipient_name = '';
  public recipient_email = '';
  public confirm_recipient_email = '';
  public sender_name = '';
  public sender_email = '';
  public sender_confirm_email = '';
  public recipient_confirm_email = '';
  public message = '';
  public egiftDate = moment().toDate();

  //cc
  public cc_name = '';
  public cc_number = '';
  public cc_cvc = '';
  public cc_exp_mm = '';
  public cc_exp_yy = '';
  public cc_postalcode = '11111';

  //in case cc is selected
  public cc_selected = 0;
  public cc_id = null;

  public viewStep1 = true;
  public viewStep2 = false;
  public viewStep3 = false;
  public viewThanks = false;

  ccList: any[] = [];
  public showPaymentView = true;
  public showAddCardView = false;
  public showCardsList = false;
  public isLoading = false;
  public showSelectedCc = false;
  public showSenderEmailAlert = false;
  public showSameMailAlert = false;
  public showRecipientEmailAlert = false;

  public selectedPayMethodIndex: number = 0;

  //Amount buttons
  public amounts = [
    {value: 10, text: '10'},
    {value: 20, text: '20'},
    {value: 30, text: '30'},
    {value: 50, text: '50'}
  ]

  constructor(private router: Router,
              private transactionService: TransactionService,
              private translate: TranslateService,
              public cookieService: CookieService,
              private spinner: NgxSpinnerService,
              private _snackBar: MatSnackBar) {
  }

  onChangeRecipientEmail(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.recipient_email = textvalue.trim().toLowerCase();
    if (this.recipient_confirm_email) {
      this.showRecipientEmailAlert = this.recipient_confirm_email.trim().toLowerCase() !== this.recipient_email;
    }
    this.showSameMailAlert = this.sender_email === this.recipient_email.trim().toLowerCase();
  }

  onChangeSenderEmail(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.sender_email = textvalue.trim().toLowerCase();
    if (this.sender_confirm_email) {
      this.showSenderEmailAlert = this.sender_confirm_email.trim().toLowerCase() !== this.sender_email;
    }
    this.showSameMailAlert = this.sender_email === this.recipient_email.trim().toLowerCase();
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
            this.showCardsList = true;
          } else {
            this.showCardsList = false;
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later', true);
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
      description: '',
      zip_code: this.cc_postalcode
    }
    this.spinner.show();
    this.transactionService.saveCC(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            this.showAddCardView = false;
            this.showPaymentView = true;
            this.openSnackBar(this.translate.instant('egift_view.sent_msgs.msg'));
            this.onGetCC();
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later', true);
        }
      });
  }

  onSendEfigt() {
    let billing;
    if (this.cc_id != null) {
      billing = {
        id: parseInt(this.cc_id)
      }
    } else {
      billing = {
        name: this.cc_name,
        number: this.cc_number,
        expiry: {
          month: this.cc_exp_mm,
          year: this.cc_exp_yy
        },
        cvv: this.cc_cvc,
        zip_code: this.cc_postalcode
      }
    }

    const data: any = {
      amount: this.value,
      buyer: {
        name: this.sender_name,
        email: this.sender_email
      },
      recipient: {
        name: this.recipient_name,
        email: this.recipient_email
      },
      message: this.message,
      billing: billing,
      image_url: null
    };
    if (this.dateTypeSelected === 'future') {
      data.date = moment(this.egiftDate).utc().format(this.datetimeFormat);
      data.formattedDate = moment(this.egiftDate).format(this.datetimeTotalFormat);
      data.release_date = Math.floor(new Date(this.egiftDate).getTime() / 1000);
    }
    this.spinner.show();
    this.transactionService.sendEgift(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.spinner.hide();
            this.viewStep1 = false;
            this.viewStep2 = false;
            this.viewStep3 = false;
            this.viewThanks = true;
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.isLoading = false;
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later', true);
        }
      });
  }

  onRecipientConfirmEmailChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.recipient_confirm_email = textvalue.trim().toLowerCase();
    this.showRecipientEmailAlert = this.recipient_email.trim().toLowerCase() !== this.recipient_confirm_email;
  }

  onSenderConfirmEmailChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.sender_confirm_email = textvalue.trim().toLowerCase();
    this.showSenderEmailAlert = this.sender_email.trim().toLowerCase() !== this.sender_confirm_email;
  }

  valueSelected(value: any) {
    this.customValue = false;
    this.value = value;
    this.mvalueSelected = value.toString();
    this.valueOption = value.toString();
  }

  onCcSelected(index: any, cardSelected: any) {
    this.selectedPayMethodIndex = index;
    this.cc_id = cardSelected.id;
    this.cc_selected = cardSelected.card;
    this.showSelectedCc = true;
    this.showPaymentView = false;
  }

  enableCustomValue(value: any) {
    this.value = 0;
    this.mvalueSelected = value;
    this.customValue = !this.customValue;
    this.valueOption = 'custom';
  }

  isValueSelected(value: string): boolean {
    return this.mvalueSelected === value;
  }

  onShowAddCardView() {
    this.showPaymentView = false;
    this.showAddCardView = true;
  }

  onHideAddCardView() {
    this.showAddCardView = false;
    this.showPaymentView = true;
  }

  onBackToPaymentView() {
    this.showSelectedCc = false;
    this.showPaymentView = true;
  }

  goStep1() {
    this.currentStep = 1;
    this.viewStep1 = true;
    this.viewStep2 = false;
    this.viewStep3 = false;
  }

  goStep2() {
    if (!this.recipient_email || !this.isValidConfirmRecipientEmail) {
      return;
    }
    this.currentStep = 2;
    this.viewStep2 = true;
    this.viewStep1 = false;
    this.viewStep3 = false;
  }

  goStep3() {
    if (this.cookieService.get('accesstoken')) {
      this.onGetCC();
    }
    this.currentStep = 3;
    this.viewStep3 = true;
    this.viewStep1 = false;
    this.viewStep2 = false;
  }

  openSnackBar(msg: string, isError = false) {
    this._snackBar.open(msg, this.translate.instant('close_btn'), {
      duration: 20000,
      panelClass: [isError ? 'snackbar--error' : '']
    });
  }

  goBack() {
    if (this.viewStep2) {
      this.goStep1();
    }
    if (this.viewStep3) {
      this.goStep2();
    }
  }

  buyNewEgift() {
    this.viewStep1 = true;
    this.viewStep2 = false;
    this.viewStep3 = false;
    this.viewThanks = false;

    // Clear fields
    // form
    this.recipient_name = '';
    this.recipient_email = '';
    this.confirm_recipient_email = '';
    this.sender_name = '';
    this.sender_email = '';
    this.sender_confirm_email = '';
    this.recipient_confirm_email = '';
    this.message = '';
    this.egiftDate = moment().toDate();

    //cc
    this.cc_name = '';
    this.cc_number = '';
    this.cc_cvc = '';
    this.cc_exp_mm = '';
    this.cc_exp_yy = '';
    this.cc_postalcode = '11111';

    //in case cc is selected
    this.cc_selected = 0;
    this.cc_id = null;

    this.dateTypeSelected = 'today';
    this.customValue = false;
    this.value = 0;
    this.valueOption = '';
    this.mvalueSelected = '';
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

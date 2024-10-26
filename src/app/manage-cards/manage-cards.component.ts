import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {ProfileService} from 'src/services/profile.service';
import {TransactionService} from 'src/services/transactions.service';

@Component({
  selector: 'app-manage-cards',
  templateUrl: './manage-cards.component.html'
})
export class ManageCardsComponent implements OnInit {

  public value = 0;
  public customValue = false;
  public balance = 0;
  public isLoading = true;
  public showAddCardView = false;
  public showAddSTCardView = false;

  public number = 0;
  public pin = 0;

  //cc
  public cc_name = '';
  public cc_nick = '';
  public cc_number = '';
  public cc_cvc = '';
  public cc_exp_mm = '';
  public cc_exp_yy = '';
  public cc_postalcode = '';

  ccList: any[] = [];
  ccSTList: any[] = [];
  cardsWithPinList: any[] = [];

  public showCardsList = false;
  public showSTCardsList = false;
  public showCardsWithPinList = false;

  constructor(private router: Router,
              private spinner: NgxSpinnerService,
              private profileService: ProfileService,
              private transactionService: TransactionService,
              private translate: TranslateService,
              private _snackBar: MatSnackBar) {
  }


  ngOnInit(): void {
    this.onGetSTCC();
    this.onGetCardsWithPin();
    this.onGetCC();
  }

  addNewCard() {
    /*&& this.pin!=0*/
    if (!(this.number <= 0) && this.number != undefined) {
      this.spinner.show();
      const hasPin = !(this.pin <= 0) && (this.pin != undefined);
      if (hasPin) {
        this.addPinCard();
      } else {
        this.addNoPinCard();
      }
    }
  }

  addNoPinCard() {
    this.profileService.user_prepaid(this.number)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.showAddSTCardView = false;
          this.openSnackBar(this.translate.instant('profile_view.msg_update'));
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            console.log('Prepaid addCard ok');
            this.openSnackBar(this.translate.instant('profile_view.msg_update'));
            this.showAddSTCardView = false;
          } else {
            this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
          }
        }
      });
  }

  addPinCard() {
    this.profileService.user_prepaidWithPin(this.number, this.pin)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.showAddSTCardView = false;
          this.openSnackBar(this.translate.instant('profile_view.msg_update'));
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            console.log('Prepaid addCard ok');
            this.openSnackBar(this.translate.instant('profile_view.msg_update'));
            this.showAddSTCardView = false;
          } else {
            this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
          }
        }
      });
  }


  onGetSTCC() {
    this.transactionService.getSTCC()
      .subscribe({
        next: (response: any) => {
          if (response.data.length > 0) {
            for (let cc of response.data) {
              this.ccSTList.push(cc);
            }
            if (this.ccSTList.length > 0) {
              this.showSTCardsList = true;
            }
          } else {
            this.showSTCardsList = false;
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
  }

  onGetCardsWithPin() {
    this.transactionService.getCardsWithPin()
      .subscribe({
        next: (response: any) => {
          if (response.data.length > 0) {
            for (let cc of response.data) {
              this.cardsWithPinList.push(cc);
            }
            if (this.cardsWithPinList.length > 0) {
              this.showCardsWithPinList = true;
            }
          } else {
            this.showCardsWithPinList = false;
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
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
            this.openSnackBar(this.translate.instant('egift_view.sent_msgs.msg'));
            this.onGetCC();
          }
        },
        error: (error) => {
          this.spinner.hide();
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
  }

  onDeleteCC(id: any) {
    var data = {
      user_billingprofile: id
    }
    this.transactionService.deleteCC(data)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.onGetCC();
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
        }
      });
  }

  onshowAddCardView() {
    this.showAddCardView = true;
  }

  onHideAddCardView() {
    this.showAddCardView = false;
  }

  onshowAddSTCardView() {
    this.showAddSTCardView = true;
  }

  onHideAddSTCardView() {
    this.showAddSTCardView = false;
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant('close_btn'), {
      duration: 8000,
    });
  }

  goBack() {
    this.router.navigate(['/loyalty/prepaid'])
  }
}

import {Component} from '@angular/core';
import {TransactionService} from '../../services/transactions.service';
import {FormControl, Validators} from '@angular/forms';
import {environment} from 'src/environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-check-balance',
  templateUrl: './check-balance.component.html',
  styleUrls: ['./check-balance.component.scss']
})
export class CheckBalanceComponent {

  public balance: number | undefined;
  public cardNumberFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z0-9]+(\\s+[A-Za-z0-9]+)*')]);
  public cardPinFormControl = new FormControl('',
    [Validators.pattern('[0-9]+(\\s+[0-9]+)*')]);

  constructor(
    private transactionService: TransactionService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
  }

//6371179841000011
  onCheckBalance() {
    this.balance = undefined;
    const hasPin = !!this.cardPinFormControl.value;
    if (this.cardNumberFormControl.value) {
      this.transactionService.getBalance(this.cardNumberFormControl.value, hasPin, this.cardPinFormControl.value)
        .subscribe({
          next: (response: any) => {
            if (response) {
              const balance = response.balances.find((balance: any) => balance.currency.id === environment.currencyId);
              this.balance = balance.amount;
            }
          },
          error: (error) => {
            for (let err of error.error.error.errors) {
              this._snackBar.open(err.message, this.translate.instant('close_btn'), {
                duration: 8000,
                panelClass: ['snackbar--error']
              });
            }
          },
          complete: () => console.info('complete')
        });
    }
  }

  notAllowSigns($event: KeyboardEvent) {
    if ($event.key == '+' || $event.key == '-' || $event.key == '.' || $event.key == 'e' || $event.key == 'E') {
      $event.preventDefault();
    }
  }
}

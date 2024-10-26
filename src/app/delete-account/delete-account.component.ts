import {Component, ViewChild} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {TransactionService} from 'src/services/transactions.service';
import * as moment from 'moment-timezone';
import {NgxSpinnerService} from 'ngx-spinner';
import {CookieService} from 'ngx-cookie-service';
import {GlobalFunctionsService} from "../../services/global-functions.service";
import {DeleteAccountService} from "../../services/delete-account.service";
import {environment} from '../../environments/environment';
import {IRewards} from '../../models/utils';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent {

  public token = '';

  constructor(private activeroute: ActivatedRoute,
              private router: Router,
              private _snackBar: MatSnackBar,
              private globalFunctionsService: GlobalFunctionsService,
              private deleteAccountService: DeleteAccountService) {
  }

  ngOnInit(): void {
    this.token = this.activeroute.snapshot.queryParams['token'];
  }

  deleteAccount() {
    this.deleteAccountService.deleteAccount(this.token)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this._snackBar.open('Your Account was deleted', 'CLOSE', {duration: 5000});
            setTimeout(() => {
              this.globalFunctionsService.onLogout();
            }, 5000);
          }
        },
        error: (error) => {
        },
        complete: () => console.info('complete')
      });
  }

  goHome() {
    this.router.navigate(['/login'])
  }
}

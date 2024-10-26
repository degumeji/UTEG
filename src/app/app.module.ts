import {NgModule, isDevMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import { NgxSpinnerModule } from 'ngx-spinner';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CookieService} from 'ngx-cookie-service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {GoogleMapsModule} from '@angular/google-maps';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {HistoryComponent} from './history/history.component';
import {ModalComponent} from './modal/modal.component';
import {ValidateComponent} from './validate/validate.component';
import {RegisterComponent} from './register/register.component';
import {ResetpassComponent} from './resetpass/resetpass.component';
import {ProfileComponent} from './profile/profile.component';
import {CouponDetailComponent} from './coupons/coupon-detail/coupon-detail.component';
import {CouponsComponent} from './coupons/coupons.component';
import {LauncherComponent} from './launcher/launcher.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';

import {UtilsService} from 'src/services/util.service';
import {ModalService} from 'src/services/modal.service';
import {ProfileService} from 'src/services/profile.service';
import {LoyaltyService} from 'src/services/loyalty.service';
import {AuthGuardService, LoginGuardService} from 'src/services/auth-guard.service';
import {AuthenticationService} from 'src/services/authentication.service';
import {TransactionService} from 'src/services/transactions.service';
import {NavigationService} from '../services/navigation.service';
import {LocationsComponent} from './locations/locations.component';
import {RewardsComponent} from './rewards/rewards.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MenuComponent} from './menu/menu.component';
import {CashbackComponent} from './cashback/cashback.component';
import {CustomMatPaginatorIntl} from '../services/custom-paginator.service';
import {NgxSpinnerModule} from 'ngx-spinner';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {ActivatePromotionComponent} from './activate-promotion/activate-promotion.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {CheckInComponent} from './check-in/check-in.component';
import {TransferAccountComponent} from './transfer-account/transfer-account.component';
import {ManageCardsComponent} from './manage-cards/manage-cards.component';
import {ReloadComponent} from './reload/reload.component';
import {AutoReloadComponent} from './auto-reload/auto-reload.component';
import {EgiftComponent} from './egift/egift.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule
} from '@angular-material-components/datetime-picker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {IconRegistryService} from '../services/icon-registry.service';
import {NgForOf, NgIf} from '@angular/common';
import {PrepaidComponent} from './prepaid/prepaid.component';
import {WalletsService} from '../services/wallets.service';
import {CheckBalanceComponent} from './check-balance/check-balance.component';
import {HomeScreenComponent} from "./home-screen/home-screen.component";
/*import {ServiceWorkerModule} from '@angular/service-worker';*/
import {DeleteAccountService} from "../services/delete-account.service";
import {GlobalFunctionsService} from "../services/global-functions.service";
import {DeleteAccountComponent} from "./delete-account/delete-account.component";
import { Home2Component } from './home2/home2.component';
import { BookingService } from 'src/services/booking.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    Home2Component,
    RegisterComponent,
    ResetpassComponent,
    LauncherComponent,
    CashbackComponent,
    PageNotFoundComponent,
    ValidateComponent,
    ModalComponent,
    HistoryComponent,
    ProfileComponent,
    CouponsComponent,
    CouponDetailComponent,
    LocationsComponent,
    RewardsComponent,
    MenuComponent,
    ActivatePromotionComponent,
    CheckInComponent,
    TransferAccountComponent,
    ManageCardsComponent,
    ReloadComponent,
    AutoReloadComponent,
    EgiftComponent,
    PrepaidComponent,
    CheckBalanceComponent,
    HomeScreenComponent,
    DeleteAccountComponent,
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    // NgxSpinnerModule,
    GoogleMapsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatInputModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatPaginatorModule,
    NgxSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgIf,
    TranslateModule,
    MatFormFieldModule,
    NgIf,
    TranslateModule,
    NgForOf,
    NgForOf,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    TranslateModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    NgForOf,
    NgIf,
    TranslateModule,
    /*    ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        }),*/
    NgForOf,
    NgIf,
    TranslateModule,
    TranslateModule,
    TranslateModule,
    TranslateModule
  ],
  providers: [
    CookieService,
    UtilsService,
    ProfileService,
    AuthGuardService,
    LoginGuardService,
    AuthenticationService,
    ModalService,
    LoyaltyService,
    TransactionService,
    NavigationService,
    IconRegistryService,
    WalletsService,
    DeleteAccountService,
    GlobalFunctionsService,
    BookingService,
    {provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl},
    {provide: MAT_DATE_LOCALE, useValue: 'en-UK'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

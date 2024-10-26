import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService, LoginGuardService} from 'src/services/auth-guard.service';
import {ActivatePromotionComponent} from './activate-promotion/activate-promotion.component';
import {CashbackComponent} from './cashback/cashback.component';
import {CouponDetailComponent} from './coupons/coupon-detail/coupon-detail.component';
import {CouponsComponent} from './coupons/coupons.component';
import {HistoryComponent} from './history/history.component';
import {LauncherComponent} from './launcher/launcher.component';
import {LocationsComponent} from './locations/locations.component';
import {LoginComponent} from './login/login.component';
import {MenuComponent} from './menu/menu.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ProfileComponent} from './profile/profile.component';
import {RegisterComponent} from './register/register.component';
import {ResetpassComponent} from './resetpass/resetpass.component';
import {RewardsComponent} from './rewards/rewards.component';
import {ValidateComponent} from './validate/validate.component';
import {CheckInComponent} from './check-in/check-in.component';
import {TransferAccountComponent} from './transfer-account/transfer-account.component';
import {ManageCardsComponent} from './manage-cards/manage-cards.component';
import {ReloadComponent} from './reload/reload.component';
import {AutoReloadComponent} from './auto-reload/auto-reload.component';
import {EgiftComponent} from './egift/egift.component';
import {PrepaidComponent} from './prepaid/prepaid.component';
import {CheckBalanceComponent} from './check-balance/check-balance.component';
import {HomeScreenComponent} from "./home-screen/home-screen.component";
import { Home2Component } from './home2/home2.component';

const routes: Routes = [
  {
    path: '',
    component: HomeScreenComponent,
    pathMatch: 'full'
  },
  {
    path: 'loyalty',
    redirectTo: 'loyalty/orders',
    pathMatch: 'full'
  },
  {
    path: 'home2',
    component: Home2Component,
    pathMatch: 'full'
  },
  {
    path: '',
    component: LauncherComponent,
    canActivate: [LoginGuardService],
    children: [
      {path: 'login', component: LoginComponent},
      //{path: 'home2', component: Home2Component},
      {path: 'register', component: RegisterComponent},
      {path: 'validate', component: ValidateComponent},
      {path: 'resetpass', component: ResetpassComponent},
      {path: 'check-in', component: CheckInComponent},
      {path: 'activate-promotion', component: ActivatePromotionComponent},
      {path: 'transfer-account', component: TransferAccountComponent},
    ]
  },
  {
    path: 'loyalty',
    component: MenuComponent,
    canActivate: [AuthGuardService],
    children: [
      {path: 'cashback', component: CashbackComponent},
      {path: 'rewards', component: RewardsComponent},
      {path: 'history', component: HistoryComponent},
      {path: 'orders', component: LocationsComponent},
      {path: 'coupons', component: CouponsComponent},
      {path: 'coupon-detail/:coupon', component: CouponDetailComponent},
      {path: 'profile', component: ProfileComponent},
      {path: 'manage-cards', component: ManageCardsComponent},
      {path: 'reload', component: ReloadComponent},
      {path: 'auto-reload', component: AutoReloadComponent},
      {path: 'prepaid', component: PrepaidComponent},
      {path: 'check-balance', component: CheckBalanceComponent},
      {path: 'egift', component: EgiftComponent},
    ],
  },
  {path: '**', component: PageNotFoundComponent}
  // { path: '',   redirectTo: '/launcher', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

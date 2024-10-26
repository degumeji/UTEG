import {Injectable} from '@angular/core';
import {MenuItem} from '../interfaces/sideMenu';
import {BehaviorSubject} from 'rxjs';


@Injectable({providedIn: 'root'})
export class NavigationService {
  private homeSubPaths = ['/'];
  private cashbackSubPaths = ['/loyalty/cashback'];
  private rewardsSubPaths = ['/loyalty/rewards'];
  private historySubPaths = ['/loyalty/history'];
  private locationsSubPaths = ['/loyalty/orders'];
  private profileSubPaths = ['/loyalty/profile'];
  private checkBalanceSubPaths = ['/loyalty/check-balance'];
  private egiftSubPaths = ['/loyalty/egift'];
  private prepaidSubPaths = [
    '/loyalty/prepaid',
    '/loyalty/reload',
    '/loyalty/auto-reload',
    '/loyalty/manage-cards'];
  public menuItems: MenuItem[] = [
    /*  {
        name: 'home', path: 'check-balance', icon: 'app-logo',
        subPaths: this.homeSubPaths
      },*/
    {
      name: 'locations', path: 'orders', icon: 'icon-order-online',
      subPaths: this.locationsSubPaths
    },
    {
      name: 'cashback', path: 'cashback', icon: 'wallet-outline',
      subPaths: this.cashbackSubPaths
    },
    {
      name: 'egift', path: 'egift', icon: 'wallet-giftcard',
      subPaths: this.egiftSubPaths
    },
    {
      name: 'check-balance', path: 'check-balance', icon: 'currency-usd',
      subPaths: this.checkBalanceSubPaths
    },
    /*{
      name: 'rewards', path: 'rewards', icon: 'currency-usd',
      subPaths: this.rewardsSubPaths
    },*/
    {
      name: 'prepaid', path: 'prepaid', icon: 'credit-card-outline',
      subPaths: this.prepaidSubPaths
    },
    {
      name: 'history', path: 'history', icon: 'history',
      subPaths: this.historySubPaths
    },
    {
      name: 'profile', path: 'profile', icon: 'account-outline',
      subPaths: this.profileSubPaths
    },
    {
      name: 'logout', path: 'logout', icon: 'exit-to-app',
      subPaths: []
    }
  ];
  public menuItemsLogout: MenuItem[] = [
    {
      name: 'home', path: 'logout', icon: 'app-logo',
      subPaths: this.homeSubPaths
    },
    {
      name: 'egift', path: 'egift', icon: 'wallet-giftcard',
      subPaths: this.egiftSubPaths
    },
    {
      name: 'check-balance', path: 'check-balance', icon: 'currency-usd',
      subPaths: this.checkBalanceSubPaths
    },
    {
      name: 'locations', path: 'orders', icon: 'icon-order-online',
      subPaths: this.locationsSubPaths
    },
    {
      name: 'logout', path: 'logout', icon: 'exit-to-app',
      subPaths: []
    }
  ];
  public floatingMenuItems: MenuItem[] = [
    {
      name: 'cashback', path: 'cashback', icon: 'wallet-outline',
      subPaths: this.cashbackSubPaths
    },
    {
      name: 'history', path: 'history', icon: 'history',
      subPaths: this.historySubPaths
    },
    {
      name: 'locations', path: 'orders', icon: 'icon-order-online',
      subPaths: this.locationsSubPaths
    },
    {
      name: 'prepaid', path: 'prepaid', icon: 'credit-card-outline',
      subPaths: this.prepaidSubPaths
    },
    {
      name: 'profile', path: 'profile', icon: 'account-outline',
      subPaths: this.profileSubPaths
    },
  ];

  onUpdateEmail: BehaviorSubject<boolean> = new BehaviorSubject(false);
}

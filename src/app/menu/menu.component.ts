import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {LanguageOption, MenuItem} from 'src/interfaces/sideMenu';
import {NavigationService} from 'src/services/navigation.service';
import {environment} from 'src/environments/environment';
import {TransactionService} from '../../services/transactions.service';

declare var window: any;

@Component({
  selector: 'menu-root',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit {
  public title = 'uteg';
  public selectedLanguage = '';
  private menuBreakPoint = 1200;

  menuItems: MenuItem[] = [];
  floatingMenuItems: MenuItem[] = [];

  public barCodeModal: any;
  public barCodeImage = '';

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  readonly languages: {
    [key: string]: LanguageOption
  } = {
    'en': {value: 'en', label: 'English', shortLabel: 'EN', icon: ''},
    'es': {value: 'es', label: 'Español', shortLabel: 'ES', icon: ''}
  };
  public languageOption: LanguageOption = this.languages['es'];
  public displayMenuIcon = false;
  public logoUrl: string;

  constructor(
    private translate: TranslateService,
    public cookieService: CookieService,
    private observer: BreakpointObserver,
    private navigationService: NavigationService,
    private transactionService: TransactionService,
    public router: Router) {
    this.logoUrl = environment.baseAssetsUrl + 'assets/images/logo.png';
    if (this.cookieService.get('defaultLang') == null || this.cookieService.get('defaultLang') == '') {
      this.selectedLanguage = 'es';
      // this language will be used as a fallback when a translation isn't found in the current language
      translate.setDefaultLang(this.selectedLanguage);
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      translate.use(this.selectedLanguage);
      this.cookieService.set('defaultLang', this.selectedLanguage);
    } else {
      this.selectedLanguage = this.cookieService.get('defaultLang');
      translate.setDefaultLang(this.selectedLanguage);
      translate.use(this.selectedLanguage);
    }
    this.languageOption = this.languages[this.selectedLanguage] || this.languages['es'];
  }

  ngOnInit(): void {
    if (this.cookieService.get('accesstoken')) {
      this.menuItems = this.navigationService.menuItems;
      this.floatingMenuItems = this.navigationService.floatingMenuItems;
    } else {
      this.menuItems = this.navigationService.menuItemsLogout;
      this.floatingMenuItems = [];
    }
    this.barCodeModal = new window.bootstrap.Modal(document.getElementById('barCodeModal'));
  }

  ngAfterViewInit(): void {
    this.observer
      .observe([`(max-width: ${this.menuBreakPoint}px)`])
      .subscribe((res: any) => {
        setTimeout(() => {
          this.displayMenuIcon = !!res.matches;
        })
      });
    this.observer
      .observe([`(min-width: ${this.menuBreakPoint}px)`])
      .subscribe((res: any) => {
        if (res.matches && this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }

  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    this.languageOption = this.languages[language]
    this.cookieService.set('defaultLang', this.selectedLanguage);
    this.translate.setDefaultLang(this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
  }

  displayComponent(path: string): void {
    if (path === 'qr_scan') {
      this.transactionService
        .getBarCode()
        .subscribe({
          next: (response: any) => {
            this.barCodeImage = response.barcode;
            this.barCodeModal.show();
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
          }
        });
      return;
    }
    if (path === 'logout') {
      this.onLogout();
    } else {
      this.router.navigateByUrl('/loyalty/' + path);
    }
  }

  onCloseQrCodeModal() {
    this.barCodeModal.hide();
    this.barCodeImage = '';
  }

  onLogout() {
    this.cookieService.delete('accesstoken', '/');
    this.cookieService.deleteAll();
    this.router.navigate(['/']);
  }

  protected readonly environment = environment;
}

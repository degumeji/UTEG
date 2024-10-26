import {Component, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {LanguageOption, MenuItem} from 'src/interfaces/sideMenu';
import {MatSidenav} from '@angular/material/sidenav';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NavigationService} from '../../services/navigation.service';
import {filter} from 'rxjs';

@Component({
  selector: 'app-launcher',
  templateUrl: './launcher.component.html',
  styleUrls: ['./launcher.component.scss']
})
export class LauncherComponent {

  menuItems: MenuItem[] = [];
  floatingMenuItems: MenuItem[] = [];

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  public selectedLanguage = '';
  readonly languages: {
    [key: string]: LanguageOption
  } = {
    'en': {value: 'en', label: 'English', shortLabel: 'EN', icon: ''},
    'es': {value: 'es', label: 'Español', shortLabel: 'ES', icon: ''}
  };
  public languageOption: LanguageOption = this.languages['es'];

  constructor(
    public router: Router,
    private translate: TranslateService,
    private observer: BreakpointObserver,
    private navigationService: NavigationService,
    public cookieService: CookieService) {
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
      this.menuItems = this.navigationService.menuItemsLogout;
      this.floatingMenuItems = this.navigationService.floatingMenuItems;
    } else {
      this.menuItems = this.navigationService.menuItemsLogout;
      this.floatingMenuItems = [];
    }
  }

  ngAfterViewInit(): void {
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

  displayComponent(path: string): void {
    if (path === 'logout') {
      this.sidenav.close();
      this.router.navigateByUrl('/');
    } else {
      this.router.navigateByUrl('/loyalty/' + path);
    }
  }

  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    this.languageOption = this.languages[language]
    this.cookieService.set('defaultLang', this.selectedLanguage);
    this.translate.setDefaultLang(this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
  }
}

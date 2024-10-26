import {Component, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {IconRegistryService} from '../services/icon-registry.service';
import {environment} from '../environments/environment';
import {ISvgIcons} from '../models/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentChecked  {

  public selectedLanguage = '';
  public svgIcons: Array<ISvgIcons> = [
    {iconName: 'language-es', iconPath: `${environment.baseAssetsUrl}assets/icons/es_language.svg`},
    {iconName: 'language-en', iconPath: `${environment.baseAssetsUrl}assets/icons/en_language.svg`},
    {iconName: 'app-logo', iconPath: `${environment.baseAssetsUrl}assets/icons/logo.svg`},
    {iconName: 'icon-cashback', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-cashback.svg`},
    {iconName: 'icon-prepaid', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-prepaid.svg`},
    {iconName: 'icon-profile', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-profile.svg`},
    {iconName: 'icon-rewards', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-rewards.svg`},
    {iconName: 'icon-qr-scan', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-qr-scan.svg`},
    {iconName: 'icon-order-online', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-order-online.svg`},
    {iconName: 'icon-locations', iconPath: `${environment.baseAssetsUrl}assets/icons/icon-locations.svg`}
  ]

  constructor(
    private translate: TranslateService,
    public cookieService: CookieService,
    private IconRegistryService: IconRegistryService,
    private changeDetector: ChangeDetectorRef,
  ) {
    var userLang = 'en';
    this.cookieService.set('defaultLang', userLang);
    if (this.cookieService.get('defaultLang') === null || this.cookieService.get('defaultLang') === '') {
      this.selectedLanguage = 'en';
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
    this.IconRegistryService.registerIcons(this.svgIcons);

  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
}

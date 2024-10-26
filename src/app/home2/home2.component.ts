import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {UtilsService} from 'src/services/util.service';
import {CookieService} from "ngx-cookie-service";
import {LanguageOption, MenuItem} from "../../interfaces/sideMenu";
import {MatSidenav} from "@angular/material/sidenav";
import {BreakpointObserver} from "@angular/cdk/layout";
import {NavigationService} from "../../services/navigation.service";

import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-locations',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss']
})
export class Home2Component implements OnInit {
  menuItems: MenuItem[] = [];
  floatingMenuItems: MenuItem[] = [];

  public emailSite: string = '';

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  public selectedLanguage = '';
  readonly languages: {
    [key: string]: LanguageOption
  } = {
    'en': {value: 'en', label: 'English', shortLabel: 'EN', icon: ''},
    'es': {value: 'es', label: 'Español', shortLabel: 'ES', icon: ''}
  };
  public languageOption: LanguageOption = this.languages['en'];  


  bookings: Booking[] = [];
  newBooking: Booking = { id: 0, name: '', date: '' };

  constructor(
    public router: Router,
    private translate: TranslateService,
    private observer: BreakpointObserver,
    private navigationService: NavigationService,
    private BookingService: BookingService,
    public cookieService: CookieService) {
      
    if (this.cookieService.get('defaultLang') == null || this.cookieService.get('defaultLang') == '') {
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
    this.languageOption = this.languages[this.selectedLanguage] || this.languages['es'];
  }

  ngOnInit(): void {

    this.emailSite = this.cookieService.get('email');

    /*if (this.cookieService.get('accesstoken')) {
      this.menuItems = this.navigationService.menuItemsLogout;
      this.floatingMenuItems = this.navigationService.floatingMenuItems;
    } else {
      this.menuItems = this.navigationService.menuItemsLogout;
      this.floatingMenuItems = [];
    }*/

    this.loadBookings();
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

  findElement<T>(arr: T[], target: T): number {
    return arr.indexOf(target);
  }

  loadBookings(): void {
    this.BookingService.getBookings().subscribe((data) => {
      this.bookings = data;
    });

  }

  submitBooking(event: Event): void {
    event.preventDefault();    

    this.BookingService.book(this.newBooking).subscribe((booking) => {
      this.bookings.push(booking);
      this.newBooking = { id: 0, name: '', date: '' };
    });

  }

  salir(): void{
    this.router.navigateByUrl('/login');
  }

}

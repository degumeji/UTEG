import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
// import { NgxSpinnerService } from 'ngx-spinner';
import {AuthGuardService} from 'src/services/auth-guard.service';
import {UtilsService} from 'src/services/util.service';
import {Paginator} from '../../interfaces/app';
import {PageEvent} from '@angular/material/paginator';
import {BreakpointObserver} from "@angular/cdk/layout";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  @ViewChild('modal',{ static: true }) modal!: ElementRef
  @ViewChild('modalContent',{ static: true }) modalContent!: ElementRef
  @ViewChild('modalClose',{ static: true }) modalClose!: ElementRef
  @ViewChild('loadingWrapper',{ static: true }) loadingWrapper!: ElementRef
  @ViewChild('orderLoading',{ static: true }) orderLoading!: ElementRef;
  @ViewChild('orderIframe',{ static: true }) orderIframe!: ElementRef;

  pageSizeOptions = [
    5,
    10,
    25];

  disabledPaginator = false;

  paginator: Paginator = {
    page: 0,
    limit: 15,
    total: 0
  }
  public places: any;
  public selectedPlace: any;
  public order_online_flag = '';
  public placesOrderOnline: any = [];

  public mapOptions = {
    styles: [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [
          {saturation: -40},
          {lightness: 10}
        ]
      }]
  }

  zoom = 15;
  markers: any = [];
  center: google.maps.LatLngLiteral = {lat: 0, lng: 0};
  markerOptions: google.maps.MarkerOptions = {draggable: false};

  showGeolocationMessage = false;
  geolocationStates = [
    'prompt',
    'denied']

  subscription: Subscription | undefined;

  constructor(
    private router: Router,
    private utilService: UtilsService,
    private translate: TranslateService,
    private elem: ElementRef,
    private observer: BreakpointObserver) {
    this.order_online_flag = environment.orderOnline;
  }

  ngOnInit(): void {
    navigator.permissions.query({name: 'geolocation'}).then((result) => {
      this.showGeolocationMessage = this.geolocationStates.includes(result.state);
      if (!(result.state === 'denied')) {
        this.getUserPosition();
      }
      const setShowGeolocationMessage = () => {
        this.showGeolocationMessage = false;
      }
      result.onchange = function () {
        if (result.state === 'granted') {
          setShowGeolocationMessage();
        }
      };
    });
    this.getLocales();
  }

  getUserPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      this.addMarker(position.coords.latitude, position.coords.longitude, this.translate.instant('locales_view.marker'), true);
    });
  }

  getLocales() {
    const paginatorRequest: Paginator = {
      page: this.paginator.page + 1,
      limit: this.paginator.limit
    };
    this.disabledPaginator = true;
    this.utilService.getLocales(this.center.lat, this.center.lng, paginatorRequest)
      .subscribe({
        next: (response: any) => {
          this.paginator.total = response.count;
          this.places = response.data.sort((a: {
            distance: number;
          }, b: {
            distance: number;
          }) => a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0);
          for (let local of this.places) {
            local.distance = local.distance.toFixed(2);
            this.addMarker(parseFloat(local.latitude), parseFloat(local.longitude), local.name);
            if (local.vendor_attribute.some((e: {
              icon: string;
            }) => e.icon === this.order_online_flag)) {
              this.placesOrderOnline.push(local);
            }
          }
          // this.spinner.hide();
        },
        error: (error) => {
          // this.spinner.hide();
          // console.log("message-error", error.status);
          console.log(error.error.error.errors[0].message);
        },
        complete: () => {
          this.disabledPaginator = false;
        }
      });
  }

  openIframe(link: any) {
    this.subscription = this.observer
      .observe([`(min-width: 769px)`])
      .subscribe((res: any) => {
        if (res.matches) {
          this.modal.nativeElement.style.display = "block";
          this.loadingWrapper.nativeElement.style.display = "block";
          this.orderIframe.nativeElement.src = link;
        } else {
          window.open(link, '_blank');

        }
      });

    this.subscription.unsubscribe();
  }

  iframeLoaded() {
    this.loadingWrapper.nativeElement.style.display = "none";
    this.orderIframe.nativeElement.style.display = "block";
    this.modalClose.nativeElement.style.display = "block";
  }

  closeIframe() {
    this.orderIframe.nativeElement.src = '';
    this.modal.nativeElement.style.display = "none";
    this.modalClose.nativeElement.style.display = "none";
  }

  handlePageEvent(event: PageEvent) {
    this.paginator.limit = event.pageSize;
    this.paginator.page = event.pageIndex;
    this.getLocales();
  }

  getUntilTime(data: any) {
    let day = new Date().getDay();
    // let untilTime = this.getTime(data[day].end_time);
    let untilTime = '';
    if (day == 0) { //si es domingo
      untilTime = this.getTime(data[6].end_time);
    } else {
      untilTime = this.getTime(data[day - 1].end_time);
    }
    return untilTime;
  }

  getOpensAt(data: any) {
    let day = new Date().getDay();
    // let opensAtTime = this.getTime(data[day].start_time);
    let opensAtTime = '';
    if (day == 0) { //si es domingo
      opensAtTime = this.getTime(data[6].start_time);
    } else {
      opensAtTime = this.getTime(data[day - 1].start_time);
    }
    return opensAtTime;
  }

  getTime(seconds: any) {
    let timeFormat = '';
    if (seconds != undefined) {
      const hours = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
      seconds %= 3600; // seconds remaining after extracting hours
      const minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute

      let timeHours = hours % 12;
      timeHours = timeHours === 0 ? 12 : timeHours; // Adjust for 12-hour format
      const timeMinutes = minutes < 10 ? '0' + minutes : minutes;

      const period = hours < 12 ? 'AM' : 'PM';

      timeFormat = `${timeHours}:${timeMinutes} ${period}`;
    }
    return timeFormat;
  }

  getDate(data: any) {
    // console.log("getDate", data);
    switch (data.day_of_week) {
      case 1:
        return this.translate.instant('days.day_1');
        break;
      case 2:
        return this.translate.instant('days.day_2');
        break;
      case 3:
        return this.translate.instant('days.day_3');
        break;
      case 4:
        return this.translate.instant('days.day_4');
        break;
      case 5:
        return this.translate.instant('days.day_5');
        break;
      case 6:
        return this.translate.instant('days.day_6');
        break;
      case 7:
        return this.translate.instant('days.day_7');
        break;
      default:
        return ''
        break;
    }
  }

  addMarker(latitude: any, longitude: any, name: string, isUserLocation = false) {
    this.markers.push({
      position: {
        lat: latitude,
        lng: longitude,
      },
      label: {
        color: '#0a0a0a',
        text: name,
      },
      title: name,
      info: name,
      options: {
        animation: google.maps.Animation.DROP,
        icon: {
          url: `${environment.baseAssetsUrl}assets/icons/map-marker-${isUserLocation ? 'customer' : 'outlet'}.svg`,
          size: new google.maps.Size(40, 90),
          scaledSize: new google.maps.Size(40, 40),
        }
      },
    });
  }

  click(event: google.maps.MapMouseEvent) {
    console.log(event);
  }

  showOnMap(latitude: any, longitude: any) {
    this.center = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    };
  }

  goToMap(lat: any, lng: any) {
    window.open('https://www.google.com/maps/search/?api=1&query=' + lat + '%2C' + lng, '_blank');
  }

}

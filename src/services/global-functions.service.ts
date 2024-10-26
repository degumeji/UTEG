import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {ModalService} from "./modal.service";

@Injectable()
export class GlobalFunctionsService {
  constructor(private cookieService: CookieService,
              private router: Router,
              private modalService: ModalService) {
  }

  onLogout() {
    this.cookieService.deleteAll('/uteg');
    this.cookieService.deleteAll('/');
    this.cookieService.deleteAll('/uteg/loyalty');
    this.router.navigate(['/login']);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  openModal(id: string) {
    this.modalService.open(id);
  }
}

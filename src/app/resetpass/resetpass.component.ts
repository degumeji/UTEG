import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
// import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/services/authentication.service';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { matchValidator, strongPasswordValidator } from "../../services/custom-form-validators.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalService } from "../../services/modal.service";

@Component({
  selector: 'app-resetpass',
  templateUrl: './resetpass.component.html',
  styleUrls: ['./resetpass.component.scss']
})
export class ResetpassComponent implements OnInit {

  resetpassStep1Form: FormGroup;
  resetpassStep2Form: FormGroup;
  public email:string = "";
  public token = "";
  public password:string = "";
  //Alerts
  public alertDigits = "";
  public alertLowerCase = "";
  public alertUpperCase = "";
  public alertNumeric = "";
  public alertIdNumber = "";
  public isValidPassword = false;
  public showInvalidEmailAlert = false;
  public hidePsw = true;
  public hidePswConfirm = true;

  public viewStep1 = true;
  public viewStep2 = false;
  public viewStep3 = false;

  // Email
  public isValidEmail = false;
  public isEmailExists = false;
  public isInvalidEmail = false;
  public loadingEmail = false;

  // password
  public confirmPass:string = "";
  public passicon = true;
  public showPass:string = "";
  public hidePass:string = "";
  public isInvalidConfirmPass = false;
  public isValidConfirmPass = false;

  public alertConfirm = "";
  public genericMsg = "";
  public logoUrl:string;

  constructor(
    private spinner: NgxSpinnerService,
    private authService : AuthenticationService,
    private modalService : ModalService,
    private cookieService : CookieService) {
    this.logoUrl = environment.baseAssetsUrl + "assets/images/logo-login.png";
    this.resetpassStep1Form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
    this.resetpassStep2Form = new FormGroup({
      token: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, strongPasswordValidator]),
      confirmPassword: new FormControl('', [Validators.required, matchValidator('password')])
    });
  }

  ngOnInit(): void {
    var showcharCode = 0xf06e;
    this.showPass = String.fromCharCode(showcharCode);
    var hidecharCode = 0xf070;
    this.hidePass = String.fromCharCode(hidecharCode);
  }

  onEmailChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    let email = textvalue.trim().toLowerCase();
    if (!this.validateEmail(email)) {
      this.isValidEmail=false;
    } else {
      this.isValidEmail=true;
      this.onCheckEmailExists(encodeURIComponent(email));
    }
  }

  validateEmail(email:any) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  onCheckEmailExists(email:any){
    this.authService.userExists(email)
    .subscribe({
      next: (response:any) => {
        this.loadingEmail = false;
        if(response){
          this.isEmailExists = response.exists;
          this.showInvalidEmailAlert = this.isEmailExists ? false : true;
        }
      },
      error: (error) => {
        this.loadingEmail = false;
        console.log("message-error", error.status);
      },
      complete: () => {}
    });
  }

  onSendToEmail(){
    if (this.resetpassStep1Form.invalid) {
      return;
    }
    this.spinner.show();
    const user_data = {
      email_address: this.resetpassStep1Form.value.email,
      vendor: environment.vendor,
    };
    this.email = this.resetpassStep1Form.value.email;
    this.resetpassStep2Form.reset();
    this.authService.sendCodeToEmail(user_data)
      .subscribe({
        next: (response:any) => {
          this.spinner.hide();
          if (!this.viewStep2) {
            this.cookieService.set("isPendingValidation",'true');
            this.viewStep1 = false;
            this.viewStep2 = true;
          }
        },
        error: (error) => {
          this.spinner.hide();
          if (!this.viewStep2) {
            if (error.status == 200) {
              this.cookieService.set("isPendingValidation",'true');
              this.viewStep1 = false;
              this.viewStep2 = true;
            } else {
              this.genericMsg = error.error.error.errors[0].message;
              this.openModal('modal-generic');
            }
          }
        },
        complete: () => {}
      });
  }

  onResetPass() {
    if (this.resetpassStep2Form.invalid) {
      return;
    }
    this.spinner.show();
    const user_data = {
      token: this.resetpassStep2Form.value.token,
      password: this.resetpassStep2Form.value.password
    };

    this.authService.resetPassword(user_data)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.cookieService.set("isPendingValidation",'false');
          this.viewStep2 = false;
          this.viewStep3 = true;
        },
        error: (error) => {
          this.spinner.hide();
          console.log("message-error", error.status);
          if (error.status == 200) {
            this.cookieService.set("isPendingValidation",'false');
            this.viewStep2 = false;
            this.viewStep3 = true;
          } else {
            this.genericMsg = error.error.error.errors[0].message;
            this.openModal('modal-generic');
          }
        },
        complete: () => {}
      });
  }
  checkErrorStep1 = (controlName: string, errorName: string) => {
    return this.resetpassStep1Form.controls[controlName].hasError(errorName);
  }

  checkErrorStep2 = (controlName: string, errorName: string) => {
    return this.resetpassStep2Form.controls[controlName].hasError(errorName);
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  protected readonly environment = environment;
}

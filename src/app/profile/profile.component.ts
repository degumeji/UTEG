import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {NgxSpinnerService} from 'ngx-spinner';
import {environment} from 'src/environments/environment';
import {Country} from 'src/models/utils';
import {AuthenticationService} from 'src/services/authentication.service';
import {NavigationService} from 'src/services/navigation.service';
import {ProfileService} from 'src/services/profile.service';
import {UtilsService} from 'src/services/util.service';
import {ModalService} from '../../services/modal.service';

declare var window: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public firstname = '';
  public lastname = '';
  public originalemail = '';
  public email = '';
  public password = '';
  public currentPassword = '';
  public newPhone = '';
  public originalphone = '';
  public idnumber = '';
  public gender = '';
  public user_metadata_id = '';
  public birthday = 0;
  public address = 0;
  public contact_consent = 0;
  public digitos = '';
  public fechaSelected = '';
  public showInvalidEmailAlert = false;

  isLoading = true;

  //Alerts
  public alertDigits = '';
  public alertLowerCase = '';
  public alertUpperCase = '';
  public alertNumeric = '';
  public alertIdNumber = '';
  public isValidPassword = false;

  // password
  public hidePsw = true;
  public hideUpdatePswCurrent = true;
  public hideUpdatePswNew = true;
  public hideUpdatePswConfirm = true;
  public confirmPass = '';
  public showPass = '';
  public hidePass = '';
  public isInvalidConfirmPass = false;
  public isValidConfirmPass = false;
  public editPassword = false;
  public editPhoneNumber = false;
  public passicon = true;
  public passiconupdate = true;
  public passiconconfirm = true;

  public alertConfirm = '';

  public deleteAccount = false;
  public deleteAccountCode = '';

  public switchChecked = false;

  //idnumber
  public loadingIdNumber = false;
  public isValidIdNumber = false;
  public isInvalidIdNumber = false;
  public isIdNumberExists = false;

  public showProfile = true;
  public showNotifications = false;
  public showCurrentPassValidation = false;

  public isVerifiedPhoneNumber = false;

  public countrySelected: Country;
  public showCountryList = false;
  public countries: Array<Country>;
  public filteredCountries: Array<Country>;
  public showEmptyAddressMsg = false;

  public maxYear: any;
  public minYear: any;

  // Phone number
  public alertPhoneNumber = '';
  public imgCountrySelected = '';
  public phoneNumberCode = '';
  public phoneCountry = '';
  public isValidPhoneNumber = false;
  public showInvalidPhoneNumberAlert = false;
  public isPhoneNumberExists = false;
  private phoneValidate = null;

  public updateEmailModal: any;
  public deleteAccountModal: any;
  public smsValidationModal: any;
  public genericModal: any;
  public changePasswordModal: any;
  public checkEmployeeModal: any;

  public genericMsg = '';
  public isValidEmail = false;
  public isEmailExists = false;

  public termsAndConditions = {title: '', content: ''}
  public termsAndConditionsModal: any;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private authService: AuthenticationService,
    private utilsService: UtilsService,
    private profileService: ProfileService,
    private cookieService: CookieService,
    private navigationService: NavigationService,
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private modalService: ModalService) {
    this.countries = new Array<Country>();
    this.countrySelected = new Country();
    this.filteredCountries = new Array<Country>();
    this.countrySelected.name = '';
    this.imgCountrySelected = environment.phone_number_flag;
    this.phoneNumberCode = environment.phone_number_code;
    this.phoneCountry = environment.phone_number_country;
  }

  ngOnInit(): void {
    this.getProfile();

    let min = (new Date().getFullYear()) - 90;
    let max = (new Date().getFullYear()) - 15;
    this.minYear = new Date(min, 11, 31);
    this.maxYear = new Date(max, 11, 31);

    this.updateEmailModal = new window.bootstrap.Modal(document.getElementById('updateEmailModal'));
    this.deleteAccountModal = new window.bootstrap.Modal(document.getElementById('deleteAccountModal'));
    this.smsValidationModal = new window.bootstrap.Modal(document.getElementById('smsValidationModal'));
    this.termsAndConditionsModal = new window.bootstrap.Modal(document.getElementById('termsAndConditions'));
    this.genericModal = new window.bootstrap.Modal(document.getElementById('genericModal'));
    this.changePasswordModal = new window.bootstrap.Modal(document.getElementById('changePasswordModal'));
    this.checkEmployeeModal = new window.bootstrap.Modal(document.getElementById('checkEmployeeModal'));
  }

  showTermsAndConditions() {
    this.spinner.show();
    this.utilsService.getTermsOfService()
      .subscribe({
        next: (response: any) => {
          this.termsAndConditions.title = response.title;
          this.termsAndConditions.content = response.content;
          this.spinner.hide();
          this.termsAndConditionsModal.show();
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            this.termsAndConditionsModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  getProfile() {
    this.spinner.show();
    this.profileService.getProfile()
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.firstname = response.user.first_name;
          this.lastname = response.user.last_name;
          this.originalemail = response.user.email_address;
          this.email = response.user.email_address;
          this.originalphone = response.user.phone_number;
          this.birthday = response.user.birthdate;
          this.address = response.user.address.country ? response.user.address.country.country_id : null;
          this.contact_consent = response.contact_consent;
          this.getCountries();
          this.isUserValidated();
          if (this.contact_consent === 0) {
            this.switchChecked = false;
          } else {
            this.switchChecked = true;
          }
          for (let metadata of response.metadata) {
            if (metadata.user_metadataField_id == environment.cedula_user_metadataField_id) {
              this.idnumber = metadata.value;
              this.user_metadata_id = metadata.user_metadata_id;
            }
            if (metadata.user_metadataField_id == environment.gender_user_metadataField_id) {
              this.gender = this.getGender(metadata.value);
            }
          }
        },
        error: (error) => {
          this.spinner.hide();
        },
        complete: () => console.info('complete')
      });
  }

  getCountries() {
    this.utilsService.getCountries()
      .subscribe({
        next: (response: any) => {
          this.countries = <Array<Country>>response;
          this.filteredCountries = <Array<Country>>response;
          for (let country of this.countries) {
            if (country.code == this.phoneCountry) {
              this.phoneValidate = country.phone_validate;
            }
          }
          if (this.address != null) {
            this.showEmptyAddressMsg = false;
            for (let country of this.countries) {
              if (country.country_id == this.address) {
                this.countrySelected = country;
              }
            }
          } else {
            this.showEmptyAddressMsg = true;
          }
        },
        error: (error) => {
          console.log(error.error.error.errors[0].message);
        },
        complete: () => console.info('complete')
      });
  }

  onCountryCodeSelected(item: any): void {
    this.showEmptyAddressMsg = false;
    this.imgCountrySelected = item.flag_url;
    this.phoneNumberCode = item.phone_code;
    this.phoneCountry = item.code;
    this.phoneValidate = item.phone_validate;
  }

  onEmailChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    if (this.email === textvalue) {
      let email = textvalue.trim().toLowerCase();
      if (!this.validateEmail(email)) {
        this.isValidEmail = false;
      } else {
        this.isValidEmail = true;
        this.onCheckEmailExists(encodeURIComponent(email));
      }
    }
  }

  onCheckEmailExists(email: any) {
    this.authService.userExists(email)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.isEmailExists = response.exists;
            this.showInvalidEmailAlert = this.isEmailExists ? true : false;
          }
        },
        error: (error) => {
          console.log('message-error', error.status);
        },
        complete: () => {
        }
      });
  }

  onCheckIdNumberExists(idNumber: any) {
    this.authService.cedulaExists(idNumber)
      .subscribe({
        next: (response: any) => {
          this.loadingIdNumber = false;
          if (response) {
            this.isIdNumberExists = response.exists;
            if (response.exists) {
              this.isValidIdNumber = false;
              this.isInvalidIdNumber = true;
            } else {
              this.isValidIdNumber = true;
              this.isInvalidIdNumber = false;
            }
          }
        },
        error: (error) => {
          this.loadingIdNumber = false;
          console.log('message-error', error.status);
        },
        complete: () => console.info('complete')
      });
  }

  isValidUserID(cedula: any) {
    if (isNaN(cedula)) {
      return false;
    }
    //Preguntamos si la cedula consta de 10 digitos
    if (cedula.length === 10) {
      //Obtenemos el digito de la region que sonlos dos primeros digitos
      let digito_region = cedula.substring(0, 2);

      //Pregunto si la region existe ecuador se divide en 24 regiones
      if (digito_region >= 1 && digito_region <= 24) {
        // Extraigo el ultimo digito
        let ultimo_digito = cedula.substring(9, 10);

        //Agrupo todos los pares y los sumo
        let pares = parseInt(cedula.substring(1, 2)) + parseInt(cedula.substring(3, 4)) + parseInt(cedula.substring(5, 6)) + parseInt(cedula.substring(7, 8));

        //Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
        let numero1 = cedula.substring(0, 1);
        numero1 = (numero1 * 2);
        if (numero1 > 9) {
          numero1 = (numero1 - 9);
        }

        let numero3 = cedula.substring(2, 3);
        numero3 = (numero3 * 2);
        if (numero3 > 9) {
          numero3 = (numero3 - 9);
        }

        let numero5 = cedula.substring(4, 5);
        numero5 = (numero5 * 2);
        if (numero5 > 9) {
          numero5 = (numero5 - 9);
        }

        let numero7 = cedula.substring(6, 7);
        numero7 = (numero7 * 2);
        if (numero7 > 9) {
          numero7 = (numero7 - 9);
        }

        let numero9 = cedula.substring(8, 9);
        numero9 = (numero9 * 2);
        if (numero9 > 9) {
          numero9 = (numero9 - 9);
        }

        let impares = numero1 + numero3 + numero5 + numero7 + numero9;

        //Suma total
        let suma_total = (pares + impares);

        //extraemos el primero digito
        let primer_digito_suma = String(suma_total).substring(0, 1);

        //Obtenemos la decena inmediata
        let decena = (parseInt(primer_digito_suma) + 1) * 10;

        //Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
        let digito_validador = decena - suma_total;

        //Si el digito validador es = a 10 toma el valor de 0
        if (digito_validador == 10)
          digito_validador = 0;

        //Validamos que el digito validador sea igual al de la cedula
        if (digito_validador == ultimo_digito) {
          console.log('la cedula:' + cedula + ' es correcta');
          this.alertIdNumber = '';
          return true;
        } else {
          console.log('la cedula:' + cedula + ' es incorrecta');
          this.alertIdNumber = this.translate.instant('idinvalid');
        }

      } else {
        // imprimimos en consola si la region no pertenece
        console.log('Esta cedula no pertenece a ninguna region');
        this.alertIdNumber = this.translate.instant('idregion');
      }
    } else {
      //imprimimos en consola si la cedula tiene mas o menos de 10 digitos
      console.log('Esta cedula tiene menos de 10 Digitos', cedula.length);
      this.alertIdNumber = this.translate.instant('idlength');
    }
    return false;
  }

  onIdNumberChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.idnumber = textvalue;
    this.loadingIdNumber = false;
    if (environment.isValidateCedulaRequired) {
      if (!this.isValidUserID(textvalue)) {
        this.isInvalidIdNumber = true;
        this.isValidIdNumber = false;
      } else {
        this.isInvalidIdNumber = false;
        this.loadingIdNumber = true;
        setTimeout(() => {
          this.onCheckIdNumberExists(textvalue);
        }, 150);
      }
    } else {
      if (textvalue.trim() != '') {
        this.isInvalidIdNumber = false;
        this.isValidIdNumber = true;
      } else {
        this.isInvalidIdNumber = true;
        this.isValidIdNumber = false;
      }
    }
  }

  validateEmail(email: any) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  updateProfile() {
    let body = {};
    if (this.originalemail == this.email) {
      if (this.isValidIdNumber) {
        let array_metadata = [];
        let idnumber_metadata = {
          'user_metadata_id': this.user_metadata_id,
          'user_metadataField_id': environment.cedula_user_metadataField_id,
          'field': 'Cedula',
          'value': this.idnumber,
          'validation': null,
          'input_type': null
        };
        array_metadata.push(idnumber_metadata);
        body = {
          'first_name': this.firstname,
          'last_name': this.lastname,
          'contact_consent': this.contact_consent,
          'birthdate': this.birthday,
          'metadata': array_metadata
        };
      } else {
        body = {
          'first_name': this.firstname,
          'last_name': this.lastname,
          'birthdate': this.birthday,
          'contact_consent': this.contact_consent
        };
      }
      this.spinner.show();
      this.profileService.updateProfile(body)
        .subscribe({
          next: (response: any) => {
            this.spinner.hide();
            this.genericMsg = this.translate.instant('profile_view.msg_update');
            this.genericModal.show();
          },
          error: (error) => {
            this.spinner.hide();
            if (error.status == 200) {
              this.genericMsg = this.translate.instant('profile_view.msg_update');
              this.genericModal.show();
            }
          },
          complete: () => console.info('complete')
        });
    } else {
      if (this.email != null && this.email != '' && this.isValidEmail && !this.isEmailExists) {
        this.updateEmailModal.show();
      } else {
        this.genericMsg = this.translate.instant('invalid_email');
        this.genericModal.show();
      }
    }
  }

  updatePassword() {
    let body = {
      'current_password': this.currentPassword,
      'password': this.password,
    };
    if (!this.isValidConfirmPass ||
      !this.currentPassword ||
      this.alertDigits ||
      this.alertLowerCase ||
      this.alertUpperCase ||
      this.alertNumeric) {
      return;
    }
    this.spinner.show();
    this.profileService.updateProfile(body)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.genericMsg = this.translate.instant('profile_view.update_password_msg');
          this.changePasswordModal.show();
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            this.genericMsg = this.translate.instant('profile_view.update_password_msg');
            this.genericModal.show();
          } else {
            this.genericMsg = error.error.error.errors[0].message;
            this.genericModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  updateEmail() {
    let body = {};
    if (this.isValidIdNumber) {
      let array_metadata = [];
      let idnumber_metadata = {
        'user_metadata_id': this.user_metadata_id,
        'user_metadataField_id': environment.cedula_user_metadataField_id,
        'field': 'Cedula',
        'value': this.idnumber,
        'validation': null,
        'input_type': null
      };
      array_metadata.push(idnumber_metadata);
      body = {
        'current_password': this.currentPassword,
        'email_address': this.email,
        'first_name': this.firstname,
        'last_name': this.lastname,
        'birthdate': this.birthday,
        'contact_consent': this.contact_consent,
        'metadata': array_metadata
      };
    } else {
      body = {
        'current_password': this.currentPassword,
        'email_address': this.email,
        'first_name': this.firstname,
        'last_name': this.lastname,
        'birthdate': this.birthday,
        'contact_consent': this.contact_consent
      };
    }
    this.spinner.show();
    this.profileService.updateProfile(body)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.spinner.hide();
          this.updateEmailModal.hide();
          this.navigationService.onUpdateEmail.next(true);
          this.onLogout();
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            this.updateEmailModal.hide();
            this.navigationService.onUpdateEmail.next(true);
            this.onLogout();
          } else {
            this.genericMsg = error.error.error.errors[0].message;
            this.genericModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  checkEmployee() {
    if (!this.idnumber || this.isIdNumberExists || this.loadingIdNumber) {
      return;
    }
    let array_metadata = [];
    let idnumber_metadata = {
      'user_metadata_id': this.user_metadata_id,
      'user_metadataField_id': environment.cedula_user_metadataField_id,
      'field': 'Cedula',
      'value': this.idnumber,
      'validation': null,
      'input_type': null
    };
    array_metadata.push(idnumber_metadata);
    let body = {
      'metadata': array_metadata
    };
    this.spinner.show();
    this.profileService.updateProfile(body)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.checkEmployeeModal.hide();
          this.idnumber = '';
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            this.checkEmployeeModal.hide();
          } else {
            this.genericMsg = error.error.error.errors[0].message;
            this.genericModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  onCloseCheckEmployee() {
    this.idnumber = '';
    this.isIdNumberExists = false;
    this.isInvalidIdNumber = false;
    this.isValidIdNumber = true;
  }

  updatePhoneNumber() {
    if (this.newPhone != '' && this.originalphone != this.newPhone) {
      let body = {
        'phone_number': {
          'number': this.newPhone,
          'code': this.phoneNumberCode
        }
      };
      this.spinner.show();
      this.profileService.updateProfile(body)
        .subscribe({
          next: (response: any) => {
            this.spinner.hide();
            this.sendActivationSMS();
          },
          error: (error) => {
            this.spinner.hide();
            if (error.status == 200) {
              this.sendActivationSMS();
            }
          },
          complete: () => console.info('complete')
        });
    }
  }

  sendActivationSMS() {
    this.spinner.show();
    this.profileService.sendActivationSMS(this.newPhone, this.phoneCountry)
      .subscribe({
        next: () => {
          this.spinner.hide();
          this.smsValidationModal.show();
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 200) {
            this.smsValidationModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  onValidateCode() {
    if (this.digitos != '' && this.digitos.length == 6) {
      this.spinner.show();
      this.authService.userActivate(this.digitos)
        .subscribe({
          next: () => {
            this.spinner.hide();
            this.smsValidationModal.hide();
            this.openSnackBar(this.translate.instant('profile_view.phone_number_view.updated'));
            this.isUserValidated();
          },
          error: (error) => {
            this.spinner.hide();
            if (error.status == 200) {
              this.smsValidationModal.hide();
              this.openSnackBar(this.translate.instant('profile_view.phone_number_view.updated'));
              this.isUserValidated();
            } else {
              this.digitos = '';
              this.openSnackBar(error.error.error.errors[0].message ? error.error.error.errors[0].message : 'Please try again later');
            }
          },
          complete: () => console.info('complete')
        });
    }
  }

  isUserValidated() {
    this.authService.userIsValidate()
      .subscribe({
        next: (data: any) => {
          if (data.status && this.originalphone != '' && this.originalphone != null) {
            this.isVerifiedPhoneNumber = data.status.Sms;
          }
        },
        error: (error) => {
          console.log(error.error.error.errors[0].message);
        },
        complete: () => console.info('complete')
      });
  }

  public onDeleteAccountSubmit() {
    this.spinner.show();
    this.profileService.deleteProfileSubmit()
      .subscribe({
        next: () => {
          this.spinner.hide();
          this.deleteAccountModal.show();
        },
        error: (error) => {
          this.spinner.hide();
          if (error.status == 204) {
            this.deleteAccountModal.show();
          }
        },
        complete: () => console.info('complete')
      });
  }

  public showProfileView() {
    this.hidePasswordView();
    this.hideEditPhoneView();
    this.hideNotificationsView();
    this.showProfile = true;
  }

  public showPasswordView() {
    this.hideProfileView();
    this.hideEditPhoneView();
    this.hideNotificationsView();
    this.editPassword = true;
  }

  public showEditPhoneView() {
    this.hidePasswordView();
    this.hideProfileView();
    this.hideNotificationsView();
    this.editPhoneNumber = true;
  }

  public showNotificationsView() {
    this.hideProfileView();
    this.hidePasswordView();
    this.hideEditPhoneView();
    this.showNotifications = true;
  }

  public hideProfileView() {
    this.showProfile = false;
  }

  public hidePasswordView() {
    this.editPassword = false;
  }

  public hideEditPhoneView() {
    this.editPhoneNumber = false;
    this.isUserValidated();
  }

  public hideNotificationsView() {
    this.showNotifications = false;
  }

  getFormatDate(timestampdate: any) {
    if (timestampdate != undefined) {
      let d = new Date(timestampdate * 1000);
      return this.getMonthText(d.getUTCMonth()) + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    }
    return '';
  }

  getMonthText(d: any) {
    // let d = new Date(fecha);
    var month = new Array();
    month[0] = this.translate.instant('months.month_1');
    month[1] = this.translate.instant('months.month_2');
    month[2] = this.translate.instant('months.month_3');
    month[3] = this.translate.instant('months.month_4');
    month[4] = this.translate.instant('months.month_5');
    month[5] = this.translate.instant('months.month_6');
    month[6] = this.translate.instant('months.month_7');
    month[7] = this.translate.instant('months.month_8');
    month[8] = this.translate.instant('months.month_9');
    month[9] = this.translate.instant('months.month_10');
    month[10] = this.translate.instant('months.month_11');
    month[11] = this.translate.instant('months.month_12');
    var mes = month[d];
    return mes;
  }

  onPasswordChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    if (!this.passwordDigits(textvalue)) {
      this.alertDigits = this.translate.instant('password_characters');
    } else {
      this.alertDigits = '';
    }
    if (!this.passwordLowercase(textvalue)) {
      this.alertLowerCase = this.translate.instant('password_lowercase');
    } else {
      this.alertLowerCase = '';
    }
    if (!this.passwordUppercase(textvalue)) {
      this.alertUpperCase = this.translate.instant('password_uppercase');
    } else {
      this.alertUpperCase = '';
    }
    if (!this.passwordNumeric(textvalue)) {
      this.alertNumeric = this.translate.instant('password_number');
    } else {
      this.alertNumeric = '';
    }
    if (this.validatePassword(textvalue)) {
      this.isValidPassword = true;
    } else {
      this.isValidPassword = false;
    }
    if (this.confirmPass && this.password.toLowerCase() !== this.confirmPass.toLowerCase()) {
      this.alertConfirm = this.translate.instant('confirm_password_msg');
      this.isInvalidConfirmPass = true;
      this.isValidConfirmPass = false;
    } else {
      this.alertConfirm = '';
      this.isInvalidConfirmPass = false;
      this.isValidConfirmPass = true;
    }
  }

  onPasswordConfirmChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.confirmPass = textvalue;
    if (this.password.toLowerCase() !== textvalue.toLowerCase()) {
      this.alertConfirm = this.translate.instant('confirm_password_msg');
      this.isInvalidConfirmPass = true;
      this.isValidConfirmPass = false;
    } else {
      this.alertConfirm = '';
      this.isInvalidConfirmPass = false;
      this.isValidConfirmPass = true;
    }
  }

  passwordDigits(password: string) {
    //Check there is at least # characters in the string.
    let re = /^(?=.{6,}$).*$/;
    return re.test(password);
  }

  passwordLowercase(password: string) {
    //Check if there is at least one lowercase in string.
    let re = /^(?=.*?[a-z]).*$/;
    return re.test(password);
  }

  passwordUppercase(password: string) {
    //Check if there is at least one uppercase in string.
    let re = /^(?=.*?[A-Z]).*$/;
    return re.test(password);
  }

  passwordNumeric(password: string) {
    //Check if there is at least one uppercase in string.
    let re = /^(?=.*?[0-9]).*$/;
    return re.test(password);
  }

  validatePassword(pass: string) {
    let re = /^(?=.{6,}$)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*$/;
    return re.test(pass);
  }

  onPhoneNumberChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.loadingIdNumber = false;
    this.showInvalidPhoneNumberAlert = true;
    if (this.phoneValidate) {
      if (!this.validatePhoneNumber(this.phoneValidate, textvalue)) {
        this.isValidPhoneNumber = false;
        this.isPhoneNumberExists = false;
      } else {
        this.isValidPhoneNumber = true;
        this.onCheckPhoneNumber();
      }
    } else {
      if (textvalue.length == environment.phoneNumberLength) {
        this.isValidPhoneNumber = true;
        this.onCheckPhoneNumber();
      } else {
        this.isPhoneNumberExists = false;
        this.isValidPhoneNumber = false;
      }
    }
  }

  validatePhoneNumber(phoneValidate: string, phoneNumber: string): boolean {
    let re = new RegExp(phoneValidate.replace(/\//g, ''));
    return re.test(phoneNumber);
  }

  onCheckPhoneNumber() {
    let mobile_data = {
      number: this.newPhone,
      country: this.phoneCountry,
      vendor_id: environment.vendor
    };
    this.authService.mobileExists(mobile_data)
      .subscribe({
        next: (response: any) => {
          this.isPhoneNumberExists = !response.available;
        },
        error: (error) => {
          console.log('message-error', error.status);
        },
        complete: () => console.info('complete')
      });
  }

  isValidUserPhoneNumber(phoneNumer: any) {
    const valid_prefixes = [
      300,
      301,
      302,
      303,
      304,
      305,
      306,
      310,
      311,
      312,
      314,
      315,
      316,
      317,
      318,
      319,
      320,
      321,
      322,
      323,
      324,
      325,
      350,
      351];
    if (isNaN(phoneNumer)) {
      return false;
    }
    //Preguntamos si la phoneNumer consta de 10 digitos
    if (phoneNumer.length == 10) {
      //Obtenemos el digito de la region que sonlos tres primeros digitos
      let digito_region = phoneNumer.substring(0, 3);
      //Pregunto si la region existe Colombia
      for (let i = 0; i < valid_prefixes.length; i++) {
        if (digito_region == valid_prefixes[i]) {
          this.alertPhoneNumber = '';
          return true;
        }
      }
      // imprimimos en consola si la region no pertenece
      console.log('Este phoneNumer no pertenece a ninguna region');
      // this.alertPhoneNumber = this.translate.instant("phoneregion");
    } else {
      //imprimimos en consola si la phoneNumer tiene mas o menos de 10 digitos
      console.log('Este phoneNumer tiene menos de 10 Digitos', phoneNumer.length);
      // this.alertPhoneNumber = this.translate.instant("phonelength");
    }
    return false;
  }

  public onCheckedMsg(obj: any) {
    this.switchChecked = obj.checked;
    if (obj.checked) {
      this.contact_consent = 3;
    } else {
      this.contact_consent = 0;
    }
  }

  public getGender(key: string) {
    key = key.toLowerCase();
    switch (key) {
      case 'f':
        return this.translate.instant('genders.f');
      case 'm':
        return this.translate.instant('genders.m');
      case 'o':
        return this.translate.instant('genders.o');
      default:
        return '';
        break;
    }
  }

  filterFunction(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.filteredCountries = this.performFilter(textvalue);
  }

  performFilter(filterBy: string): any[] {
    filterBy = filterBy.toLowerCase();
    return this.countries.filter((country: any) =>
      country.name.toLowerCase().indexOf(filterBy) !== -1 || country.phone_code.indexOf(filterBy) !== -1
    );
  }

  get listFilter(): any {
    return this.filteredCountries;
  }

  set listFilter(value: any) {
    this.filteredCountries = value;
  }

  onCheckEmployee() {
    this.checkEmployeeModal.show();
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, this.translate.instant('close_btn'), {
      duration: 8000,
    });
  }

  onLogout() {
    this.cookieService.delete('accesstoken', '/');
    this.cookieService.deleteAll();
    this.router.navigate(['/']);
  }
}

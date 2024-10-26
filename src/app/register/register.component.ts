import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
import {PhoneNumber, Register} from 'src/models/account';
import {Country} from 'src/models/utils';
import {AuthenticationService} from 'src/services/authentication.service';
import {ProfileService} from 'src/services/profile.service';
import {UtilsService} from 'src/services/util.service';
import {TranslateService} from '@ngx-translate/core';
import {ModalService} from 'src/services/modal.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public registerParams: Register;

  public city = '';
  public address = '';
  public passport_number = '';
  public fechaSelected: string | Date = '';
  public generoSelected = 'F';
  public confirmEmail = '';
  public minAge: number = 18;

  //Alerts
  public alertDigits = '';
  public alertLowerCase = '';
  public alertUpperCase = '';
  public alertNumeric = '';
  public alertIdNumber = '';
  public alertPhoneNumber = '';

  // Validaciones
  public isEmailExists = false;
  public isIdNumberExists = false;
  public isValidPassword = false;
  public isValidPhoneNumber = false;
  public isPhoneNumberExists = false;

  // Icons
  public isInvalidEmail = false;
  public isValidConfirmEmail = false;
  public isInvalidConfirmEmail = false;
  public isValidIdNumber = false;
  public isInvalidIdNumber = false;
  public isInvalidName = false;
  public isInvalidLastName = false;
  public isValidBirthdayDate = false;

  public loadingEmail = false;
  public loadingIdNumber = false;
  public loadingRegister = false;

  public currentStep = 1;
  public viewStep1 = true;
  public viewStep2 = false;
  public viewStep3 = false;
  public showFinalView = false;

  public showGenderList = false;
  public showCountryList = false;
  public imgCountrySelected = '';
  public countries: Array<Country>;
  public filteredCountries: Array<Country>;
  public genders: string = '';

  public digitos = '';
  private placesTemp = [];
  // public placesSuggest: ObservableArray<TokenModel>;

  public passicon = true;
  public showPass: string = '';
  public hidePass: string = '';

  public showCedula;
  public showPassport;
  public isGenderRequired;
  public isCedulaRequired;
  public isPassportRequired;
  public isValidConfirmIdNumber = false;

  termsTitle = '';
  termsContent = '';
  public showTermsView = false;

  public maxYear: string = '';
  public minYear: string = '';

  public showNewPlacesList = false;
  public newPlaceSelected = '';
  public newPlaces = [];
  public logoUrl: string;

  public phoneCountry: string = '';
  public showInvalidPhoneNumberAlert = false;
  public genericMsg = '';
  public consentCheck = true;
  private phoneValidate = null;
  public deepCopyDNI = '';
  public deepCopyConfirmDNI = '';
  public confirmDni = '';

  cedulaUpdate = new Subject<string>();


  registerForm: FormGroup = new FormGroup({
    email_address: new FormControl(),
    confirmEmail: new FormControl(),
    password: new FormControl(),
  });

  constructor(
    private utilsService: UtilsService,
    private authService: AuthenticationService,
    private router: Router,
    public translate: TranslateService,
    private profileService: ProfileService,
    private modalService: ModalService,
    private spinner: NgxSpinnerService,
    private cookieService: CookieService,
    private activeroute: ActivatedRoute,
    private formBuilder: FormBuilder) {
    this.logoUrl = environment.baseAssetsUrl + 'assets/images/logo-login.png';
    this.registerParams = new Register();
    this.countries = new Array<Country>();
    this.filteredCountries = new Array<Country>();
    this.registerParams.phone_number = new PhoneNumber();
    this.registerParams.first_name = '';
    this.registerParams.last_name = '';
    this.registerParams.email_address = '';
    this.phoneCountry = environment.phone_number_country;
    this.registerParams.phone_number.code = environment.phone_number_code;
    this.imgCountrySelected = environment.phone_number_flag;
    this.isGenderRequired = environment.isGenderRequired;
    this.isCedulaRequired = environment.isCedulaRequired;
    this.isPassportRequired = environment.isPassportRequired;
    this.showPassport = environment.showPassportField;
    this.showCedula = environment.showCedulaField;
    // Debounce cedula change.
    this.cedulaUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged())
      .subscribe(value => {
        this.onIdNumberChange()
      });
  }

  ngOnInit(): void {
    this.getCountries(null);

    var showcharCode = 0xf06e;
    this.showPass = String.fromCharCode(showcharCode);
    var hidecharCode = 0xf070;
    this.hidePass = String.fromCharCode(hidecharCode);

    let min = (new Date().getFullYear()) - 90;
    let max = (new Date().getFullYear()) - 15;

    let registerInviteToken = this.activeroute.snapshot.queryParams['invite'];
    if (registerInviteToken) {
      this.cookieService.set('invitetoken', registerInviteToken);
    }

    /* isCedulaRequired: false,
  isGenderRequired: true,
  isPassportRequired */
    this.registerForm = this.formBuilder.group(
      {
        email_address: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\w+([\.-]?\w+(\+[a-zA-Z0-9]*)?)?(\.[\w-]+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
        confirmEmail: [
          '',
          Validators.required],
        password: [
          '',
          Validators.required],
        name: [
          '',
          [
            Validators.required,
            this.noWhitespaceValidator]],
        lastname: [
          '',
          [
            Validators.required,
            this.noWhitespaceValidator]],
      },
    );
  }

  validateDate() {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - this.minAge, today.getMonth(), today.getDate());
    if (!this.fechaSelected) {
      this.isValidBirthdayDate = false;
      return;
    }
    if (this.fechaSelected instanceof Date && !isNaN(this.fechaSelected.valueOf())) {
      this.isValidBirthdayDate = minDate >= this.fechaSelected;
      return;
    }
    this.isValidBirthdayDate = false;
  }

  onHideNewPlacesList() {
    this.showNewPlacesList = false;
  }

  public onCheckedTerms(value: any) {
    this.registerParams.terms = Number(value.currentTarget.checked);
    this.consentCheck = value.currentTarget.checked;
    this.onCheckedConsent(value);
  }

  public onCheckedConsent(value: any) {
    this.registerParams.contact_consent = value.currentTarget.checked ? 3 : 0;
  }

  openGenderList() {
    this.showGenderList = true;
  }

  closeGenderList() {
    this.showGenderList = false;
  }

  openCountryList() {
    this.showCountryList = true;
  }

  closeCountryList() {
    this.showCountryList = false;
  }

  onCountryCodeSelected(selectedCountry: any): void {
    this.registerParams.phone_number.code = selectedCountry.phone_code;
    this.phoneCountry = selectedCountry.code;
    this.cookieService.set('phone_country', this.phoneCountry);
    this.phoneValidate = selectedCountry.phone_validate;
  }

  getCountries(listview: any) {
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
          if (listview != null) {
            listview.notifyPullToRefreshFinished();
          }
        },
        error: (error) => {
          console.log('message-error', error.status);
        },
        complete: () => console.info('complete')
      });
  }

  goStep2() {
    this.currentStep = 2;
    this.viewStep2 = true;
    this.viewStep1 = false;
    this.viewStep3 = false;
    this.showFinalView = false;
  }

  goStep3() {
    this.currentStep = 3;
    this.viewStep3 = true;
    this.viewStep1 = false;
    this.viewStep2 = false;
    this.showFinalView = false;
  }

  onPickDate(event: any) {
    this.fechaSelected = event;
    let ts = Math.round(new Date(event).getTime() / 1000);
    this.registerParams.birthdate = ts;
    this.validateDate();
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

  onIdNumberChangeFormat(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.loadingIdNumber = false;
    this.deepCopyDNI = this.notAllowSpecialChars(event);
    this.registerParams.cedula = this.deepCopyDNI;
  }

  notAllowSpecialChars(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    // Replace non-numeric characters using a regular expression
    const sanitizedValue = inputValue.replace(/\D/g, ''); // \D matches non-digits
    // Update the input value with sanitized content
    if (sanitizedValue !== inputValue) {
      inputElement.value = sanitizedValue;
    }
    return inputElement.value;
  }

  onIdNumberChange() {
    if (environment.isValidateCedulaRequired) {
      if (!this.isValidUserID(this.deepCopyDNI)) {
        this.isInvalidIdNumber = true;
        this.isValidIdNumber = false;
        this.loadingIdNumber = false;
      } else {
        this.isInvalidIdNumber = false;
        this.isValidIdNumber = true;
        this.loadingIdNumber = true;
        this.onCheckIdNumberExists(this.registerParams.cedula);
      }
      if (this.confirmDni) {
        if (this.confirmDni.trim() === this.registerParams.cedula?.trim()) {
          this.isValidConfirmIdNumber = true;
          this.alertIdNumber = '';
        } else {
          this.isValidConfirmIdNumber = false;
          this.alertIdNumber = this.translate.instant('idinvalid_confirm');
        }
      }
    } else {
      if (this.registerParams.cedula) {
        this.isInvalidIdNumber = false;
        this.isValidIdNumber = true;
        this.onCheckIdNumberExists(this.registerParams.cedula);
      }
    }
  }

  onConfirmIdNumberChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.deepCopyConfirmDNI = textvalue.replace('-', '');
    this.confirmDni = this.deepCopyConfirmDNI;
    if (this.confirmDni.trim() === this.registerParams.cedula?.trim()) {
      this.isValidConfirmIdNumber = true;
      this.alertIdNumber = '';
    } else {
      this.isValidConfirmIdNumber = false;
      this.alertIdNumber = this.translate.instant('idinvalid_confirm');
    }
  }

  onPhoneNumberChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.loadingIdNumber = false;
    if (textvalue) {
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
    } else {
      this.showInvalidPhoneNumberAlert = false;
    }
  }

  validatePhoneNumber(phoneValidate: string, phoneNumber: string): boolean {
    let re = new RegExp(phoneValidate.replace(/\//g, ''));
    return re.test(phoneNumber);
  }

  onEmailChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.loadingEmail = false;
    let email = textvalue.trim().toLowerCase();
    let confirmEmail = this.registerForm.get('confirmEmail')?.value;
    this.isInvalidConfirmEmail = email != confirmEmail;
    if (!this.validateEmail(email)) {
      this.isInvalidEmail = false;
    } else {
      this.loadingEmail = true;
      this.onCheckEmailExists(encodeURIComponent(email));
    }
  }

  onEmailConfirmChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.confirmEmail = textvalue.trim().toLowerCase();
    if (!this.validateEmail(this.registerParams.email_address.trim().toLowerCase())) {
      this.isInvalidConfirmEmail = true;
    }
    this.isInvalidConfirmEmail = this.registerParams.email_address.trim().toLowerCase() != this.confirmEmail;
  }

  validateEmail(email: any) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  onPasswordChange(event: Event) {
    let textvalue = (event.target as HTMLInputElement).value;
    this.registerParams.password = this.registerForm.get('password')?.value;
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
    this.isValidPassword = this.validatePassword(textvalue);
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

  onCheckEmailExists(email: any) {
    this.authService.userExists(email)
      .subscribe({
        next: (response: any) => {
          this.loadingEmail = false;
          if (response) {
            this.isEmailExists = response.exists;
            this.isInvalidEmail = this.isEmailExists;
          }
        },
        error: (error) => {
          this.loadingEmail = false;
          console.log('message-error', error.status);
        },
        complete: () => {
        }
      });
  }

  onCheckIdNumberExists(idNumber: any) {
    console.log(idNumber)
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

  onCheckPhoneNumber() {
    let mobile_data = {
      number: this.registerParams.phone_number.number,
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

  isValidUserID(cedula: any) {
    if (isNaN(cedula)) {
      return false;
    }
    //Preguntamos si la cedula consta de 10 digitos
    if (cedula.length == 10) {
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

  onIdTypeChange(deviceValue: Event) {
    if (deviceValue == this.translate.instant('passport_number')) {
      this.showCedula = false;
      this.showPassport = true;
    } else {
      this.showPassport = false;
      this.showCedula = true;
    }
  }

  onGenderChange(event: string) {
    switch (event) {
      case this.translate.instant('genders.f'):
        this.generoSelected = 'F';
        break;
      case this.translate.instant('genders.m'):
        this.generoSelected = 'M';
        break;
      case this.translate.instant('genders.o'):
        this.generoSelected = 'O';
        break;
    }
    this.closeGenderList();
  }

  onRegister() {
    this.loadingRegister = true;
    let user_data = new Register();
    user_data.first_name = this.registerForm.get('name')?.value.trim();
    user_data.last_name = this.registerForm.get('lastname')?.value.trim();
    user_data.email_address = this.registerParams.email_address.trim().toLowerCase();
    user_data.password = this.registerParams.password.trim();
    user_data.birthdate = this.registerParams.birthdate;
    user_data.vendor = parseInt(environment.vendor);
    user_data.terms = 1;
    user_data.language = environment.lang_es;
    user_data.phone_number = {
      code: this.registerParams.phone_number.code,
      number: this.registerParams.phone_number.number
    };
    user_data.contact_consent = this.registerParams.contact_consent;

    if (this.showCedula) {
      user_data.cedula = this.registerParams.cedula;
    }

    let registerInviteToken = this.cookieService.get('invitetoken');
    if (registerInviteToken) {
      user_data.referral_code = registerInviteToken;
    }

    this.spinner.show();
    this.authService.register(user_data)
      .subscribe({
        next: (response: any) => {
          this.loadingRegister = false;
          this.cookieService.set('isAccountInvalid', 'true');
          this.cookieService.set('phone', this.registerParams.phone_number.number);
          this.cookieService.set('phone_code', this.registerParams.phone_number.code);
          this.onLogin();
        },
        error: (error) => {
          this.spinner.hide();
          this.loadingRegister = false;
          console.log('message-error', error.status);
          this.genericMsg = error.error.error.errors[0].message;
          this.openModal('modal-generic');
        },
        complete: () => console.info('complete')
      });
  }

  onLogin() {
    const user_data = {
      email_address: this.registerParams.email_address.toLowerCase(),
      password: this.registerParams.password,
      vendor: environment.vendor,
    };
    this.spinner.show();
    this.authService.login(user_data)
      .subscribe({
        next: (response: any) => {
          this.spinner.hide();
          this.cookieService.set('accesstoken', response.session_identifier, {
            path: '/',
            sameSite: 'Lax'
          });
          this.cookieService.set('email', user_data.email_address);
          this.cookieService.set('firstName', response.user_vendor.user.first_name);
          this.cookieService.set('lastName', response.user_vendor.user.last_name);
          this.cookieService.set('userId', response.user_vendor.user.id);
          this.cookieService.set('isPendingValidation', 'false');
          if (this.isEmailExists) {
            let promotionCode = this.cookieService.get('redeem');
            let checkinVendor = this.cookieService.get('vendorId');
            let transferAcount = this.cookieService.get('user_token');
            if (promotionCode) {
              this.router.navigateByUrl('/activate-promotion');
            } else if (checkinVendor) {
              this.router.navigateByUrl('/check-in');
            } else if (transferAcount) {
              this.router.navigateByUrl('/transfer-account');
            } else {
              this.router.navigateByUrl('/loyalty/orders');
            }
          } else {
            // this.isUserValidated();
            this.onSaveProfile(this.address, this.city, this.generoSelected);
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log('message-error', error.status);
          this.genericMsg = error.error.error.errors[0].message;
          this.openModal('modal-generic');
        },
        complete: () => console.info('complete')
      });
  }

  //update address
  onSaveProfile(address: any, city: any, gender: any) {
    let body = null;
    if (!this.isGenderRequired) {
      if (this.showPassport) {
        this.getMetadata(address, city, null, this.passport_number, false, true);
      } else {
        body = {
          'city': address
        };
        this.updateProfile(body);
      }
    } else {
      if (this.showPassport) {
        this.getMetadata(address, city, gender, this.passport_number, true, true);
      } else {
        this.getMetadata(address, city, gender, null, true, false);
      }
    }
  }

  updateProfile(body: any) {
    this.profileService.updateProfile(body)
      .subscribe({
        next: (response: any) => {
          this.router.navigateByUrl('/validate');
        },
        error: (error) => {
          console.log('message-error', error.status);
          if (error.status == 200) {
            this.router.navigateByUrl('/validate');
          } else {
            this.genericMsg = error.error.error.errors[0].message;
            this.openModal('modal-generic');
          }
        },
        complete: () => console.info('complete')
      });
  }

  getMetadata(address: any, city: any, gender: any, passport: any, updateGender: any, updateDni: any) {
    let array_metadata: any = [];
    this.profileService.getProfile()
      .subscribe({
        next: (response: any) => {
          for (let metadata of response.metadata) {
            if (updateGender) {
              if (metadata.user_metadataField_id == environment.gender_user_metadataField_id) {
                let gender_metadata = {
                  'user_metadata_id': metadata.user_metadata_id,
                  'user_metadataField_id': metadata.user_metadataField_id,
                  'field': 'Gender',
                  'value': gender,
                  'validation': null,
                  'input_type': null
                };
                array_metadata.push(gender_metadata);
              }
            }

            if (updateDni) {
              if (metadata.user_metadataField_id == environment.passport_user_metadataField_id) {
                let passport_metadata = {
                  'user_metadata_id': metadata.user_metadata_id,
                  'user_metadataField_id': metadata.user_metadataField_id,
                  'field': 'Passport Number',
                  'value': passport,
                  'validation': null,
                  'input_type': null
                };
                array_metadata.push(passport_metadata);
              }
            }
          }
          if (array_metadata.length > 0) {
            // let body = {
            //     "address1": address,
            //     "city": city,
            //     "metadata": array_metadata
            // };
            let body = {
              'city': address,
              'metadata': array_metadata
            };
            this.updateProfile(body);
          } else {
            //Si no encuentra las metadatas activadas para el update,
            //solamente enviar el correo de validación
            this.router.navigateByUrl('/validate');
          }
        },
        error: (error) => {
          console.log('message-error', error.status);
          this.genericMsg = error.error.error.errors[0].message;
          this.openModal('modal-generic');
        },
        complete: () => console.info('complete')
      });
  }

  public getTermsService(id: any) {
    this.utilsService.getTermsOfService()
      .subscribe({
        next: (response: any) => {
          this.termsTitle = response.title;
          this.termsContent = response.content;
          this.showTermsView = true;
          this.modalService.open(id);
        },
        error: (error) => {
          console.log('message-error', error.status);
        },
        complete: () => console.info('complete')
      });
  }

  public htmlEntities(str: any) {

    // var chars = {
    //     "á" : "&aacute;",
    //     "é" : "&eacute;",
    //     "í" : "&iacute;",
    //     "ó" : "&oacute;",
    //     "ú" : "&uacute;"
    // }
    // return str.replace(/[áéíóú]/g,(c)=> { return chars[c]; });

    return String(str).replace('&ntilde;', 'ñ')
      .replace('&Ntilde;', 'Ñ')
      .replace('&amp;', '&')
      .replace('&Ntilde;', 'Ñ')
      .replace('&ntilde;', 'ñ')
      .replace('&Ntilde;', 'Ñ')
      .replace('&Agrave;', 'À')
      .replace('&Aacute;', 'Á')
      .replace('&Acirc;', 'Â')
      .replace('&Atilde;', 'Ã')
      .replace('&Auml;', 'Ä')
      .replace('&Aring;', 'Å')
      .replace('&AElig;', 'Æ')
      .replace('&Ccedil;', 'Ç')
      .replace('&Egrave;', 'È')
      .replace('&Eacute;', 'É')
      .replace('&Ecirc;', 'Ê')
      .replace('&Euml;', 'Ë')
      .replace('&Igrave;', 'Ì')
      .replace('&Iacute;', 'Í')
      .replace('&Icirc;', 'Î')
      .replace('&Iuml;', 'Ï')
      .replace('&ETH;', 'Ð')
      .replace('&Ntilde;', 'Ñ')
      .replace('&Ograve;', 'Ò')
      .replace('&Oacute;', 'Ó')
      .replace('&Ocirc;', 'Ô')
      .replace('&Otilde;', 'Õ')
      .replace('&Ouml;', 'Ö')
      .replace('&Oslash;', 'Ø')
      .replace('&Ugrave;', 'Ù')
      .replace('&Uacute;', 'Ú')
      .replace('&Ucirc;', 'Û')
      .replace('&Uuml;', 'Ü')
      .replace('&Yacute;', 'Ý')
      .replace('&THORN;', 'Þ')
      .replace('&szlig;', 'ß')
      .replace('&agrave;', 'à')
      .replace('&aacute;', 'á')
      .replace('&acirc;', 'â')
      .replace('&atilde;', 'ã')
      .replace('&auml;', 'ä')
      .replace('&aring;', 'å')
      .replace('&aelig;', 'æ')
      .replace('&ccedil;', 'ç')
      .replace('&egrave;', 'è')
      .replace('&eacute;', 'é')
      .replace('&ecirc;', 'ê')
      .replace('&euml;', 'ë')
      .replace('&igrave;', 'ì')
      .replace('&iacute;', 'í')
      .replace('&icirc;', 'î')
      .replace('&iuml;', 'ï')
      .replace('&eth;', 'ð')
      .replace('&ntilde;', 'ñ')
      .replace('&ograve;', 'ò')
      .replace('&oacute;', 'ó')
      .replace('&ocirc;', 'ô')
      .replace('&otilde;', 'õ')
      .replace('&ouml;', 'ö')
      .replace('&oslash;', 'ø')
      .replace('&ugrave;', 'ù')
      .replace('&uacute;', 'ú')
      .replace('&ucirc;', 'û')
      .replace('&uuml;', 'ü')
      .replace('&yacute;', 'ý')
      .replace('&thorn;', 'þ')
      .replace('&yuml;', 'ÿ')
      .replace('&nbsp;', '');

    // return str.replace(/[áéíóú]/g, function(chr) {
    //     return (chr in chars)
    //       ? chars[chr]
    //       : "&#"+chr.charCodeAt(0)+";";
    // });
  }

  public closeTermsView() {
    this.showTermsView = false;
  }

  public getPrivacyPolicy() {
    this.utilsService.getPrivicyPolicy()
      .subscribe({complete: console.info});
  }

  tapPass() {
    this.passicon = !this.passicon;
  }

  openModal(id: string) {
    if (id === 'modal-terms') {
      this.getTermsService(id);
    } else {
      this.modalService.open(id);
    }
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  public noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : {'whitespace': true};
  }

  protected readonly environment = environment;
  protected readonly console = console;
}

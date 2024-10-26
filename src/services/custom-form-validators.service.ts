import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const matchValidator = (
  matchTo: string,
  reverse?: boolean
): ValidatorFn => {
  return (control: AbstractControl):
    ValidationErrors | null => {
    if (control.parent && reverse) {
      const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
      if (c) {
        c.updateValueAndValidity();
      }
      return null;
    }
    return !!control.parent &&
    !!control.parent.value &&
    control.value ===
    (control.parent?.controls as any)[matchTo].value
      ? null
      : { matching: true };
  };
}

export const passwordDigits = (password: string): boolean => {
  //Check there is at least # characters in the string.
  let re = /^(?=.{6,}$).*$/;
  return re.test(password);
}

export const passwordLowercase = (password: string): boolean => {
  //Check if there is at least one lowercase in string.
  let re = /^(?=.*?[a-z]).*$/;
  return re.test(password);
}

export const passwordUppercase = (password: string): boolean => {
  //Check if there is at least one uppercase in string.
  let re = /^(?=.*?[A-Z]).*$/;
  return re.test(password);
}

export const passwordNumeric = (password: string): boolean => {
  //Check if there is at least one uppercase in string.
  let re = /^(?=.*?[0-9]).*$/;
  return re.test(password);
}


export const validatePassword = (pass: string): boolean => {
  let re = /^(?=.{6,}$)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*$/;
  return re.test(pass);
}

const onPasswordChange = (textValue: string): string => {
  if (!passwordDigits(textValue)) {
    return 'password_characters';
  }
  if (!passwordLowercase(textValue)) {
    return 'password_lowercase';
  }
  if (!passwordUppercase(textValue)) {
    return 'password_uppercase';
  }
  if (!passwordNumeric(textValue)) {
    return 'password_number';
  }
  if (!validatePassword(textValue)) {
    return 'insecure_password';
  }
  return '';
}

export const strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.value;
  const errorPassword = onPasswordChange(password)
  return errorPassword ? { [errorPassword]: true } : null;
}

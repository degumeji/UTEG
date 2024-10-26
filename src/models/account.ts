export interface IRegister {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
  birthdate: number;
  vendor: number;
  terms: number;
  language: number;
  phone_number: any;
}

export class Register implements IRegister {
  first_name: string = "";
  last_name: string = "";
  email_address: string = "";
  password: string = "";
  birthdate: number = 0;
  vendor: number = 0;
  terms: number = 1;
  language: number = 0;
  phone_number: PhoneNumber = {code: "", number: ""};
  cedula: string | null = null;
  contact_consent: number = 3;
  referral_code: string = "";
}

export class PhoneNumber {
  code: string = "";
  number: string = "";
}

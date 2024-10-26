export interface ICountry {
  country_id: number;
  code: string;
  name: string;
  phone_code: string;
  zip_validate: any;
  phone_validate: any;
  flag_url: string
}

export class Country implements ICountry {
  country_id: number = 0;
  code: string = "";
  name: string = "";
  phone_code: string = "";
  zip_validate: any;
  phone_validate: any;
  flag_url: string = "";
}

export interface ICoupon {
  id: number;
  name: string;
  legales: string;
  imagen: string;
}

export class Coupon implements ICoupon {
  id: number = 0;
  name: string = "";
  legales: string = "";
  imagen: string = "";
  available: string | number = 0;
}

export interface ISvgIcons {
  iconName: string;
  iconPath: string;
}

export interface IRewards {
  name: string;
  maxValue: number;
  valueNow: number;
  progress: number;
  available: number;
}

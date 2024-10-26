// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  apiUrl: 'https://api.spoonity.com',
  vendor: '107084',
  isCedulaRequired: false,
  isGenderRequired: true,
  isPassportRequired: false,
  showCedulaField: false,
  showPassportField: false,
  isValidateCedulaRequired: false,
  isValidatePhoneNumberRequired: false,
  phoneNumberLength: 10,
  lang_es: 3,
  lang_en: 1,
  bronzeId: 2045,
  employeeId: 3713,
  silverId: 2049,
  goldId: 2053,
  ambassadordId: 4988,
  conveniosId: 5056,
  googlepay_pass_id: 127,
  cedula_user_metadataField_id: 19,
  gender_user_metadataField_id: 17,
  passport_user_metadataField_id: 35,
  phone_number_code: '1',
  phone_number_country: 'US',
  phone_number_flag: 'https://s3.amazonaws.com/spoonity-flags/mx.png',
  catalogId: 'loyalty_pay',
  progressCatalogId: 'discount_crepa',
  barcodeType: 2,
  barcodeStyle: 'QR CODE',
  order: 'dateCreated(desc)',
  item_templateid: 1,
  points_templateid: 2,
  limited_templateid: 3,
  info_templateid: 4,
  marker_title: 'uteg',
  filterByOrderOnline: false,
  pickupIcon: 'pickup',
  orderOnline: 'order-online-icon',
  distance: '30000', //map search distance
  limitedDistance: 0, //km
  unit: 'KM',
  page: 1,
  limitStores: 300,
  baseAssetsUrl: '/uteg/',
  currencyId: 1655,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

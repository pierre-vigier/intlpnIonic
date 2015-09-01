# intlpnIonic
Simple version of intl-phone number input for Ionic

Heavily based on https://github.com/Bluefieldscom/intl-tel-input

Using https://github.com/Bluefieldscom/intl-tel-input inside Ionic framework creates incompatibilities, as by default, Ionic will handle scroll event which makes the phone number plugin not working, as the popup to choose a country is not scrollable.
I only ported the parts i needed, so i removed the national mode code.
Implemenation is dirty for now, as i need that as soon as possible.

## Getting Started
1. Install the requirements

2. Link the stylesheet
  ```html
  <link rel="stylesheet" href="path/to/intlpn.css">
  ```

3. Add the javascripts
  ```html
  <script src="path/to/intlpnIonic.js"></script>
  <script src="path/to/data.js"></script>
  <script src="path/to/lib/libphonenumber/build/utils.js"></script>
  ```

4. load the directive and use it
  ```js
  var app = angular.module('myApp', ['ionic','intlpnIonic'])...
  ```
  ```html
  <intlpn ng-model="phone.number" placehoder="placeholder" only-country="['us','fr']"></intlpn>
  ```

## Attributions
* All the logic in managing flag and dialCode from [intl-tel-input](https://github.com/Bluefieldscom/intl-tel-input)
* Formatting/validation/example number code from [libphonenumber](http://libphonenumber.googlecode.com)

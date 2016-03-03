# intlpnIonic
Simple version of intl-phone number input for Ionic

Heavily based on https://github.com/Bluefieldscom/intl-tel-input

Using https://github.com/Bluefieldscom/intl-tel-input inside Ionic framework creates incompatibilities, as by default, Ionic will handle scroll event which makes the phone number plugin not working, as the popup to choose a country is not scrollable.
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
  <intlpn ng-model="phone.number" placeholder="placeholder" only-country="['us','fr']"></intlpn>
  ```

## Configurations

A set of options can be passed to the component:
* _ng-model_: model to store the phone number in, will be set only on valid number (verified by google phonenumber utils)
* _placeholder_: Placeholder of the input
* _default-country_: Country selected by default
* _only-country_: to restrain the list of available countries, if not given full list, format : ['fr','cn']
* _national-node_: true: allow user to input phone number in national mode (without + and the international code)
* _box-header-class_: Class of the header bar of the modal to select countries
* _box-header-title_: Title of the modal to select countries
* _search-placeholder_: placeholder text of the search box in the header to select countries
* _country-iso-code_: you can bind a scope variable here, that will be updated with the current iso code of the selected country, read-only
* _country-dial-code_: you can bind a scope variable here, that will be updated with the current dial code of the selected country, read-only


Sample code:
```
<intlpn ng-model="model.field" placeholder="Placeholder" default-country="fr" only-country="['fr','cn','us','it']" national-mode="true" box-header-class="bar-energized" box-header-title="Search country" search-placeholder="search" country-iso-code="model.isocode" country-dial-code="model.dialcode"></intlpn>
```

Live example here: http://play.ionic.io/app/6d0a3832cc50

## Attributions
* All the logic in managing flag and dialCode from [intl-tel-input](https://github.com/Bluefieldscom/intl-tel-input)
* Formatting/validation/example number code from [libphonenumber](http://libphonenumber.googlecode.com)

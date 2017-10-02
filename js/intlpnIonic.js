'use strict';

require('../lib/libphonenumber/build/utils');
var allCountries = require('./data');


var intlpnCtrl = function( $ionicModal, $scope, intlpnUtils ) {
    var self = $scope;
    self.intlpnHelper = intlpnUtils.getHelper( self.onlyCountry);

    self.national = false;
    if( self.nationalMode ) {
        self.national = true;
    }
    self.boxHeaderClass = angular.isDefined( self.boxHeaderClass )?self.boxHeaderClass:"bar-positive";
    self.boxHeaderTitle = angular.isDefined(self.boxHeaderTitle )?self.boxHeaderTitle:"Search";
    self.searchPlaceholder = angular.isDefined( self.searchPlaceholder )?self.searchPlaceholder:self.boxHeaderTitle;

    self._updateDialCode = function(newDialCode) {
        var newNumber;

        // save having to pass this every time
        newDialCode = "+" + newDialCode;

        if( self.national ) {
            //in national mode, do not replace number
        } else {
            if (self.phone) {
              // if the previous number contained a valid dial code, replace it
              // (if more than just a plus character)
              var prevDialCode = self.intlpnHelper.getDialCode(self.phone);
              if (prevDialCode.length > 1) {
                newNumber = self.phone.replace(prevDialCode, newDialCode);
              } else {
                // if the previous number didn't contain a dial code, we should persist it
                // XXX: remove jquery
                var existingNumber = (self.phone.charAt(0) != "+") ? self.phone.trim() : "";
                newNumber = newDialCode + existingNumber;
              }
            } else {
              newNumber = newDialCode;
            }

            self.phone = newNumber;
        }
        self.dialCode = newDialCode;
        self.countryDialCode = self.dialCode;
    };

    self.codeFromPhone = function( number ) {
        return self.intlpnHelper.getFlagFromNumber(number);
    };

    self.isValid = function( number, countryCode ) {
        return intlTelInputUtils.isValidNumber(number, countryCode);
    }

    //default value
    if( !self.isocode && self.defaultCountry ) {
        self.isocode = self.defaultCountry;
        self.countryIsoCode = self.isocode;
        self.dialCode = '+' + self.intlpnHelper.dialCodesByIso[self.defaultCountry];
        self.countryDialCode = self.dialCode;
    }
};

intlpnCtrl.$inject = ['$ionicModal', '$scope', 'intlpnUtils'];

angular.module('intlpnIonic', ['ionic'])
.service('intlpnUtils', function() {
    var intlpnUtilsHelper = function( onlyCountry) {
        var self = this;
        self.countries = [];
        self.countryCodes = [];
        self.dialCodesByIso={};
        self.onlyCountry = onlyCountry||[];
        self._addCountryCode = function(iso2, dialCode, priority) {
            if( !(iso2 in self.dialCodesByIso) ) {
                self.dialCodesByIso[iso2] = dialCode;
            }
            if (!(dialCode in self.countryCodes)) {
                self.countryCodes[dialCode] = [];
            }
            var index = priority || 0;
            self.countryCodes[dialCode][index] = iso2;
        };
        self._initCountries = function() {
            //only countries
            if(  self.onlyCountry.length ) {
                angular.forEach( allCountries, function(value) {
                     angular.forEach( self.onlyCountry, function( restricted ) {
                         if( restricted === value.iso2 )  {
                             self.countries.push( value );
                         }
                     });
                });
            } else {
                self.countries = allCountries;
            }
            for (var i = 0; i < self.countries.length; i++) {
                  var c = self.countries[i];
                  self._addCountryCode(c.iso2, c.dialCode, c.priority);
                  // area codes
                  if (c.areaCodes) {
                    for (var j = 0; j < c.areaCodes.length; j++) {
                      // full dial code is country code + dial code
                      self._addCountryCode(c.iso2, c.dialCode + c.areaCodes[j]);
                    }
                  }
            };
        };
        self._getNumeric = function(s) {
            return s.replace(/\D/g, "");
        };
        self.getFlagFromNumber= function(number, updateDefault) {
            // try and extract valid dial code from input
            var dialCode = self.getDialCode(number);
            var countryCode = null;
            if (dialCode) {
              // check if one of the matching countries is already selected
              var codes = self.countryCodes[self._getNumeric(dialCode)];
              //alreadySelected = (this.selectedCountryData && $.inArray(this.selectedCountryData.iso2, countryCodes) != -1);
              // if a matching country is not already selected (or this is an unknown NANP area code): choose the first in the list
              //if (!alreadySelected || this._isUnknownNanp(number, dialCode)) {
                // if using onlyCountries option, countryCodes[0] may be empty, so we must find the first non-empty index
                for (var j = 0; j < codes.length; j++) {
                  if (codes[j]) {
                    countryCode = codes[j];
                    break;
                  }
                }
              //}
            } else if (number.charAt(0) == "+" && self._getNumeric(number).length) {
              // invalid dial code, so empty
              // Note: use getNumeric here because the number has not been formatted yet, so could contain bad shit
              countryCode = "";
            } else if (!number || number == "+") {
              // empty, or just a plus, so default
              countryCode = 'us';//this.options.defaultCountry.iso2;
            }

            if (countryCode !== null) {
              return countryCode;
            }
        };
        this.getDialCode= function(number) {
            var dialCode = "";
            // only interested in international numbers (starting with a plus)
            if (number && number.charAt(0) == "+") {
              var numericChars = "";
              // iterate over chars
              for (var i = 0; i < number.length; i++) {
                var c = number.charAt(i);
                // if char is number
                //XXX: replace by angular
                //if ($.isNumeric(c)) {
                if ( /^\d$/.test(c) ) {
                  numericChars += c;
                  // if current numericChars make a valid dial code
                  if (self.countryCodes[numericChars]) {
                    // store the actual raw string (useful for matching later)
                    dialCode = number.substr(0, i + 1);
                  }
                  // longest dial code is 4 chars
                  if (numericChars.length == 4) {
                    break;
                  }
                }
              }
            }
            return dialCode;
        };
        this.format_number = intlTelInputUtils.formatNumber;
        this.intlTelInputUtils = intlTelInputUtils;
    };
    return {
        getHelper: function( onlyCountry) {
            var helper = new intlpnUtilsHelper( onlyCountry);
            helper.allCountries = allCountries;
            helper._initCountries();
            return helper;
        }
    };
})
.directive('intlpnFormatter', function() {
    return {
        require: 'ngModel',
        scope: {
            'isoCode' : '@',
            'nationalMode' : '='
        },
        link: function(scope, element, attrs, ngModelController) {
            var el = element[0];
            var national = false;
            if( scope.nationalMode ) {
                national = true;
            }

            function clean(x) {
                //remove letters
                x = x.replace(/[^0-9\- +()]/g,'');
                if( national ) {
                    if( x.length > 1 ) {
                        return intlTelInputUtils.formatNumber(x, scope.isoCode, true );
                    } else {
                        return x;
                    }
                } else {
                    return intlTelInputUtils.formatNumber( x );
                }
            }

            ngModelController.$parsers.push(function(val) {
                var offset = 0;

                if( national ) {
                } else {
                    if( !/^\+/.test( val ) ) {
                        val = '+'+val;
                        offset = 1;
                    }
                }
                var cleaned = clean(val);

                // Avoid infinite loop of $setViewValue <-> $parsers
                var newStart = cleaned.length;
                var start = el.selectionStart + offset;
                var end = el.selectionEnd + offset;
                var selectionLength = end - start;
                var digitsOnTheRight = 0;
                for( var i = val.length; i >= start; i-- ) {
                    if( /^\d$/.test( val.charAt(i) ) ) {
                        digitsOnTheRight ++;
                    }
                }
                while( digitsOnTheRight > 0 && newStart > 0 ) {
                    if( /^\d$/.test( cleaned.charAt( newStart - 1 ) ) ) {
                        digitsOnTheRight--;
                    }
                    newStart--;
                }
                //move to the left while space
                while(  /^[^0-9+]$/.test( cleaned.charAt( newStart - 1 ) ) && newStart > 0 )
                    newStart--;
                // element.val(cleaned) does not behave with
                // repeated invalid elements
                ngModelController.$setViewValue(cleaned);
                ngModelController.$render();
                el.setSelectionRange(newStart, newStart);
                return cleaned;
                //return val;
            });

        }
    }
})
.directive('intlpn',  ['$ionicModal', '$timeout', '$ionicScrollDelegate', function( $ionicModal, $timeout, $ionicScrollDelegate ) {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            ngModel: '=',
            placeholder: '@',
            defaultCountry: '@',
            onlyCountry: '=',
            nationalMode: '=',
            boxHeaderClass: '@',
            boxHeaderTitle: '@',
            searchPlaceholder: '@',
            countryIsoCode: '=?',
            countryDialCode: '=?'
        },
        controller: intlpnCtrl,
        link:function (scope, element, attrs, ngModelCtrl) {
            //When model value (outside world) is updated, set the view value (in ngModel directive)
            ngModelCtrl.$formatters.push(function(modelValue) {
                //from raw value to formatted value, parenthesis, dash, ...
                if( typeof modelValue === undefined || modelValue === '' ) {
                    $timeout(function() {
                        scope.isocode = scope.defaultCountry;
                        scope.countryIsoCode = scope.isocode
                        scope.dialCode = '+' + (scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] ? scope.intlpnHelper.dialCodesByIso[scope.defaultCountry]: "");
                        scope.countryDialCode = scope.dialCode;
                    });
                }
                if( modelValue )
                    modelValue = modelValue.replace(/[^0-9]/g, "");
                if( scope.national ) {
                    //return  modelValue?intlTelInputUtils.formatNumberByType(modelValue,scope.isocode,intlTelInputUtils.numberFormat.NATIONAL):'';
                    return  modelValue?intlTelInputUtils.formatNumber('+'+modelValue):'';
                } else {
                    return  modelValue?intlTelInputUtils.formatNumber('+'+modelValue):'';
                }
            });
            //from the value in ngModel directive to my directive
            ngModelCtrl.$render = function() {
                scope.dialCode = scope.intlpnHelper.getDialCode( ngModelCtrl.$viewValue );
                scope.countryDialCode = scope.dialCode;
                scope.isocode = scope.intlpnHelper.getFlagFromNumber( ngModelCtrl.$viewValue );
                scope.countryIsoCode = scope.isocode;
                if( scope.national ) {
                    scope.phone = intlTelInputUtils.formatNumberByType(ngModelCtrl.$viewValue,scope.isocode,intlTelInputUtils.numberFormat.NATIONAL);
                } else {
                    scope.phone = ngModelCtrl.$viewValue;
                }
            };
            //from  view value (in ngModel directive) to model value (outside world)
            ngModelCtrl.$parsers.push(function(viewValue) {
                if( scope.national ) {
                    //clean everything that is not numeric or +
                    viewValue = intlTelInputUtils.formatNumberByType(viewValue, scope.isocode, intlTelInputUtils.numberFormat.INTERNATIONAL).replace(/[^0-9]/g, "");
                    return viewValue?'+' + viewValue:'';
                } else {
                    //clean everything that is not numeric or +
                    viewValue = viewValue.replace(/[^0-9]/g, "");
                    return viewValue?'+' + viewValue:'';
                }
            });
            //$setViewValue, from my directive to view value (in ngModel directive)
            scope.$watch('phone', function(newValue, oldValue) {
                ngModelCtrl.$setViewValue( scope.phone );
                if( scope.national ) {
                    //do not change flag on input
                } else {
                    if( scope.intlpnHelper.getDialCode(  scope.phone ) ) {
                        scope.dialCode = scope.intlpnHelper.getDialCode(  scope.phone );
                        scope.countryDialCode = scope.dialCode;
                        //from dialcode, validate current country
                        var countryCodes = scope.intlpnHelper.countryCodes[ scope.dialCode.replace(/[^0-9]/g, "") ];
                        var alreadySelected = (countryCodes.indexOf( scope.isocode ) > -1)?true:false;
                        if( !alreadySelected ) {
                            for (var j = 0; j < countryCodes.length; j++) {
                                if (countryCodes[j]) {
                                    scope.isocode = countryCodes[j];
                                    scope.countryIsoCode = scope.isocode;
                                    break;
                                }
                            }
                        }
                    } else if( !scope.dialCode ) {
                        //default value
                        scope.dialCode = "+"+( scope.defaultCountry && scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] ? scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] : "" );
                        scope.countryDialCode = scope.dialCode;
                    }
                }
            });
            scope.$watch('defaultCountry', function(newValue, oldValue) {
                if( !scope.phone || scope.phone === scope.dialCode ) {
                    scope.isocode = scope.defaultCountry;
                    scope.countryIsoCode = scope.isocode;
                    scope.dialCode = "+"+( scope.defaultCountry && scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] ? scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] : "" )
                    scope.countryDialCode = scope.dialCode;
                }
            });
            ngModelCtrl.$validators.validForm = function( modelValue, viewValue ) {
                //check if the cleaned value is correct
                if( scope.national ) {
                    var phone = intlTelInputUtils.formatNumberByType(scope.phone, scope.isocode, intlTelInputUtils.numberFormat.INTERNATIONAL);
                    var dial = scope.intlpnHelper.getDialCode(phone);
                    return dial === scope.dialCode && scope.isValid( modelValue, scope.isocode );
                } else {
                    return scope.isValid( modelValue );
                }
            };
            //manage focus/blur of the phone field
            var input = element.find('input');
            input.bind('focus', function() {
                if( scope.national ) {
                } else {
                    if( !scope.phone ) {
                        scope.$apply(function() {
                            if( scope.dialCode ) {
                                scope.phone = scope.dialCode;
                                scope.countryDialCode = scope.dialCode;
                                input[0].setSelectionRange(scope.dialCode.length, scope.dialCode.length );
                            }
                        });
                    }
                }
            })
            .bind('blur', function() {
                if( scope.national ) {
                } else {
                    if( scope.phone === '+' ) {
                        scope.$apply(function() {
                            scope.isocode = scope.defaultCountry;
                            scope.countryIsoCode = scope.isocode;
                            scope.dialCode = "+"+( scope.defaultCountry && scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] ? scope.intlpnHelper.dialCodesByIso[scope.defaultCountry] : "" )
                            scope.countryDialCode = scope.dialCode;
                            scope.phone = '';
                        });
                    } else if( scope.phone === scope.dialCode || !scope.intlpnHelper.getDialCode(scope.phone) ) {
                        scope.$apply(function() {
                            scope.phone = '';
                        });
                    }
                }
            });
            var modalTemplate = '<ion-modal-view>' +
                '<ion-header-bar class="'+scope.boxHeaderClass+'">' + //need to have the class before creation
                    '<h1 class="title" ng-bind=":: modalScope.boxHeaderTitle"></h1>' +
                    '<button class="button button-clear icon ion-ios-close-empty" ng-click="modalScope.close()"></button>' +
                '</ion-header-bar>' +
                    '<div class="bar bar-subheader item-input-inset" ng-if="modalScope.countries.length > 10">' +
                        '<div class="item-input-wrapper">' +
                            '<i class="icon ion-ios-search placeholder-icon"></i>' +
                            '<input type="text" autocorrect="off" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="{{:: modalScope.searchPlaceholder}}" ng-model="modalScope.pattern" ng-change="modalScope.scrollTop()">' +
                            '<i class="icon ion-close-circled placeholder-icon" ng-show="modalScope.pattern" ng-click="modalScope.pattern=\'\'"></i>' +
                        '</div>' +
                    '</div>' +
                 '<ion-content class="has-header" ng-class="(modalScope.countries.length > 10)?\'has-subheader\':\'\'">' +
                    '<ion-list>' +
                        '<ion-item collection-repeat="country in ::modalScope.countries | filter:modalScope.pattern" item-height="55px" item-width="100%"' +
                            'ng-click="modalScope.selectCountry( country )" ' +
                            'class="item-icon-left" ng-class="(country.iso2 == modalScope.currentCountry)?\'item-icon-right\':\'\'">' +
                                '<i class="icon icon-intlpn-flag {{:: country.iso2}}" ></i>' +
                                '{{:: country.name}}' +
                                '<i class="icon ion-ios-checkmark-empty" ng-if="(country.iso2 == modalScope.currentCountry)"></i>' +
                        '</ion-item>' +
                    '</ion-list>' +
                '</ion-content>' +
                '</ion-modal-view>';
            scope.modalScope = {
                selectCountry: function( country ) {
                    scope.isocode = country.iso2;
                    scope.countryIsoCode = scope.isocode;
                    scope._updateDialCode( country.dialCode );
                    scope.modal.hide();
                    $timeout(function() { input[0].focus();});
                },
                close: function() {
                    scope.modal.hide();
                },
                scrollTop: function() {
                    $ionicScrollDelegate.scrollTop(true);
                },
                countries: scope.intlpnHelper.countries,
                boxHeaderTitle: scope.boxHeaderTitle,
                searchPlaceholder: scope.searchPlaceholder
            };
            scope.modal = $ionicModal.fromTemplate( modalTemplate, {
                scope: scope
            });
            scope.pickCountry = function() {
                if( scope.intlpnHelper.countries.length == 1 )
                    return;
                scope.modalScope.pattern = '';
                scope.modalScope.currentCountry = scope.isocode;
                scope.modalScope.countries= scope.intlpnHelper.countries;
                scope.modalScope.boxHeaderTitle= scope.boxHeaderTitle;
                scope.modalScope.searchPlaceholder= scope.searchPlaceholder;
                scope.modal.show();
            };
            scope.$on('$destroy', function() {
                scope.modal.remove();
            });
        },
        replace:true,
        template: '<div class="item item-input intlpn-container">' +
                        '<i class="icon icon-intlpn-flag {{ isocode }}" ng-click="pickCountry()" ></i>'+
                        '<input intlpn-formatter national-mode="nationalMode" iso-code="{{isocode}}" type="tel" placeholder="{{placeholder||\'Phone number\'}}" ng-model="phone" >' +
                '</div>'
    };
}])
.filter('intlpnFormat', function( intlpnUtils ) {
    var helper = intlpnUtils.getHelper();
    var utils = helper.intlTelInputUtils;
    return function( input, type ) {
        var t=utils.numberFormat.INTERNATIONAL;
        if( type == 'national') {
            t=utils.numberFormat.NATIONAL;
        }
        return utils.formatNumberByType(input, null, t);
    }
});

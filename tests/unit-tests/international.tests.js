describe('InternationalPhoneInput', function() {
    var el, compile, scope, directiveScope;

    // TODO: Load the App Module
    beforeEach(module('intlpnIonic'));
    beforeEach(inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        compile = $compile;

        el = $compile('<intlpn ng-model="model.field" default-country="us"></intlpn>')(scope);
        scope.$digest();

        directiveScope = el.scope();
    }));


    describe('Formatted', function() {
        it('Default Country', function() {
            expect( el.find("input").attr("iso-code") ).toEqual("us");
            expect( el.find("i").hasClass("us") ).toBeTruthy();
        });
        it('Populated from the outside', function() {
            scope.model = {field:"+33471234567"};
            scope.$digest();
            expect( el.find("input").val()).toEqual("+33 4 71 23 45 67");
            expect( el.find("input").attr("iso-code") ).toEqual("fr");
            expect( el.find("i").hasClass("fr") ).toBeTruthy();
        });
        it('Populated from the inside', function() {
            el.find("input").val("+33 4 71 23 45 67");
            el.find("input").triggerHandler('change');
            expect( scope.model.field ).toEqual("+33471234567");
            expect( el.find("input").attr("iso-code") ).toEqual("fr");
            expect( el.find("i").hasClass("fr") ).toBeTruthy();
        });
        it('Digit by digit', function() {
            var digitInput = function( digit ) {
                el.find("input").val( el.find("input").val() + digit );
                el.find("input").triggerHandler('change');
            }
            expect( el.find("input").attr("iso-code") ).toEqual("us");
            expect( el.find("i").hasClass("us") ).toBeTruthy();
            digitInput(3);
            digitInput(3);
            expect( el.find("input").attr("iso-code") ).toEqual("fr");
            expect( el.find("i").hasClass("fr") ).toBeTruthy();
            digitInput(4);
            digitInput(7);
            digitInput(1);
            digitInput(7);
            digitInput(1);
            digitInput(7);
            digitInput(1);
            digitInput(7);
            digitInput(1);
            expect( el.find("input").val() ).toEqual("+33 4 71 71 71 71");
        });
    });
});

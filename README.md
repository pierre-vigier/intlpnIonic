# intlpnIonic
Simple version of intl-phone number input for Ionic

Heavily based on https://github.com/Bluefieldscom/intl-tel-input

Using https://github.com/Bluefieldscom/intl-tel-input inside Ionic framework creates incompatibilities, as by default, Ionic will handle scroll event which makes the phone number plugin not working, as the popup to choose a country is not scrollable.
I only ported the parts i needed, so i removed the national mode code.
Implemenation is dirty for now, as i need that as soon as possible.

/**
* A set of extensible methods to enable internationalization of enyo applications
*
* @module enyo/i18n
*/
require('enyo');

var
	dispatcher = require('./dispatcher'),
	utils = require('./utils'),
	Signals = require('./Signals');

/**
* Provides a stub function for i18n string translation. This allows strings to be wrapped in
* preparation for localization. If a i18n library is not loaded, this function will return the
* string as is.
* 
* `$L('Welcome')`
* 
* If a compatible i18n library is loaded, this function will be replaced by the i18n library's
* version, which translates wrapped strings to strings from a developer-provided resource file
* corresponding to the current user locale.
*
* @param {String} str - The {@glossary String} to translate.
* @returns {String} The translated {@glossary String}.
* @public
*/
exports.$L = new utils.Extensible(function (str) {
	return str;
});

/**
* Enyo controls may register for an `onlocalechange` signal to dynamically update their
* presentation based on changes to the user's locale. This feature is currently used in webOS,
* where Cordova for webOS listens for changes to the system locales and fires a `localechange`
* event on the `document` object. Similar functionality could be implemented on other platforms
* via a Cordova plugin or by other means.
* 
* Enyo registers an event listener for the `localechange` event and broadcasts the
* `onlocalechange` signal when the locale has changed. Before broadcasting, Enyo calls
* `enyo.updateLocale()`. The default implementation of `enyo.updateLocale()` is a stub, but a
* i18n library may override it to update its internal state before the `onlocalechange` signal
* is broadcast.
* 
* This feature is not supported on IE8, which doesn't support `addEventListener()`.
*
* @private
*/
exports.updateLocale = new utils.Extensible(function () {
	// This is a stub, to be implemented by a i18n library as needed
	Signals.send('onlocalechange');
});

dispatcher.listen(document, 'localechange', function (e) {
	exports.updateLocale();
});
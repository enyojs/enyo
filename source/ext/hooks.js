(function (enyo, scope) {
	
	/**
	* Provides a stub function for g11n string translation. This allows strings to be wrapped in
	* preparation for localization. If a g11n library is not loaded, this function will return the
	* string as is.
    * 
	* `$L('Welcome')`
    * 
	* If a compatible g11n library is loaded, this function will be replaced by the g11n library's
	* version, which translates wrapped strings to strings from a developer-provided resource file
	* corresponding to the current user locale.
	*
	* @name $L
	* @scope global
	* @type {Function}
	* @param {String} str - The {@glossary String} to translate.
	* @returns {String} The translated {@glossary String}.
	* @public
	*/
	scope.$L = function (str) {
		return str;
	};

	/**
	* THE BELOW MAY NOT BE RELEVANT MOVING FORWARD BUT IS RETAINED FOR POSTERITY.
	*
	* Enyo controls may register for an `onlocalechange` signal to dynamically update their
	* presentation based on changes to the user's locale. This feature is currently used in webOS,
	* where Cordova for webOS listens for changes to the system locales and fires a `localechange`
	* event on the `document` object. Similar functionality could be implemented on other platforms
	* via a Cordova plugin or by other means.
	* 
	* Enyo registers an event listener for the `localechange` event and broadcasts the
	* `onlocalechange` signal when the locale has changed. Before broadcasting, Enyo calls
	* `enyo.updateLocale()`. The default implementation of `enyo.updateLocale()` is a stub, but a
	* g11n library may override it to update its internal state before the `onlocalechange` signal
	* is broadcast.
	* 
	* This feature is not supported on IE8, which doesn't support `addEventListener()`.
	*
	* @private
	*/
	enyo.updateLocale = function () {
		// This is a stub, to be implemented by a g11n library as needed
		enyo.Signals.send('onlocalechange');
	};
	if (document.addEventListener) {
		document.addEventListener('localechange', function(e) {
			enyo.updateLocale();
		}, false);
	}

})(enyo, this);
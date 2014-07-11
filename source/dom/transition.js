(function(enyo, scope) {
	/**
	* @namespace enyo.dom
	*/

	/**
	 * The CSS `transition` property name, decided by which browser is identified. Ex:
	 *
	 * * `-webkit-transition`
	 * * `-moz-transition`
	 * * `transition`
	 *
	 * @type {String}
	 * @private
	 */
	enyo.dom.transition = (enyo.platform.ios || enyo.platform.android || enyo.platform.chrome || enyo.platform.androidChrome || enyo.platform.safari)
		? '-webkit-transition'
		: (enyo.platform.firefox || enyo.platform.firefoxOS || enyo.platform.androidFirefox)
			? '-moz-transition'
			: 'transition';

})(enyo, this);
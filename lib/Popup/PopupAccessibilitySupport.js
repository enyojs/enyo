var
	kind = require('../kind');

/**
* @name PopupAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: 'showing'}
	],

	/**
	* @private
	*/
	updateAccessibilityAttributes: kind.inherit(function (sup) {
		return function (was, is, prop) {
			sup.apply(this, arguments);
			this.set('accessibilityAlert', this.accessibilityDisabled ? null : this.showing);
			this.setAttribute('aria-live', 'off');
		};
	})
};
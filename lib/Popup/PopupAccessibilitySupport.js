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
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			this.set('accessibilityAlert', enabled ? this.showing : null);
			this.setAttribute('aria-live', 'off');
			this.setAttribute('aria-hidden', enabled ? !this.showing : true);
		};
	})
};
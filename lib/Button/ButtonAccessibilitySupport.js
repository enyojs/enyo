var
	kind = require('../kind');

/**
* @name ButtonAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: 'disabled'}
	],

	/**
	* @private
	*/
	updateAccessibilityAttributes: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			this.setAttribute('role', enabled ? 'button' : null);
			this.setAttribute('tabindex', enabled ? 0 : null);
			this.setAttribute('aria-disabled', enabled && this.disabled ? 'true' : null);
		};
	})
};
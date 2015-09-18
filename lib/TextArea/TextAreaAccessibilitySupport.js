var
	kind = require('../kind');

/**
* @name TextAreaAccessibilityMixin
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
			this.setAttribute('role', enabled ? 'textbox' : null);
			this.setAttribute('tabindex', enabled ? 0 : null);
			this.setAttribute('aria-multiline', enabled ? 'true' : null);
			this.setAttribute('aria-disabled', enabled && this.disabled ? 'true' : null);
		};
	})
};
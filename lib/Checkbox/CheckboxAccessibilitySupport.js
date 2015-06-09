var
	kind = require('../kind');

/**
* @name CheckboxAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: ['checked', 'disabled']}
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
			this.setAttribute('aria-checked', enabled ? this.checked : null);
			this.setAttribute('aria-disabled', enabled && this.disabled ? 'true' : null);
		};
	})
};
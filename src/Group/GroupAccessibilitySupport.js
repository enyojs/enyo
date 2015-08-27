var
	kind = require('../kind');

/**
* @name GroupAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	observers: [
		{method: 'updateAccessibilityAttributes', path: 'active'}
	],

	/**
	* @private
	*/
	updateAccessibilityAttributes: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			this.setAttribute('role', enabled ? 'group' : null);
			this.setAttribute('tabindex', enabled ? 0 : null);
			this.setAttribute('aria-activedescendant', this.active && enabled ? this.active.getId() : null);
		};
	})
};
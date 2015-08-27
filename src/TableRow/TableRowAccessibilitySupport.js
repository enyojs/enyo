var
	kind = require('../kind');

/**
* @name TableRowAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	updateAccessibilityAttributes: kind.inherit(function (sup) {
		return function (was, is, prop) {
			var enabled = !this.accessibilityDisabled;
			sup.apply(this, arguments);
			this.setAttribute('role', enabled ? 'row' : null);
			this.setAttribute('tabindex', enabled ? 0 : null);
		};
	})
};
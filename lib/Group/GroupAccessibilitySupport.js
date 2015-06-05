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
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'group');
			this.setAttribute('tabindex', 0);
		};
	}),

	/**
	* @private
	*/
	activeChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('aria-activedescendant', this.accessibilityDisabled ? null : this.active? this.active.getId() : null);
		};
	})
};
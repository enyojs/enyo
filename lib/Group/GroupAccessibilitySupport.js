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
	accessibilityDisabledChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('aria-activedescendant', this.accessibilityDisabled ? null : this.active? this.active.getId() : null);
		};
	}),

	/**
	* @private
	*/
	activeChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			if (this.accessibilityDisabled) return;
			this.setAttribute('aria-activedescendant', this.active? this.active.getId() : null);
		};
	})
};
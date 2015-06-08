var
	kind = require('../kind');

/**
* @name InputAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'textbox');
			this.setAttribute('tabindex', 0);
		};
	}),

	/**
	* @private
	*/
	accessibilityDisabledChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('aria-disabled', this.accessibilityDisabled ? null : this.disabled ? 'true' : null);
		};
	}),

	/**
	* @private
	*/
	disabledChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			if (this.accessibilityDisabled) return;
			this.setAttribute('aria-disabled', this.disabled ? 'true' : null);
		};
	})
};
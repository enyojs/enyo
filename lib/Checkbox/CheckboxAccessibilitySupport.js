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
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'checkbox');
			this.setAttribute('tabindex', 0);
		};
	}),
	
	/**
	* @private
	*/
	checkedChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
		};
	})
};
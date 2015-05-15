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
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'textbox');
			this.setAttribute('aria-multiline', true);
			this.setAttribute('tabindex', 0);
		};
	})
};
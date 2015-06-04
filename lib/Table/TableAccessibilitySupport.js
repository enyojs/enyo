var
	kind = require('../kind');

/**
* @name TableAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'grid');
			this.setAttribute('tabindex', 0);
		};
	})
};
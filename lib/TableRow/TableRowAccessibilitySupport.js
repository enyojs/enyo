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
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'row');
			this.setAttribute('tabindex', 0);
		};
	})
};
var
	kind = require('../kind');

/**
* @name TableCellAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	initAccessibility: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			this.setAttribute('role', 'gridcell');
			this.setAttribute('tabindex', 0);
		};
	})
};
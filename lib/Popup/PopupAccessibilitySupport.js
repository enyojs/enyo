var
	kind = require('../kind');

/**
* @name PopupAccessibilityMixin
* @mixin
*/
module.exports = {

	/**
	* @private
	*/
	showingChanged: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			if (this.accessibilityDisabled) return;
			this.set('accessibilityAlert', this.accessibilityDisabled ? null : this.showing);
		};
	})
};
var
	kind = require('./kind');

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
			this.set('accessibilityAlert', this.showing);
		};
	})
};
/**
* @name PopupAccessibilitySupport
* @mixin
*/
module.exports = {
	/**
	* @private
	*/
	ariaObservers: [
		{path: 'showing', method: function () {
			this.setAriaAttribute('role', this.showing ? 'alert' : this.accessibilityRole || null);
		}}
	]
};
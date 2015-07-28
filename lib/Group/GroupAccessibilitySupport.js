/**
* @name GroupAccessibilitySupport
* @mixin
*/
module.exports = {
	/**
	* @private
	*/
	accessibilityRole: 'group',

	/**
	* @private
	*/
	ariaObservers: [
		{path: 'active', method: function () {
			this.setAriaAttribute('aria-activedescendant', this.active ? this.active.getId() : null);
		}}
	]
};
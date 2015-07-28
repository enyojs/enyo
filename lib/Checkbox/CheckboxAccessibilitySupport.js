/**
* @name CheckboxAccessibilitySupport
* @mixin
*/
module.exports = {
	/**
	* @private
	*/
	accessibilityRole: 'checkbox',

	/**
	* @private
	*/
	ariaObservers: [
		{from: 'checked', to: 'aria-checked'}
	]
};
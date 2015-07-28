/**
* @name InputAccessibilitySupport
* @mixin
*/
module.exports = {
	/**
	* @private
	*/
	accessibilityRole: 'textbox',

	/**
	* @private
	*/
	ariaObservers: [
		{path: 'disabled', to: 'aria-disabled'}
	]
};
/**
* @name ButtonAccessibilitySupport
* @mixin
*/
module.exports = {
	/**
	* @private
	*/
	accessibilityRole: 'button',

	/**
	* @private
	*/
	ariaObservers: [
		{from: 'disabled', to: 'aria-disabled'},
		{from: 'accessibilityRole', to: 'role'}
	]
};
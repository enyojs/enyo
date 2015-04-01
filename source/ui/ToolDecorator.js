(function (enyo, scope) {
	/**
	* {@link enyo.ToolDecorator} lines up [components]{@link enyo.Component} in a row,
	* centered vertically.
	*
	* @class enyo.ToolDecorator
	* @extends enyo.GroupItem
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.ToolDecorator.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ToolDecorator',

		/**
		* @private
		*/
		kind: 'enyo.GroupItem',

		/**
		* @private
		*/
		classes: 'enyo-tool-decorator'
	});

})(enyo, this);

require('enyo');

var
	kind = require('../kind');

var
	Control = require('../Control');

/**
* A light-weight panels implementation that has basic support for side-to-side transitions
* between child components.
*
* @class LightPanel
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/LightPanel~LightPanel.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.LightPanel',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	* @lends module:enyo/LightPanels~LightPanels.prototype
	*/
	published: {

		/**
		* Is `true` if the panel is currently active; `false` otherwise.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		active: false
	},

	/**
	* This overridable method is called before a transition.
	*
	* @public
	*/
	preTransition: function () {},

	/**
	* This overridable method is called after a transition.
	*
	* @public
	*/
	postTransition: function () {}
});
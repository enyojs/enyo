/**
* Contains the declaration for the {@link module:enyo/LightPanels/LightPanel~LightPanel} kind.
*
* Note: LightPanel is exported from {@link module:enyo/LightPanels}. This module should not be
* required directly.
* @wip
* @module enyo/LightPanels/LightPanel
*/

require('enyo');

var
	kind = require('../kind');

var
	Control = require('../Control');

/**
* @enum {Number}
* @memberof module:enyo/LightPanels/LightPanel~LightPanel
* @public
*/
var States = {
	ACTIVE: 1,
	ACTIVATING: 2,
	DEACTIVATING: 3,
	INACTIVE: 4
};

/**
* A lightweight panels implementation that has basic support for side-to-side transitions
* between child components.
*
* @class LightPanel
* @extends module:enyo/Control~Control
* @ui
* @wip
* @public
*/
module.exports = kind(
	/** @lends module:enyo/LightPanels/LightPanel~LightPanel.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.LightPanel',

	/**
	* @private
	*/
	kind: Control,

	/**
	* The current [state]{@link module:enyo/LightPanels/LightPanel~LightPanel#States}.
	*
	* @type {module:enyo/LightPanels/LightPanel~LightPanel#States}
	* @default null
	* @public
	*/
	state: States.INACTIVE,

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

module.exports.States = States;

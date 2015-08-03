require('enyo');

var
	kind = require('../kind');

var
	Control = require('../Control');

/**
* @enum {Number}
* @memberof module:enyo/LightPanel~LightPanel
* @public
*/
var States = {
	ACTIVE:			0x0001,
	TRANSITIONING:	0x0002,
	TRANSITIONED:	0x0004
};

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
	*/
	handlers: {
		ontransitionend: 'transitionEnd'
	},

	/**
	* The current [state]{@link module:enyo/LightPanel~LightPanel#States}.
	*
	* @type {module:enyo/LightPanel~LightPanel#States}
	* @default null
	* @public
	*/
	state: null,

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
	postTransition: function () {},

	/**
	* @private
	*/
	transitionEnd: function (sender, ev) {
		if (ev.originator === this) this.set('state', (this.state & ~States.TRANSITIONING) | States.TRANSITIONED);
	}

});

module.exports.States = States;
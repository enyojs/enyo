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
	ACTIVE: 1,
	ACTIVATING: 2,
	DEACTIVATING: 3,
	INACTIVE: 4
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
	postTransition: function () {
		// TODO: this is added for backwards-compatibility and is deprecated functionality
		if (this.state == States.ACTIVE && this.activated) this.activated();
		else if (this.state == States.INACTIVE && this.deactivated) this.deactivated();
	},

	/**
	* @private
	*/
	transitionEnd: function (sender, ev) {
		if (ev.originator === this) this.set('state', this.state == States.ACTIVATING ? States.ACTIVE : States.INACTIVE);
	}

});

module.exports.States = States;
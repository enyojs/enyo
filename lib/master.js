require('enyo');

var
	utils = require('./utils');
var
	Component = require('./Component'),
	Signals = require('./Signals');

/**
* Default owner assigned to ownerless [UiComponents]{@link module:enyo/UiComponent~UiComponent},
* to allow such UiComponents to be notified of important system events like window resize.
*
* NOTE: Ownerless [UiComponents]{@link module:enyo/UiComponent~UiComponent} will not be garbage collected unless 
* explicitly destroyed, as they will be referenced by `master`.
*
* @module enyo/master
* @private
*/
var master = module.exports = new Component({
	name: 'master',
	notInstanceOwner: true,
	eventFlags: {showingOnly: true}, // don't waterfall these events into hidden controls
	getId: function () {
		return '';
	},
	isDescendantOf: utils.nop,
	bubble: function (nom, event) {
		//enyo.log('master event: ' + nom);
		if (nom == 'onresize') {
			// Resize is special; waterfall this message.
			// This works because master is a Component, so it waterfalls
			// to its owned Components (i.e., master has no children).
			master.waterfallDown('onresize', this.eventFlags);
			master.waterfallDown('onpostresize', this.eventFlags);
		} else {
			// All other top-level events are sent only to interested Signal
			// receivers.
			Signals.send(nom, event);
		}
	}
});

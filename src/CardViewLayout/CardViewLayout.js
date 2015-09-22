var
	kind = require('enyo/kind');

var
	TransitionViewLayout = require('../TransitionViewLayout');

module.exports = kind({
	kind: TransitionViewLayout,
	layoutClass: 'enyo-viewlayout enyo-viewlayout-card',

	/**
	* @private
	*/
	drag: function (event) {
		var c = this.container,
			delta = (event.percentDelta < -1 || event.percentDelta > 1) && 1 ||
					Math.abs(event.percentDelta);
		TransitionViewLayout.prototype.drag.apply(this, arguments);
		c.active.applyStyle('opacity', 1 - delta);
		if (c.dragView) c.dragView.applyStyle('opacity', delta);
	},

	/**
	* @private
	*/
	transition: function (was, is) {
		TransitionViewLayout.prototype.transition.apply(this, arguments);
		if (was) was.applyStyle('opacity', null);
		if (is) is.applyStyle('opacity', null);
	}
});
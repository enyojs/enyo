var
	kind = require('enyo/kind');

var
	TransitionViewLayout = require('../TransitionViewLayout');

module.exports = kind({
	kind: TransitionViewLayout,
	layoutClass: 'enyo-viewlayout enyo-viewlayout-leftright',

	/**
	* @private
	*/
	drag: function (event) {
		var c = this.container,
			node = c.hasNode(),
			size = node.clientWidth
			delta = Math.min(size, Math.abs(event.delta));

		TransitionViewLayout.prototype.drag.apply(this, arguments);
		c.active.applyStyle('transform', 'translateX(' + delta + 'px)');
		if (c.dragView) c.dragView.applyStyle('transform', 'translateX(' + (size - delta) + 'px)');
	},

	/**
	* @private
	*/
	transition: function (was, is) {
		TransitionViewLayout.prototype.transition.apply(this, arguments);
		if (was) was.applyStyle('transform', null);
		if (is) is.applyStyle('transform', null);
	}
});
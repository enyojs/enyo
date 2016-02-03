/**
* @module enyo/TransitionViewLayout
* @wip
*/

var
	kind = require('enyo/kind');

var
	ViewLayout = require('./ViewLayout');


/**
* Slides views in from the right or top and out the left or bottom.
*
* Order of operations:
*  * `prepareTransition()`
*    Applies directional CSS classes (forward or back) to each view based on the animation
*    direction. For the becoming-active view, this positions it offscreen. For the becoming-inactive
*    view, the directional class is overridden by `active` which keeps it onscreen. Calculates the
*    `dragDuration` used as the transition duration when the drag is released.
*  * `transition()`
*    Sets the transition duration to either its `duration` or a lesser amount to complete the
*    animation if the transition happens as a result of a drag operation. If a transform was applied
*    during a drag, it is removed. The result is a transition from the currently dragged position
*    set by inline style to the final position set by the CSS classes.
*  * `completeTransition()`
*    Removes the directional classes and resets the `dragDuration`
*
* @class TransitionViewLayout
* @extends module:enyo/ViewLayout~ViewLayout
* @public
* @wip
*/
module.exports = kind(
	/** @lends module:enyo/TransitionViewLayout~TransitionViewLayout.prototype */ {
	/**
	* @private
	*/
	kind: ViewLayout,

	/**
	* Sets the duration of the transition. Imported from the value of `layoutDuration` on the
	* container on which the layout is applied.
	*
	* @type {Number}
	* @default 300
	* @public
	*/
	duration: 300,

	/**
	* @private
	*/
	constructor: function () {
		ViewLayout.prototype._constructor.apply(this, arguments);
		this.duration = this.container.layoutDuration || this.duration;
	},

	/**
	* @private
	*/
	drag: function (event) {
		ViewLayout.prototype.drag.apply(this, arguments);
		this.dragDuration = this.duration - Math.round(event.percentDelta * this.duration, 2);
	},

	/**
	* Sets the transition duration, 
	*
	* @private
	*/
	transition: function (was, is) {
		ViewLayout.prototype.transition.apply(this, arguments);
		if (was) {
			was.addClass('transitioning');
			this.applyTransitionDuration(was, this.dragDuration || this.duration);
		}
		if (is) {
			is.addClass('transitioning');
			this.applyTransitionDuration(is, this.dragDuration || this.duration);
		}
	},

	/**
	* Removes the directional CSS class from the deactivating view
	*
	* @private
	*/
	completeTransition: function (was, is) {
		if (was) was.removeClass('transitioning');
		if (is) is.removeClass('transitioning');
		this.dragDuration = null;
		ViewLayout.prototype.completeTransition.apply(this, arguments);
	},

	/**
	* @private
	*/
	applyTransitionDuration: function (view, duration) {
		view.applyStyle('-webkit-transition-duration', duration + 'ms');
		view.applyStyle('transition-duration', duration + 'ms');
	},

	/**
	* @private
	*/
	handlers: {
		ontransitionend: 'handleTransitioned'
	},

	/**
	* @private
	*/
	handleTransitioned: function (sender, event) {
		var dir,
			view = event.originator;
		if (view && view.container == this.container) {
			dir = this.getTransitionDirection(view);
			if (dir) this.setTransitionComplete(dir);
			return true;
		}
	}
});

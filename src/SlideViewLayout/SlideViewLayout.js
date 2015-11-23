var
	dom = require('enyo/dom'),
	kind = require('enyo/kind');

var
	TransitionViewLayout = require('../TransitionViewLayout');

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
* @class SlideViewLayout
* @extends enyo/TransitionViewLayout~TransitionViewLayout
* @public
*/
module.exports = kind({
	/**
	* @private
	*/
	kind: TransitionViewLayout,

	/**
	* @private
	*/
	layoutClass: 'enyo-viewlayout enyo-viewlayout-slide',

	/**
	* @private
	*/
	constructor: function () {
		TransitionViewLayout.prototype._constructor.apply(this, arguments);
		if (this.container.layoutCover) this.container.addClass('cover');
	},

	/**
	* @private
	*/
	addRemoveDirection: function (view, addRemove, invert) {
		var direction = invert ? -this.container.direction : this.container.direction,
			className = direction == 1 ? 'forward' : 'back';
		view.addRemoveClass(className, addRemove);
	},

	/**
	* @private
	*/
	drag: function (event) {
		var px,
			c = this.container,
			bounds = c.dragBounds,
			isHorizontal = c.orientation == 'horizontal',
			size = isHorizontal ? bounds.width : bounds.height,
			delta = event.delta,
			transform = isHorizontal ? 'translateX' : 'translateY';

		if (event.delta < 0 && event.delta < -size) {
			this.overDrag = true;
			delta = -size;
		}
		else if (event.delta > 0 && event.delta > size) {
			this.overDrag = true;
			delta = size;
		}
		else {
			this.overDrag = false;
		}

		TransitionViewLayout.prototype.drag.apply(this, arguments);
		dom.transformValue(c.active, transform,  delta + 'px');
		if (c.dragView) {
			px = this.container.layoutCover ? 0 : size * event.direction + delta;
			dom.transformValue(c.dragView, transform,  px + 'px');
		}
	},

	/**
	* Applies directional CSS classes to initially position the views.
	*
	* @private
	*/
	prepareTransition: function (was, is) {
		var c = this.container;
		TransitionViewLayout.prototype.prepareTransition.apply(this, arguments);
		if (is) this.addRemoveDirection(is, true);
		if (was) this.addRemoveDirection(was, true, true);

		if (this.container.layoutCover) {
			this.stationaryView = c.direction == 1 && was
								|| c.direction == -1 && is;
			if (this.stationaryView) this.stationaryView.addClass('stationary');
		}
	},

	/**
	* Sets the transition duration, 
	*
	* @private
	*/
	transition: function (was, is) {
		var dir,
			transform = this.container.orientation == 'horizontal' ? 'translateX' : 'translateY';

		TransitionViewLayout.prototype.transition.apply(this, arguments);
		if (was && was != this.dragView) {
			dom.transformValue(was, transform, null);
		}
		if (is) {
			this.addRemoveDirection(is, false);
			if (is != this.dragView) dom.transformValue(is, transform, null);
		}

		// If the user drags the entire view off screen, it won't animate so we won't see the CSS
		// transition event.
		if (this.overDrag) {
			if (was) this.setTransitionComplete('from');
			if (is) this.setTransitionComplete('to');
		}
		// when using layoutCover, one view doesn't transition so the ontransitionend doesn't fire
		// to account for that, set a timeout of the same duration to manually clean up. The
		// exception being when dismissing the ViewManager and there is no becoming-active view.
		else if (this.stationaryView) {
			dir = this.getTransitionDirection(this.stationaryView);
			if (dir) this.setTransitionComplete(dir);
		}
	},

	/**
	* Removes the directional CSS class from the deactivating panel
	*
	* @private
	*/
	completeTransition: function (was, is) {
		if (is) this.addRemoveDirection(is, false);
		if (was) this.addRemoveDirection(was, false, true);
		if (this.stationaryView) {
			this.stationaryView.removeClass('stationary');
			this.stationaryView = null;
		}
		TransitionViewLayout.prototype.completeTransition.apply(this, arguments);
	}
});
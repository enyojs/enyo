var
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
* @class enyo.SlideViewLayout
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
	drag: function (event) {
		var px,
			c = this.container,
			bounds = c.dragBounds,
			isHorizontal = c.orientation == 'horizontal',
			size = isHorizontal ? bounds.width : bounds.height,
			delta = event.delta < 0 ? Math.max(event.delta, -size) : Math.min(event.delta, size),
			transform = isHorizontal ? 'translateX' : 'translateY';

		TransitionViewLayout.prototype.drag.apply(this, arguments);
		c.active.applyStyle('transform', transform + '(' + delta + 'px)');
		if (c.dragView) {
			px = this.container.layoutCover ? 0 : size * event.direction + delta;
			c.dragView.applyStyle('transform', transform + '(' + px + 'px)');
		}
	},

	/**
	* Applies directional CSS classes to initially position the views.
	*
	* @private
	*/
	prepareTransition: function (was, is) {
		var c = this.container,
			wasIndex = was ? c.views.indexOf(was) : -1,
			isIndex = is ? c.views.indexOf(is) : -1;

		this.direction = wasIndex < isIndex ? 'forward' : 'back';
		if (is) is.addClass(this.direction);
		if (was) was.addClass(this.direction == 'back' ? 'forward' : 'back');
	},

	/**
	* Sets the transition duration, 
	*
	* @private
	*/
	transition: function (was, is) {
		var stationaryView;
		TransitionViewLayout.prototype.transition.apply(this, arguments);
		if (was) {
			was.applyStyle('transform', null);
		}
		if (is) {
			is.removeClass(this.direction);
			is.applyStyle('transform', null);
		}

		// when using layoutCover, one view doesn't transition so the ontransitionend doesn't fire
		// to account for that, set a timeout of the same duration to manually clean up. The
		// exception being when dismissing the ViewManager and there is no becoming-active view.
		if (this.container.layoutCover) {
			stationaryView = this.direction == 'forward' && was
							|| this.direction == 'back' && is;
			if (stationaryView) {
				setTimeout(this.completeTransition.bind(this, stationaryView), this.dragDuration || this.duration);
			}
		}
	},

	/**
	* Removes the directional CSS class from the deactivating panel
	*
	* @private
	*/
	completeTransition: function (view) {
		TransitionViewLayout.prototype.completeTransition.apply(this, arguments);
		if (view) view.removeClass(this.direction == 'back' ? 'forward' : 'back');
	}
});
var
	kind = require('enyo/kind');

var
	ViewLayout = require('../ViewLayout');

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
	kind: ViewLayout,

	/**
	* @private
	*/
	layoutClass: 'enyo-viewlayout enyo-viewlayout-slide',

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
		this.container.addClass(this.container.orientation);
		this.duration = this.container.layoutDuration || this.duration;
	},

	/**
	* @private
	*/
	drag: function (event) {
		var size, node,
			c = this.container,
			isHorizontal = c.orientation == 'horizontal',
			transform = isHorizontal ? 'translateX' : 'translateY';

		ViewLayout.prototype.drag.apply(this, arguments);
		if (event.percentDelta)
		c.active.applyStyle('transform', transform + '(' + event.delta + 'px)');
		if (c.dragView) {
			node = c.hasNode();
			size = isHorizontal ? node.clientWidth : node.clientHeight;
			c.dragView.applyStyle('transform', transform + '(' + (size * event.direction + event.delta) + 'px)');
		}

		this.dragDuration = this.duration - Math.round(event.percentDelta * this.duration, 2);
	},

	/**
	* Applies directional CSS classes to initially position the views.
	*
	* @private
	*/
	prepareTransition: function (was, is) {
		var c = this.container,
			wasIndex = was ? c.panels.indexOf(was) : -1,
			isIndex = is ? c.panels.indexOf(is) : -1;

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
		ViewLayout.prototype.transition.apply(this, arguments);
		if (was) {
			this.applyTransitionDuration(was, this.dragDuration || this.duration);
			was.applyStyle('transform', null);
		}
		if (is) {
			is.removeClass(this.direction);
			this.applyTransitionDuration(is, this.dragDuration || this.duration);
			is.applyStyle('transform', null);
		}

	},

	/**
	* Removes the directional CSS class from the deactivating panel
	*
	* @private
	*/
	completeTransition: function (was, is) {
		ViewLayout.prototype.completeTransition.apply(this, arguments);
		this.dragDuration = null;
		if (was) was.removeClass(this.direction == 'back' ? 'forward' : 'back');
	},

	/**
	* @private
	*/
	applyTransitionDuration: function (view, duration) {
		view.applyStyle('-webkit-transition-duration', duration + 'ms');
		view.applyStyle('transition-duration', duration + 'ms');
	}
});
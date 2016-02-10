/**
* Exports the {@link module:enyo/ViewLayout~ViewLayout} kind.
*
* @module enyo/ViewLayout
* @wip
*/

var
	animation = require('../animation'),
	kind = require('../kind'),
	utils = require('../utils'),
	EventEmitter = require('../EventEmitter'),
	Layout = require('../Layout'),
	rAF = animation.requestAnimationFrame;

// In order to handle DOM events (e.g. ontransitionend), we need to inject ViewLayout into the event
// dispatch chain. Since we can't guarantee the usual event flow would pass through this, we
// override the default behavior to call ViewLayout's event hanlder via a mixin applied to the view
// when it is first setup
var ViewLayoutSupport = {
	name: 'enyo.ViewLayoutSupport',
	_viewLayout: null,
	bubbleUp: kind.inherit(function (sup) {
		return function (name, event, sender) {
			if (this._viewLayout) this._viewLayout.handleViewEvent(name, event, sender);
			return sup.apply(this, arguments);
		};
	})
};

/**
* Order of operations:
*  * `prepareTransition()`
*    Optionally implementable method by subkinds to apply any CSS before the transition
*  * `transition()`
*    The `active` CSS class is applied to and removed from the becoming-active and becoming-inactive
*    views, respectively. `transitioning` is applied to both views.
*  * `completeTransition()`
*    Called twice, once for the becoming-active view and once for the becoming-inactive view.
*    Removes the `transitioning` class and deactivates the now inactive view.
*
* @class ViewLayout
* @extends module:enyo/Layout~Layout
* @public
* @wip
*/
module.exports = kind(
	/** @lends module:enyo/ViewLayout~ViewLayout.prototype */ {

	/**
	* @private
	*/
	kind: Layout,

	/**
	* @private
	*/
	mixins: [EventEmitter],

	/**
	* @private
	*/
	layoutClass: 'enyo-viewlayout',

	/**
	* @private
	*/
	viewClass: 'enyo-view',

	/**
	* @private
	*/
	constructor: function () {
		Layout.prototype._constructor.apply(this, arguments);
		this.container.addClass(this.container.orientation);
		this.container.observe('active', this.activeChanged = this.activeChanged.bind(this));
		this.container.observe('dragging', this.draggingChanged = this.draggingChanged.bind(this));
		this.container.on('drag', this.handleDrag = this.handleDrag.bind(this));
		this.container.on('cancelDrag', this.handleCancelDrag = this.handleCancelDrag.bind(this));
		this._transitioning = {
			from: {
				view: null,
				complete: true
			},
			to: {
				view: null,
				complete: true
			}
		};
	},

	/**
	* @private
	*/
	destroy: function () {
		Layout.prototype.destroy.apply(this, arguments);
		this.container.unobserve('active', this.activeChanged);
		this.container.unobserve('dragging', this.draggingChanged);
		this.container.off('drag', this.handleDrag);
		this.container.off('cancelDrag', this.handleCancelDrag);
	},

	/**
	* @private
	*/
	setupView: function (view) {
		if (view && !view.viewSetup) {
			view.extend(ViewLayoutSupport);
			view._viewLayout = this;
			view.addClass(this.viewClass);
			view.viewSetup = true;
		}
	},

	/**
	* @private
	*/
	activeChanged: function (was, is) {
		this.setupView(is);

		if (this.shouldAnimate()) {
			rAF(function () {
				this.prepareTransition(was, is);
				rAF(this.transition.bind(this, was, is));
			}.bind(this));
		} else {
			this.prepareTransition(was, is);
			this.transition(was, is);
			this.completeTransition(was, is);
		}
	},

	/**
	* Adds the dragging class to the container when dragging starts. It is then removed in
	* `transition()` to avoid a potential flash due to CSS changes in different frames.
	*
	* @private
	*/
	draggingChanged: function (was, is) {
		// if there's a transition in-progress, force it complete before dragging
		if (is && this.isTransitioning()) {
			this.setTransitionComplete('from');
			this.setTransitionComplete('to');
		}

		rAF(function () {
			if (is === true) this.container.addClass('dragging');
		}.bind(this));
	},

	/**
	* @private
	*/
	handleCancelDrag: function (sender, name, event) {
		this.activeChanged(this.container.dragView, this.container.active);
	},

	/**
	* @private
	*/
	handleDrag: function (sender, name, event) {
		// Only update the view once per frame
		if (!this.dragEvent) {
			rAF(function () {
				if (this.container.dragging) this.drag(this.dragEvent);
				this.dragEvent = null;
			}.bind(this));
		}
		this.dragEvent = utils.clone(event);
	},

	/**
	* @private
	*/
	drag: function (event) {
		this.setupView(this.container.dragView);
	},

	/**
	* @protected
	*/
	prepareTransition: function (was, is) {
		this.registerTransition(was, is);
	},

	/**
	* @protected
	*/
	transition: function (was, is) {
		this.container.removeClass('dragging');
		if (was) was.removeClass('active');
		if (is) is.addClass('active');
	},

	/**
	* @protected
	*/
	completeTransition: function (was, is) {
		this.emit('complete', {
			was: was,
			is: is
		});
	},

	/**
	* `true` if either transition is still incomplete
	*
	* @return {Boolean}
	* @private
	*/
	isTransitioning: function () {
		var t = this._transitioning;
		return !t.from.complete || !t.to.complete;
	},

	/**
	* @private
	*/
	registerTransition: function (was, is) {
		var t = this._transitioning;

		// if there is an active transition, we need to complete it so things aren't left hanging
		// short circuiting isTransitioning to optimize and since we have intimate knowledge here as
		// part of the transition registration API.
		if (!t.to.complete) this.setTransitionComplete('to');
		if (!t.from.complete) this.setTransitionComplete('from');

		t.from.view = was;
		t.from.complete = !was;
		t.to.view = is;
		t.to.complete = !is;
	},

	/**
	* @private
	*/
	setTransitionComplete: function (dir, view) {
		var t = this._transitioning;

		t[dir].complete = true;
		if (!this.isTransitioning()) {
			this.completeTransition(t.from.view, t.to.view);
			t.from.view = t.to.view = null;
			t.from.complete = t.to.complete = true;
		}
	},

	/**
	* @private
	*/
	getTransitionDirection: function (view) {
		return this._transitioning.from.view == view && 'from' ||
				this._transitioning.to.view == view && 'to' ||
				null;
	},

	/**
	* @protected
	*/
	shouldAnimate: function () {
		var opt = this.container.activationOptions,
			animate = (opt && (opt.animate === false || opt.animate === true)) ? opt.animate : this.container.animate;
		return this.container.generated && animate;
	},

	/**
	* @private
	*/
	handleViewEvent: function (name, event, sender) {
		var handler = this.handlers && this.handlers[name];
		if (handler) this[handler](sender, event);
	}
});

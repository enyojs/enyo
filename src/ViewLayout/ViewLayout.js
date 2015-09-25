var rAF = window.requestAnimationFrame;

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Layout = require('enyo/Layout');

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
* @class enyo.ViewLayout
*/
module.exports = kind({
	kind: Layout,
	layoutClass: 'enyo-viewlayout',
	viewClass: 'enyo-view',
	constructor: function () {
		Layout.prototype._constructor.apply(this, arguments);
		this.container.addClass(this.container.orientation);
		this.container.observe('active', this.activeChanged = this.activeChanged.bind(this));
		this.container.observe('dragging', this.draggingChanged = this.draggingChanged.bind(this));
		this.container.on('drag', this.handleDrag = this.handleDrag.bind(this));
		this.container.on('cancelDrag', this.handleCancelDrag = this.handleCancelDrag.bind(this));
	},
	destroy: function () {
		Layout.prototype.destroy.apply(this, arguments);
		this.container.unobserve('active', this.activeChanged);
		this.container.unobserve('dragging', this.draggingChanged);
		this.container.off('drag', this.handleDrag);
		this.container.off('cancelDrag', this.handleCancelDrag);
	},

	flow: function () {

	},
	reflow: function () {

	},

	setupView: function (view) {
		if (view && !view.viewSetup) {
			view.set('bubbleTarget', this);
			view.addClass(this.viewClass);
			view.viewSetup = true;
		}
	},

	activeChanged: function (was, is) {
		this.setupView(is);

		if (this.shouldAnimate()) {
			if (this.prepareTransition) {
				rAF(function () {
					this.prepareTransition(was, is);
					rAF(this.transition.bind(this, was, is));
				}.bind(this));
			} else {
				rAF(this.transition.bind(this, was, is));
			}
		} else {
			this.transition(was, is);
			if (was) this.completeTransition(was);
			if (is) this.completeTransition(is);
		}
	},

	draggingChanged: function (was, is) {
		this.container.addRemoveClass('dragging', is);
	},

	handleCancelDrag: function (sender, name, event) {
		this.activeChanged(this.container.dragView, this.container.active);
	},

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

	drag: function (event) {
		this.setupView(this.container.dragView);
	},

	prepareTransition: null,
	transition: function (was, is) {
		if (was) {
			was.addClass('transitioning');
			was.removeClass('active');
		}
		if (is) {
			is.addClass('transitioning');
			is.addClass('active');
		}
	},
	completeTransition: function (view) {
		view.removeClass('transitioning');
		if (view !== this.container.active) this.container.deactivate(view.name);
	},

	shouldAnimate: function () {
		return this.container.generated && this.container.animated;
	},

	/**
	* @private
	*/
	dispatchBubble: function (name, event, delegate) {
		var handler = this.handlers && this.handlers[name];
		if (handler) {
			if (this[handler](delegate, event)) {
				return true;
			}
		} else {
			return this.container.dispatchBubble(name, event, delegate);
		}
	},

});
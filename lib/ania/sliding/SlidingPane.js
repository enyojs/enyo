/**
A control designed to present a horizontal layout of
<a href="#enyo.SlidingView">SlidingView</a> controls,
which are panel controls that can slide one on top of another. The user can 
drag the views left and right and they'll stay connected. If a view is moved 
to the far left, it will cover any views to the left of it.

SlidingViews can have explicit width or be flexed. In either case, they are displayed
in SlidingPane's client region, which is an HFlexBox. The view on the far 
right is special--it will always behave as flexed unless its fixedWidth property is set to true.

SlidingPane exposes the same selection methods as <a href="#enyo.Pane">Pane</a>. 
The selected view is the one displayed at the far left of the group. 

SlidingGroup also has two layout modes--the normal layout, in which views
are placed left-to-right, and a narrow layout, in which views are stacked,
taking up the entire width of the SlidingPane. A SlidingPane can automatically
toggle between these layouts if its resize method is hooked up to respond to window 
resizing. The "wideWidth" property has a default value of 500 and is the pivot point
between the two layouts.

Here's an example:

	{kind: "SlidingPane", flex: 1, components: [
		{name: "left", style: "width: 320px;"},
		{name: "middle", style: "width: 320px;", peekWidth: 68},
		{name: "right", flex: 1, onResize: "slidingResize"}
	]}

*/
enyo.kind({
	name: "enyo.SlidingPane",
	kind: enyo.Pane,
	published: {
		multiView: true,
		multiViewMinWidth: 500,
		canAnimate: true,
		dismissDistance: 100,
		accelerated: true
	},
	className: "enyo-sliding-pane",
	events: {
		onSlideComplete: ""
	},
	layoutKind: "",
	defaultKind: "SlidingView",
	//* @protected
	paneChrome: [
		{kind: "Animator", duration: 700, onAnimate: "animationStep", onStop: "slideComplete"},
		{name: "client", flex: 1, kind: enyo.Control, className: "enyo-view enyo-sliding-pane-client", layoutKind: "HFlexLayout"}
	],
	constructor: function() {
		this.inherited(arguments);
		this.slidingCache = [];
	},
	create: function() {
		this.inherited(arguments);
		this.multiViewChanged();
		this.selectViewImmediate(this.view);
		this.acceleratedChanged();
	},
	initComponents: function() {
		this.createChrome(this.paneChrome);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.resize();
	},
	// avoid pane flow mechanism which hides unselected views
	flow: function() {
		enyo.Control.prototype.flow.call(this);
	},
	controlIsView: function(inControl) {
		return (inControl instanceof enyo.SlidingView);
	},
	// maintain an explicit list of Sliding controls to manipulate
	addView: function(inControl) {
		this.inherited(arguments);
		inControl.pane = this;
		this.indexViews();
	},
	removeView: function(inControl) {
		this.inherited(arguments);
		this.indexViews();
	},
	// optimization, store index on views as this info is needed during animation
	indexViews: function() {
		for (var i=0, s; s=this.views[i]; i++) {
			s.index = i;
		}
	},
	getAnimator: function() {
		return this.$.animator;
	},
	selectViewImmediate: function(inSelected) {
		var ca = this.canAnimate;
		this.canAnimate = false;
		this.selectView(inSelected, true);
		this.canAnimate = ca;
	},
	_selectView: function(inView) {
		this.lastView = this.view;
		this.view = inView;
		if (!this.dragging) {
			this.animateSelected();
		}
	},
	reallySelectView: function(inView) {
		// if view is re-selected, make sure to try moving it
		if (inView == this.view) {
			if (!this.dragging) {
				this.animateSelected();
			}
		} else {
			this.inherited(arguments);
		}
	},
	acceleratedChanged: function() {
		for (var i=0, v; v=this.views[i]; i++) {
			v.setAccelerated(this.accelerated);
		}
	},
	// animation
	animateSelected: function() {
		var s = this.findAnimateable(this.view);
		if (s) {
			if (this.canAnimate) {
				this.playAnimation(s);
			} else {
				this.validateViews();
			}
		} else {
			this.slideComplete();
		}
	},
	animateOverSlide: function(inOverSlide) {
		if (this.canAnimate && inOverSlide) {
			inOverSlide.validateSlideBefore();
			this.playAnimation(inOverSlide);
		} else {
			this.validateViews();
		}
	},
	slideComplete: function() {
		this.validateViewSizes();
		this.resetOverSliding();
		this.doSlideComplete(this.view);
	},
	findAnimateable: function(inSliding) {
		if (inSliding.canAnimate()) {
			return inSliding;
		} else {
			var n = this.view.getLastShowingSibling();
			return n && n.canAnimate() ? n : null;
		}
	},
	playAnimation: function(inSliding) {
		var s = inSliding;
		this.$.animator.sliding = s;
		this.$.animator.play(s.slidePosition, s.calcSlide());
	},
	stopAnimation: function() {
		this.$.animator.stop();
	},
	animationStep: function(inSender, inValue) {
		var v = Math.round(inValue);
		inSender.sliding.animateMove(v, inSender.sliding.overSliding);
	},
	isAnimating: function() {
		return this.$.animator.isAnimating();
	},
	// dragging
	dragstartHandler: function(inSender, inEvent) {
		if (inEvent.sliding) {
			var s = this.dragStartSliding = inEvent.sliding;
			var d = s && s.isDraggableEvent(inEvent) && this.findDraggable(inEvent.dx);
			//this.log(d ? d.id : "nothing to drag");
			this.dx0 = 0;
			if (d) {
				this.stopAnimation();
				this.dragSliding(d, inEvent, 0);
				return true;
			}
		}
	},
	findDraggable: function(inDx) {
		this.resetOverSliding();
		var c = this.dragStartSliding.index;
		for (var i=0, s$=this.views, s; (i <= c) && (s=s$[i]); i++) {
			if (s.canDrag(inDx)) {
				return s;
			}
		}
		// default to slide initially dragged slider, in overSliding mode.
		this.dragStartSliding.overSliding = (this.dragStartSliding.slidePosition + inDx >= 0);
		return this.dragStartSliding;
	},
	dragSliding: function(inSliding, inEvent, inX) {
		this.dragging = inSliding;
		this.dragging.beginDrag(inEvent, inX);
	},
	dragHandler: function(inSender, inEvent) {
		var s = this.dragging;
		if (s) {
			var b = s.drag(inEvent);
			// if at a drag boundary
			if (b) {
				if (b.select) {
					this.selectView(b.select, true);
				}
				var dx = inEvent.dx - this.dx0;
				// ensure some change
				var dx = dx || (s.isMovingToSelect() ? -1 : 1);
				var nd = this.findDraggable(dx);
				/*
				this.log("boundary, select", inEvent.dx, b.select ? b.select.id : "none", "next:", nd ? nd.id : "none", 
					"is overSliding", nd.overSliding);
				*/
				if (nd) {
					this.dragSliding(nd, inEvent, inEvent.dx);
				}
			}
		}
		this.dx0 = inEvent.dx;
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var b = this.dragging.dragFinish(inEvent);
			var d = this.dragStartSliding;
			inEvent.preventClick();
			this.dragging = null;
			if (b) {
				// if slide is past threshold, hide!
				if (d.slidePosition > this.dismissDistance && d.dismissible) {
					d.setShowing(false);
				// if we have a view to select, do it
				} else if (b.select) {
					this.selectView(b.select, true);
				// otherwise assume we animate from overscroll
				} else {
					this.animateOverSlide(d);
				}
			}
		}
	},
	// resizing and "layout modes"
	// event handler for resize; if we're the root component, we'll automatically resize
	resizeHandler: function() {
		if (this.getBounds().height) {
			this.resize(true);
			this.inherited(arguments);
		}
	},
	// if we're not the root component, this method can be hooked to a resizeHandler
	resize: function(inStopPropagation) {
		// if no layout change, make sure to validate to ensure proper sizing
		// otherwise apply layout change
		var multiView = this.multiViewMinWidth > 0 && window.innerWidth > this.multiViewMinWidth;
		this.setMultiView(multiView);
		this.validateViews(inStopPropagation);
	},
	//* @protected
	multiViewChanged: function(inLastMultiView) {
		if (this.multiView != inLastMultiView) {
			this[this.multiView ? "applyMultiViewLayout" : "applySingleViewLayout"]();
			this.validateViews();
		}
	},
	// FIXME: we should have layoutKinds for these layouts.
	applyMultiViewLayout: function() {
		for (var i=0, s$=this.views, s; s=s$[i]; i++) {
			this.uncacheSliding(s, i);
		}
		this.$.client.flow();
	},
	applySingleViewLayout: function() {
		for (var i=0, s$=this.views, s; s=s$[i]; i++) {
			this.cacheSliding(s, i);
			s.setFixedWidth(true);
			s.peekWidth = 0;
			s.flex = 0;
			// defeat auto flex at "100%"
			s.applyStyle("width", "100.0%");
		}
	},
	cacheSliding: function(inSliding, inIndex) {
		this.slidingCache[inIndex] = {
			flex: inSliding.flex,
			width: inSliding.domStyles.width,
			peekWidth: inSliding.peekWidth,
			fixedWidth: inSliding.fixedWidth
		};
	},
	uncacheSliding: function(inSliding, inIndex) {
		var s = this.slidingCache[inIndex];
		if (s) {
			inSliding.flex = s.flex;
			inSliding.peekWidth = s.peekWidth;
			inSliding.setFixedWidth(s.fixedWidth);
			inSliding.applyStyle("width", s.width);
		}
	},
	validateViews: function(inStopResizePropagation) {
		this.validateViewPositions();
		this.resetOverSliding();
		if (inStopResizePropagation) {
			this.validateViewSizes(inStopResizePropagation);
		} else {
			enyo.job(this.id + ":resize", enyo.bind(this, "validateViewSizes", inStopResizePropagation), 10);
		}
	},
	validateViewPositions: function() {
		var s = this.view && this.view.getFirstSibling() || this.view;
		if (s) {
			s.validateSlide();
		}
	},
	validateViewSizes: function(inStopResizePropagation) {
		var s = this.view && this.view.getLastShowingSibling();
		for (var i=0, v; v=this.views[i]; i++) {
			v.applySize(v == s, inStopResizePropagation);
		}
	},
	resetOverSliding: function() {
		for (var i=0, v; v=this.views[i]; i++) {
			v.overSliding = false;
		}
	}
});
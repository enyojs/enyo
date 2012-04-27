/**
enyo.TouchScrollStrategy is a helper kind that implments a touch based scroller that integrates the scrolling simulation provided
by <a href="#enyo.ScrollMath">enyo.ScrollMath</a> into an <a href="#enyo.Scroller">enyo.Scroller</a>.

enyo.TouchScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TouchScrollStrategy",
	kind: "ScrollStrategy",
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	published: {
		/**
			Specifies how to horizontally scroll. Acceptable values are:
			
			* "scroll": Always scrolls.
			* "auto":  Scroll only if the content overflows the scroller.
			* "hidden": Never scroll.
			* "default": In touch environments, the default vertical scrolling behavior is to always scroll. If the content does not
			overflow the scroller, the scroller will overscroll and snap back.
		*/
		vertical: "default",
		/**
			Specifies how to vertically scroll. Acceptable values are:

			* "scroll": Always scrolls.
			* "auto":  Scroll only if the content overflows the scroller.
			* "hidden": Never scroll.
			* "default": Same as auto.
		*/
		horizontal: "default",
		//* set to true to display a scroll thumb
		thumb: true,
		//* set to true to display a transparent overlay while scrolling; can help improve performance of complex, large scroll regions
		//* on some platforms, notably Android.
		scrim: false
	},
	events: {
		onShouldDrag: ""
	},
	//* @protected
	handlers: {
		onscroll: "domScroll",
		onflick: "flick",
		onhold: "hold",
		ondragstart: "dragstart",
		onShouldDrag: "shouldDrag",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onmousewheel: "mousewheel"
	},
	tools: [
		{kind: "ScrollMath", onScrollStart: "scrollMathStart", onScroll: "scrollMathScroll", onScrollStop: "scrollMathStop"},
		{name: "vthumb", kind: "ScrollThumb", axis: "v", showing: false},
		{name: "hthumb", kind: "ScrollThumb", axis: "h", showing: false}
	],
	scrimTools: [{name: "scrim", classes: "enyo-fit", style: "z-index: 1;", showing: false}],
	components: [
		{name: "client", attributes: {"onscroll": enyo.bubbler}, classes: "enyo-touch-scroller"}
	],
	create: function() {
		this.inherited(arguments);
		this.accel = enyo.dom.canAccelerate();
		var containerClasses = "enyo-touch-strategy-container";
		// note: needed for ios to avoid incorrect clipping of thumb
		// and need to avoid on Android as it causes problems hiding the thumb
		if (enyo.platform.ios && this.accel) {
			containerClasses += " enyo-composite";
		}
		this.scrimChanged();
		this.container.addClass(containerClasses);
		this.translation = this.accel ? "translate3d" : "translate";
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	destroy: function() {
		this.container.removeClass("enyo-touch-strategy-container");
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.calcBoundaries();
		this.syncScrollMath();
		if (this.thumb) {
			this.alertThumbs();
		}
	},
	scrimChanged: function() {
		if (this.scrim && !this.$.scrim) {
			this.makeScrim();
		}
		if (!this.scrim && this.$.scrim) {
			this.$.scrim.destroy();
		}
	},
	makeScrim: function() {
		// reset control parent so scrim doesn't go into client.
		var cp = this.controlParent;
		this.controlParent = null;
		this.createChrome(this.scrimTools);
		this.controlParent = cp;
		var cn = this.container.hasNode();
		// render scrim in container, strategy has no dom.
		if (cn) {
			this.$.scrim.parentNode = cn;
			this.$.scrim.render();
		}
	},
	isScrolling: function() {
		return this.$.scrollMath.isScrolling();
	},
	isOverscrolling: function() {
		return this.$.scrollMath.isInOverScroll();
	},
	domScroll: function() {
		if (!this.isScrolling()) {
			this.calcBoundaries();
			this.syncScrollMath();
			if (this.thumb) {
				this.alertThumbs();
			}
		}
	},
	horizontalChanged: function() {
		this.$.scrollMath.horizontal = (this.horizontal != "hidden");
	},
	verticalChanged: function() {
		this.$.scrollMath.vertical = (this.vertical != "hidden");
	},
	maxHeightChanged: function() {
		this.$.client.applyStyle("max-height", this.maxHeight);
		// note: previously used enyo-fit here but IE would reset scroll position when the scroll thumb
		// was hidden; in general IE resets scrollTop when there are 2 abs position siblings, one has
		// scrollTop and the other is hidden.
		this.$.client.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
	},
	thumbChanged: function() {
		this.hideThumbs();
	},
	stop: function() {
		if (this.isScrolling()) {
			this.$.scrollMath.stop(true);
		}
	},
	stabilize: function() {
		this.$.scrollMath.stabilize();
	},
	scrollTo: function(inX, inY) {
		this.stop();
		this.$.scrollMath.scrollTo(inY || inY === 0 ? inY : null, inX);
	},
	scrollIntoView: function() {
		this.stop();
		this.inherited(arguments);
	},
	setScrollLeft: function() {
		this.stop();
		this.inherited(arguments);
	},
	setScrollTop: function() {
		this.stop();
		this.inherited(arguments);
	},
	getScrollLeft: function() {
		return this.isScrolling() ? this.scrollLeft : this.inherited(arguments);
	},
	getScrollTop: function() {
		return this.isScrolling() ? this.scrollTop : this.inherited(arguments);
	},
	calcScrollNode: function() {
		return this.$.client.hasNode();
	},
	calcAutoScrolling: function() {
		var v = (this.vertical == "auto");
		var h = (this.horizontal == "auto") || (this.horizontal == "default");
		if ((v || h) && this.scrollNode) {
			var b = this.getScrollBounds();
			if (v) {
				this.$.scrollMath.vertical = b.height > b.clientHeight;
			}
			if (h) {
				this.$.scrollMath.horizontal = b.width > b.clientWidth;
			}
		}
	},
	shouldDrag: function(inSender, e) {
		this.calcAutoScrolling();
		var requestV = e.vertical;
		var canH = this.$.scrollMath.horizontal && !requestV;
		var canV = this.$.scrollMath.vertical && requestV;
		var down = e.dy < 0, right = e.dx < 0;
		var oobV = (!down && this.startEdges.top || down && this.startEdges.bottom);
		var oobH = (!right && this.startEdges.left || right && this.startEdges.right);
		// we would scroll if not at a boundary
		if (!e.boundaryDragger && (canH || canV)) {
			e.boundaryDragger = this;
		}
		// include boundary exclusion
		if ((!oobV && canV) || (!oobH && canH)) {
			e.dragger = this;
			return true;
		}
	},
	flick: function(inSender, e) {
		var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
		if (onAxis && this.dragging) {
			this.$.scrollMath.flick(e);
			return this.preventDragPropagation;
		}
	},
	hold: function(inSender, e) {
		if (this.isScrolling() && !this.isOverscrolling()) {
			this.$.scrollMath.stop(e);
			return true;
		}
	},
	move: function(inSender, inEvent) {
	},
	// special synthetic DOM events served up by the Gesture system
	dragstart: function(inSender, inEvent) {
		// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
		this.doShouldDrag(inEvent);
		this.dragging = (inEvent.dragger == this || (!inEvent.dragger && inEvent.boundaryDragger == this));
		if (this.dragging) {
			inEvent.preventDefault();
			// note: needed because show/hide changes
			// the position so sync'ing is required when 
			// dragging begins (needed because show/hide does not trigger onscroll)
			this.syncScrollMath();
			this.$.scrollMath.startDrag(inEvent);
			if (this.preventDragPropagation) {
				return true;
			}
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventDefault();
			this.$.scrollMath.drag(inEvent);
			if (this.scrim) {
				this.$.scrim.show();
			}
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventTap();
			this.$.scrollMath.dragFinish();
			this.dragging = false;
			if (this.scrim) {
				this.$.scrim.hide();
			}
		}
	},
	mousewheel: function(inSender, e) {
		if (!this.dragging && this.$.scrollMath.mousewheel(e)) {
			e.preventDefault();
			return true;
		}
	},
	scrollMathStart: function(inSender) {
		if (this.scrollNode) {
			this.calcBoundaries();
			if (this.thumb) {
				this.showThumbs();
			}
		}
	},
	scrollMathScroll: function(inSender) {
		this.effectScroll(-inSender.x, -inSender.y);
		if (this.thumb) {
			this.updateThumbs();
		}
	},
	scrollMathStop: function(inSender) {
		this.effectScrollStop();
		if (this.thumb) {
			this.delayHideThumbs(100);
		}
	},
	calcBoundaries: function() {
		var s = this.$.scrollMath, b = this._getScrollBounds();
		s.bottomBoundary = b.clientHeight - b.height;
		s.rightBoundary = b.clientWidth - b.width;
	},
	syncScrollMath: function() {
		var m = this.$.scrollMath;
		m.setScrollX(-this.getScrollLeft());
		m.setScrollY(-this.getScrollTop());
	},
	effectScroll: function(inX, inY) {
		if (this.scrollNode) {
			this.scrollLeft = this.scrollNode.scrollLeft = inX;
			this.scrollTop = this.scrollNode.scrollTop = inY;
			this.effectOverscroll(Math.round(inX), Math.round(inY));
		}
	},
	effectScrollStop: function() {
		this.effectOverscroll(null, null);
	},
	effectOverscroll: function(inX, inY) {
		var n = this.scrollNode;
		var x = "0,", y = "0", z = this.accel ? ",0" : "";
		if (inY !== null && Math.abs(inY - n.scrollTop) > 1) {
			y = (n.scrollTop - inY) + "px";
		}
		if (inX !== null && Math.abs(inX - n.scrollLeft) > 1) {
			x = (n.scrollLeft - inX) + "px,";
		}
		enyo.dom.transformValue(this.$.client, this.translation, x + y + z);
	},
	getOverScrollBounds: function() {
		var m = this.$.scrollMath;
		return {
			overleft: Math.min(m.leftBoundary - m.x, 0) || Math.max(m.rightBoundary - m.x, 0),
			overtop: Math.min(m.topBoundary - m.y, 0) || Math.max(m.bottomBoundary - m.y, 0)
		};
	},
	_getScrollBounds: function() {
		var r = this.inherited(arguments);
		enyo.mixin(r, this.getOverScrollBounds());
		return r;
	},
	getScrollBounds: function() {
		this.stop();
		return this.inherited(arguments);
	},
	// thumb processing
	alertThumbs: function() {
		this.showThumbs();
		this.delayHideThumbs(500);
	},
	syncThumbs: function() {
		this.$.vthumb.sync(this);
		this.$.hthumb.sync(this);
	},
	updateThumbs: function() {
		this.$.vthumb.update(this);
		this.$.hthumb.update(this);
	},
	showThumbs: function() {
		this.syncThumbs();
		this.$.vthumb.show();
		this.$.hthumb.show();
	},
	hideThumbs: function() {
		this.$.vthumb.hide();
		this.$.hthumb.hide();
	},
	delayHideThumbs: function(inDelay) {
		this.$.vthumb.delayHide(inDelay);
		this.$.hthumb.delayHide(inDelay);
	}
});

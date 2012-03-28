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
		horizontal: "default"
	},
	events: {
		onScrollStart: "doScrollStart",
		onScroll: "doScroll",
		onScrollStop: "doScrollStop",
		onShouldDrag: ""
	},
	//* @protected
	handlers: {
		onscroll: "scroll",
		onflick: "flick",
		onhold: "hold",
		ondragstart: "dragstart",
		onShouldDrag: "shouldDrag",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onmousewheel: "mousewheel"
	},
	classes: "enyo-touch-scroller",
	clientClasses: "enyo-touch-scroller",
	tools: [
		{kind: "ScrollMath", onScrollStart: "scrollMathStart", onScroll: "scrollMathScroll", onScrollStop: "scrollMathStop"}
	],
	components: [
		{name: "client", attributes: {"onscroll": enyo.bubbler}}
	],
	create: function() {
		this.inherited(arguments);
		this.$.client.addClass(this.clientClasses);
		this.container.addClass("enyo-touch-strategy-container");
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
	},
	scroll: function() {
		if (!this.$.scrollMath.isScrolling()) {
			this.calcBoundaries();
			this.syncScrollMath();
		}
		return true;
	},
	horizontalChanged: function() {
		this.$.scrollMath.horizontal = (this.horizontal != "hidden");
	},
	verticalChanged: function() {
		this.$.scrollMath.vertical = (this.vertical != "hidden");
	},
	maxHeightChanged: function() {
		this.$.client.applyStyle("max-height", this.maxHeight);
		this.$.client.addRemoveClass("enyo-fit", !this.maxHeight);
	},
	stop: function() {
		if (this.$.scrollMath.isScrolling()) {
			this.$.scrollMath.stop(true);
		}
	},
	scrollTo: function(inX, inY) {
		this.stop();
		this.$.scrollMath.scrollTo(inY || inY == 0 ? inY : null, inX);
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
		return this.$.scrollMath.isScrolling() ? this.scrollLeft : this.inherited(arguments);
	},
	getScrollTop: function() {
		return this.$.scrollMath.isScrolling() ? this.scrollTop : this.inherited(arguments);
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
		if (this.$.scrollMath.isScrolling() && !this.$.scrollMath.isInOverScroll()) {
			this.$.scrollMath.stop(e);
			return true;
		}
	},
	// special synthetic DOM events served up by the Gesture system
	dragstart: function(inSender, inEvent) {
		// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
		this.doShouldDrag(inEvent);
		this.dragging = (inEvent.dragger == this || (!inEvent.dragger && inEvent.boundaryDragger == this));
		if (this.dragging) {
			inEvent.preventNativeDefault();
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
			inEvent.preventNativeDefault();
			this.$.scrollMath.drag(inEvent);
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventTap();
			this.$.scrollMath.dragFinish();
			this.dragging = false;
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
			this.doScrollStart(inSender);
		}
	},
	scrollMathScroll: function(inSender) {
		this.effectScroll(-inSender.x, -inSender.y);
		this.doScroll(inSender);
	},
	scrollMathStop: function(inSender) {
		this.effectScrollStop();
		this.doScrollStop(inSender);
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
		var o = "";
		if (inY !== null && Math.abs(inY - n.scrollTop) > 1) {
			o += " translateY(" + (n.scrollTop - inY) + "px)";
		}
		if (inX !== null && Math.abs(inX - n.scrollLeft) > 1) {
			o += " translateX(" + (n.scrollLeft - inX) + "px)";
		}
		this.effectTransform(n, o);
	},
	effectTransform: function(inNode, inTransform) {
		if (inNode) {
			var s = inNode.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.OTransform = s.transform = inTransform;
		}
	},
	_getScrollBounds: function() {
		var r = this.inherited(arguments);
		var m = this.$.scrollMath;
		r.overleft = -Math.floor(this.getScrollLeft() + m.x);
		r.overtop = -Math.floor(this.getScrollTop() + m.y);
		return r;
	},
	getScrollBounds: function() {
		this.stop();
		return this.inherited(arguments);
	}
});

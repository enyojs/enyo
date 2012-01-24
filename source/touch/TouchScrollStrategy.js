/**
enyo.TouchScroller is a touch based scroller that integrates the scrolling simulation provided
by <a href="#enyo.ScrollMath">enyo.ScrollMath</a>
into a Control.

enyo.ScrollMath is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TouchScrollStrategy",
	kind: enyo.ScrollStrategy,
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	events: {
		onScrollStart: "doScrollStart",
		onScroll: "doScroll",
		onScrollStop: "doScrollStop"
	},
	//* @protected
	handlers: {
		flick: "flickHandler",
		hold: "holdHandler",
		dragstart: "dragstartHandler",
		drag: "dragHandler",
		dragfinish: "dragfinishHandler",
		mousewheel: "mousewheelHandler",
		touchmove: "touchmoveHandler"
	},
	classes: "enyo-touch-scroller",
	components: [
		{name: "scroll", kind: "ScrollMath"},
		{name: "client", classes: "enyo-fit enyo-touch-scroller", attributes: {"onscroll": enyo.bubbler}}
	],
	horizontalChanged: function() {
		this.$.scroll.horizontal = this.horizontal;
	},
	verticalChanged: function() {
		this.$.scroll.vertical = this.vertical;
	},
	calcScrollNode: function() {
		return this.$.client.hasNode();
	},
	calcAutoScrolling: function() {
		var v = this.vertical == "auto";
		var h = this.horizontal == "auto";
		if ((v || h) && this.scrollNode) {
			var b = this.getBounds();
			if (v) {
				this.$.scroll.vertical = this.node.scrollHeight > b.height;
			}
			if (h) {
				this.$.scroll.horizontal = this.node.scrollWidth > b.width;
			}
		}
	},
	shouldDrag: function(e) {
		var requestV = e.vertical;
		var canH = this.$.scroll.horizontal;
		var canV = this.$.scroll.vertical;
		return requestV && canV || !requestV && canH;
	},
	flickHandler: function(inSender, e) {
		var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.horizontal : this.vertical;
		if (onAxis) {
			this.$.scroll.flick(e);
			return this.preventDragPropagation;
		}
	},
	holdHandler: function(inSender, e) {
		if (this.$.scroll.isScrolling() && !this.$.scroll.isInOverScroll()) {
			this.$.scroll.stop(e);
			return true;
		}
	},
	touchmoveHandler: function(inSender, e) {
		e.preventDefault();
	},
	// special synthetic DOM events served up by the Gesture system
	dragstartHandler: function(inSender, inEvent) {
		this.calcAutoScrolling();
		this.dragging = this.shouldDrag(inEvent);
		if (this.dragging) {
			this.$.scroll.startDrag(inEvent);
			if (this.preventDragPropagation) {
				return true;
			}
		}
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.$.scroll.drag(inEvent);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventTap();
			this.$.scroll.dragFinish();
			this.dragging = false;
		}
	},
	mousewheelHandler: function(inSender, e) {
		if (!this.dragging && this.$.scroll.mousewheel(e)) {
			e.preventDefault();
			return true;
		}
	},
	scrollStart: function(inSender) {
		if (this.scrollNode) {
			var b = this.$.client.getBounds();
			inSender.bottomBoundary = b.height - this.scrollNode.scrollHeight;
			inSender.rightBoundary = b.width - this.scrollNode.scrollWidth;
			this.doScrollStart(inSender);
		}
	},
	scroll: function(inSender) {
		this.effectScroll(-inSender.x, -inSender.y);
		this.doScroll(inSender);
	},
	scrollStop: function(inSender) {
		this.effectOverscroll(null, null);
		this.doScrollStop(inSender);
	},
	setScrollLeft: function() {
		this.inherited(arguments);
		var s = this.$.scroll;
		s.x = s.x0 = -this.getScrollLeft();
	},
	setScrollTop: function() {
		this.inherited(arguments);
		var s = this.$.scroll;
		s.y = s.y0 = -this.getScrollTop();;
	},
	effectScroll: function(inX, inY) {
		if (this.scrollNode) {
			this.scrollNode.scrollLeft = inX;
			this.scrollNode.scrollTop = inY;
			this.effectOverscroll(inX, inY);
		}
	},
	effectOverscroll: function(inX, inY) {
		var n = this.scrollNode;
		var o = "";
		if (inY != n.scrollTop && inY !== null) {
			o += " translateY(" + (n.scrollTop - inY) + "px)";
		}
		if (inX != n.scrollLeft && inX !== null) {
			o += " translateX(" + (n.scrollLeft - inX) + "px)";
		}
		if (n) {
			var s = n.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.transform = o;
		}
	}
});

/**
	_enyo.TouchScrollStrategy_ is a helper kind for implementing a touch-based
	scroller. It integrates the scrolling simulation provided by
	[enyo.ScrollMath](#enyo.ScrollMath) into an [enyo.Scroller](#enyo.Scroller).

	_enyo.TouchScrollStrategy_ is not typically created in application code.
	Instead, it is specified as the value of the _strategyKind_ property of an
	_enyo.Scroller_ or [enyo.List](#enyo.List), or is used by the
	framework implicitly.
*/
enyo.kind({
	name: "enyo.TouchScrollStrategy",
	kind: "ScrollStrategy",
	/**
		If true (the default), the scroller will overscroll and bounce back at the edges
	*/
	overscroll: true,
	/**
		If true (the default), the scroller will not propagate _dragstart_
		events that cause it to start scrolling
	*/
	preventDragPropagation: true,
	published: {
		/**
			Specifies how to vertically scroll.  Acceptable values are:

			* "scroll": Always scroll
			* "auto": Scroll only if the content overflows the scroller
			* "hidden": Never scroll
			* "default": In touch environments, the default vertical scrolling
				behavior is to always scroll. If the content does not overflow
				the scroller, the scroller will overscroll and snap back.
		*/
		vertical: "default",
		/**
			Specifies how to horizontally scroll.  Acceptable values are:

			* "scroll": Always scroll
			* "auto":  Scroll only if the content overflows the scroller
			* "hidden": Never scroll
			* "default": Same as "auto"
		*/
		horizontal: "default",
		//* Set to true to display a scroll thumb
		thumb: true,
		/**
			Set to true to display a transparent overlay while scrolling. This
			can help improve performance of complex, large scroll regions on
			some platforms (e.g., Android).
		*/
		scrim: false,
		//*	Allow drag events sent when gesture events are happening simultaneously
		dragDuringGesture: true,
		//* Facade Animation time step from ScrollMath
		interval: 20,
		//* Adjust animation interval type from ScrollMath
		fixedTime: true,
		//* Modify one unit of time for simulation from ScrollMath
		frame: 10
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
		{name: "client", classes: "enyo-touch-scroller"}
	],
	// flag telling us whether the list is currently reordering
	listReordering: false,
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.transform = enyo.dom.canTransform();
			if(!this.transform) {
				if(this.overscroll) {
					//so we can adjust top/left if browser can't handle translations
					this.$.client.applyStyle("position", "relative");
				}
			}
			this.accel = enyo.dom.canAccelerate();
			var containerClasses = "enyo-touch-strategy-container";
			// note: needed for ios to avoid incorrect clipping of thumb
			// and need to avoid on Android as it causes problems hiding the thumb
			if (enyo.platform.ios && this.accel) {
				containerClasses += " enyo-composite";
			}
			this.scrimChanged();
			this.intervalChanged();
			this.fixedTimeChanged();
			this.frameChanged();
			this.container.addClass(containerClasses);
			this.translation = this.accel ? "translate3d" : "translate";
		};
	}),
	initComponents: enyo.inherit(function (sup) {
		return function() {
			this.createChrome(this.tools);
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function() {
			this.container.removeClass("enyo-touch-strategy-container");
			sup.apply(this, arguments);
		};
	}),
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			enyo.makeBubble(this.$.client, "scroll");
			this.calcBoundaries();
			this.syncScrollMath();
			if (this.thumb) {
				this.alertThumbs();
			}
		};
	}),
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
	//* Whether or not the scroller is actively moving
	isScrolling: function() {
		var m = this.$.scrollMath;
		return m ? m.isScrolling() : this.scrolling;
	},
	//* Whether or not the scroller is in overscrolling
	isOverscrolling: function() {
		var m = this.$.scrollMath || this;
		return (this.overscroll) ? m.isInOverScroll() : false;
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
	intervalChanged: function() {
		if (this.$.scrollMath) {
			this.$.scrollMath.interval = this.interval;
		}
	},
	fixedTimeChanged: function() {
		if (this.$.scrollMath) {
			this.$.scrollMath.fixedTime = this.fixedTime;
		}
	},
	frameChanged: function() {
		if (this.$.scrollMath) {
			this.$.scrollMath.frame = this.frame;
		}
	},
	stop: function() {
		if (this.isScrolling()) {
			this.$.scrollMath.stop(true);
		}
	},
	stabilize: function() {
		if(this.$.scrollMath) {
			this.$.scrollMath.stabilize();
		}
	},
	//* Scrolls to specific x/y positions within the scroll area.
	scrollTo: function(inX, inY) {
		this.stop();
		this.$.scrollMath.scrollTo(inX, inY || inY === 0 ? inY : null);
	},
	scrollIntoView: enyo.inherit(function (sup) {
		return function() {
			this.stop();
			sup.apply(this, arguments);
		};
	}),
	//* Sets the left scroll position within the scroller.
	setScrollLeft: enyo.inherit(function (sup) {
		return function() {
			this.stop();
			sup.apply(this, arguments);
		};
	}),
	//* Sets the top scroll position within the scroller.
	setScrollTop: enyo.inherit(function (sup) {
		return function() {
			this.stop();
			sup.apply(this, arguments);
		};
	}),
	//* Gets the left scroll position within the scroller.
	getScrollLeft: enyo.inherit(function (sup) {
		return function() {
			return this.isScrolling() ? this.scrollLeft : sup.apply(this, arguments);
		};
	}),
	//* Gets the top scroll position within the scroller.
	getScrollTop: enyo.inherit(function (sup) {
		return function() {
			return this.isScrolling() ? this.scrollTop : sup.apply(this, arguments);
		};
	}),
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
			var m = this.$.scrollMath || this;
			m.stop(e);
			return true;
		}
	},
	move: function(inSender, inEvent) {
	},
	// Special synthetic DOM events served up by the Gesture system
	dragstart: function(inSender, inEvent) {
		// Ignore drags sent from multi-touch events
		if(!this.dragDuringGesture && inEvent.srcEvent.touches && inEvent.srcEvent.touches.length > 1) {
			return true;
		}
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
		// if the list is doing a reorder, don't scroll
		if(this.listReordering) {
			return false;
		}
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
		if (!this.dragging && this.useMouseWheel) {
			this.calcBoundaries();
			this.syncScrollMath();
			this.stabilize();
			if (this.$.scrollMath.mousewheel(e)) {
				e.preventDefault();
				return true;
			}
		}
	},
	scrollMathStart: function() {
		if (this.scrollNode) {
			this.calcBoundaries();
			if (this.thumb) {
				this.showThumbs();
			}
		}
	},
	scrollMathScroll: function(inSender) {
		if(!this.overscroll) {
			//don't overscroll past edges
			this.effectScroll(-Math.min(inSender.leftBoundary, Math.max(inSender.rightBoundary, inSender.x)),
					-Math.min(inSender.topBoundary, Math.max(inSender.bottomBoundary, inSender.y)));
		} else {
			this.effectScroll(-inSender.x, -inSender.y);
		}
		if (this.thumb) {
			this.updateThumbs();
		}
	},
	scrollMathStop: function() {
		this.effectScrollStop();
		if (this.thumb) {
			this.delayHideThumbs(100);
		}
	},
	calcBoundaries: function() {
		var s = this.$.scrollMath || this, b = this._getScrollBounds();
		s.bottomBoundary = b.clientHeight - b.height;
		s.rightBoundary = b.clientWidth - b.width;
	},
	syncScrollMath: function() {
		var m = this.$.scrollMath;
		if(m) {
			m.setScrollX(-this.getScrollLeft());
			m.setScrollY(-this.getScrollTop());
		}
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
		var x = "0", y = "0", z = this.accel ? ",0" : "";
		if (inY !== null && Math.abs(inY - n.scrollTop) > 1) {
			y = (n.scrollTop - inY);
		}
		if (inX !== null && Math.abs(inX - n.scrollLeft) > 1) {
			x = (n.scrollLeft - inX);
		}
		if(!this.transform) {
			//adjust top/left if browser can't handle translations
			this.$.client.setBounds({left:x + "px", top:y + "px"});
		} else {
			enyo.dom.transformValue(this.$.client, this.translation, x + "px, " + y + "px" + z);
		}
	},
	//* Returns the values of _overleft_ and _overtop_, if any.
	getOverScrollBounds: function() {
		var m = this.$.scrollMath || this;
		return {
			overleft: Math.min(m.leftBoundary - m.x, 0) || Math.max(m.rightBoundary - m.x, 0),
			overtop: Math.min(m.topBoundary - m.y, 0) || Math.max(m.bottomBoundary - m.y, 0)
		};
	},
	_getScrollBounds: enyo.inherit(function (sup) {
		return function() {
			var r = sup.apply(this, arguments);
			enyo.mixin(r, this.getOverScrollBounds());
			return r;
		};
	}),
	getScrollBounds: enyo.inherit(function (sup) {
		return function() {
			this.stop();
			return sup.apply(this, arguments);
		};
	}),
	// Thumb processing
	alertThumbs: function() {
		this.showThumbs();
		this.delayHideThumbs(500);
	},
	//* Syncs the vertical and horizontal scroll indicators.
	syncThumbs: function() {
		this.$.vthumb.sync(this);
		this.$.hthumb.sync(this);
	},
	updateThumbs: function() {
		this.$.vthumb.update(this);
		this.$.hthumb.update(this);
	},
	//* Syncs and shows both the vertical and horizontal scroll indicators.
	showThumbs: function() {
		this.syncThumbs();
		if (this.horizontal != "hidden") {
			this.$.hthumb.show();
		}
		if (this.vertical != "hidden") {
			this.$.vthumb.show();
		}
	},
	//* Hides the vertical and horizontal scroll indicators.
	hideThumbs: function() {
		this.$.vthumb.hide();
		this.$.hthumb.hide();
	},
	//* Hides the vertical and horizontal scroll indicators asynchronously.
	delayHideThumbs: function(inDelay) {
		this.$.vthumb.delayHide(inDelay);
		this.$.hthumb.delayHide(inDelay);
	}
});

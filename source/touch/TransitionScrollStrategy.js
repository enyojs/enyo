/**
_enyo.TransitionScrollStrategy is a helper kind that extends
<a href="#enyo.TouchScrollStrategy">enyo.TouchScrollStrategy</a>, optimizing it
for scrolling environments in which effecting scroll changes with transform
using CSS transitions is fastest.

_enyo.TransitionScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.TransitionScrollStrategy",
	kind: "enyo.TouchScrollStrategy",
	//* @protected
	components: [
		{name: "clientContainer", classes: "enyo-touch-scroller", components: [
			{name: "client"}
		]}
	],
	events: {
		onScrollStart: "",
		onScroll: "",
		onScrollStop: ""
	},
	handlers: {
		ondown: "down",
		ondragfinish: "dragfinish"
	},
	//* No scrollMath tool for this strategy
	tools: [
		{name: "vthumb", kind: "ScrollThumb", axis: "v", showing: true},
		{name: "hthumb", kind: "ScrollThumb", axis: "h", showing: false}
	],
	//* Scalar applied to 'flick' event velocity
	kFlickScalar: 600,
	//* Top snap boundary, generally 0
	topBoundary: 0,
	//* Right snap boundary, generally (viewport width - content width)
	rightBoundary: 0,
	//* Bottom snap boundary, generally (viewport height - content height)
	bottomBoundary: 0,
	//* Left snap boundary, generally 0
	leftBoundary: 0,
	//* X value used in addition to scrollLeft to determine scrolling behavior
	x:0,
	//* Y value used in addition to scrollTop to determine scrolling behavior
	y:0,
	//* Flag to specify whether scrolling is in progress
	scrolling: false,
	//* Event listener for webkit transition completion
	listener: null,
	//* X Distance to scroll into overscroll space before bouncing back
	deltaX:0,
	//* Y Distance to scroll into overscroll space before bouncing back
	deltaY:0,
	//* Timeout used to stop scrolling on mousedown
	stopTimeout: null,
	//* MS delay used to stop scrolling on mousedown
	stopTimeoutMS: 80,
	//* Interval used to update scroll values and bubble scroll events during scroll animation
	scrollInterval: null,
	//* MS delay used to update scroll values and bubble scroll events during scroll animation
	scrollIntervalMS: 50,
	//* Transition animations
	transitions: {
		//* None - used for dragging, etc.
		none   : "",
		//* Scroll - basic scrolling behavior
		scroll : "-webkit-transform 3.8s cubic-bezier(.19,1,.28,1.0) 0s",
		//* Bounce - overscroll bounceback behavior
		bounce : "-webkit-transform 0.5s cubic-bezier(0.06,.5,.5,.94) 0s"
	},
	
	//* @public
	
	//* Sets the left scroll position within the scroller.
	setScrollLeft: function(inLeft) {
		this.stop();
		this.setScrollX(inLeft);
	},
	//* Sets the top scroll position within the scroller.
	setScrollTop: function(inTop) {
		this.stop();
		this.setScrollY(inTop);
	},
	//* Gets the left scroll position within the scroller.
	getScrollLeft: function() {
		return this.scrollLeft;
	},
	//* Gets the top scroll position within the scroller.
	getScrollTop: function() {
		return this.scrollTop;
	},
	
	//* @protected
	
	// apply initial transform so we're always composited
	create: function() {
		this.inherited(arguments);
		enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
	},
	rendered: function() {
		this.inherited(arguments);
		this.setupListener();
	},
	// setup webkitTransitionEnd listener
	setupListener: function() {
		this.listener = this.$.client.node.addEventListener('webkitTransitionEnd', enyo.bind(this,"transitionComplete"), false);
	},
	getScrollSize: function() {
		var n = this.$.client.hasNode();
		return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
	},
	horizontalChanged: function() {
		this.horizontal = (this.horizontal != "hidden");
	},
	verticalChanged: function() {
		this.vertical = (this.vertical != "hidden");
	},
	calcScrollNode: function() {
		return this.$.clientContainer.hasNode();
	},
	maxHeightChanged: function() {
		// content should cover scroller at a minimum if there's no max-height.
		this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%");
		this.$.client.applyStyle("max-height", this.maxHeight);
		this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
	},
	calcAutoScrolling: function() {
		var v = (this.vertical != "hidden");
		var h = (this.horizontal != "hidden");
		if ((v || h) && this.scrollNode) {
			var b = this.getScrollBounds();
			if (v) {
				this.vertical = b.height > b.clientHeight;
			}
			if (h) {
				this.horizontal = b.width > b.clientWidth;
			}
		}
	},
	isInOverScroll: function(x,y) {
		return (this.isInOverScrollX() || this.isInOverScrollY());
	},
	isInOverScrollX: function(x) {
		x = x || this.x;
		return (x > this.leftBoundary || x < this.rightBoundary);
	},
	isInOverScrollY: function(y) {
		y = y || this.y;
		return (y > this.topBoundary || y < this.bottomBoundary);
	},
	calcStartInfo: function() {
		var sb = this.getScrollBounds(), y = this.getScrollTop(), x = this.getScrollLeft();
		this.startEdges = {
			top: y === 0,
			bottom: y === sb.maxTop,
			left: x === 0,
			right: x === sb.maxLeft
		};
	},
	mousewheel: function(inSender, e) {
		if (!this.dragging) {
			this.calcBoundaries();
			this.syncScrollMath();
			var dy = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0;
			var y = parseFloat(this.y) + parseFloat(dy);
			y = (y < this.bottomBoundary) ? this.bottomBoundary : (y > this.topBoundary) ? this.topBoundary : y;
			this.stop();
			this.effectScroll(this.x,y);
			this.setScrollX(this.x);
			this.setScrollY(y);
			e.preventDefault();
			return true;
		}
	},
	// Update thumbs, recalculate boundaries, and bubble scroll event
	scroll: function(inSender, inEvent) {
		if(this.thumb) {
			this.updateThumbs();
		}
		this.calcBoundaries();
		this.doScroll();
	},
	// Scroll to current x,y coordinates and bubble scrollstart event
	start: function() {
		this.startScrolling(this.x,this.y);
		this.doScrollStart();
	},
	// If scrolling, stop. Hide thumbs and bubble scrollstop event.
	stop: function() {
		if(this.isScrolling()) {
			this.stopScrolling();
		}
		if (this.thumb) {
			this.delayHideThumbs(100);
		}
		this.doScrollStop();
	},
	
	// Set scroll x value to the current computed style
	updateX: function() {
		var x = window.getComputedStyle(this.$.client.node,null).getPropertyValue("-webkit-transform").split('(')[1];
		x = (x == undefined) ? 0 : x.split(')')[0].split(',')[4];
		this.setScrollX(parseFloat(x));
	},
	// Set scroll y value to the current computed style
	updateY: function() {
		var y = window.getComputedStyle(this.$.client.node,null).getPropertyValue("-webkit-transform").split('(')[1];
		y = (y == undefined) ? 0 : y.split(')')[0].split(',')[5];
		this.setScrollY(parseFloat(y));
	},
	// Set scroll x and scroll left values
	setScrollX: function(inX) {
		this.scrollLeft = -1*inX;
		this.x = inX;
	},
	// Set scroll y and scroll top values
	setScrollY: function(inY) {
		this.scrollTop = -1*inY;
		this.y = inY;
	},
	// Apply transform to scroll the scroller
	effectScroll: function(inX, inY) {
		var o = inX + "px, " + inY + "px" + (this.accel ? ",0" : "");
		enyo.dom.transformValue(this.$.client, this.translation, o);
	},
	
	// On touch, stop transition by setting transform values to current computed style, and
	// changing transition time to 0s. TODO
	down: function(inSender, inEvent) {
		var _this = this;
		if (this.isScrolling() && !this.isOverscrolling()) {
			this.stopTimeout = setTimeout(function() { _this.stop(); }, this.stopTimeoutMS);
			return true;
		}
	},
	// Special synthetic DOM events served up by the Gesture system
	dragstart: function(inSender, inEvent) {
		if(this.stopTimeout) {
			clearTimeout(this.stopTimeout);
		}
		// Ignore drags sent from multi-touch events
		if(!this.dragDuringGesture && inEvent.srcEvent.touches && inEvent.srcEvent.touches.length > 1) {
			return true;
		}
		// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
		this.shouldDrag(inEvent);
		this.dragging = (inEvent.dragger == this || (!inEvent.dragger && inEvent.boundaryDragger == this));
		if (this.dragging) {
			if(this.isScrolling()) {
				this.stopScrolling();
			}
			if(this.thumb) {
				this.showThumbs();
			}
			inEvent.preventDefault();
			this.prevY = inEvent.pageY;
			this.prevX = inEvent.pageX;
			this.y = -1*(this.scrollTop);
			this.x = -1*(this.scrollLeft);
			if (this.preventDragPropagation) {
				return true;
			}
		}
	},
	// Determine if we should allow dragging
	shouldDrag: function(e) {
		this.calcStartInfo();
		this.calcAutoScrolling();
		if(!this.horizontal) {
			return this.shouldDragVertical(e);
		} else {
			if(!this.vertical) {
				return this.shouldDragHorizontal(e);
			} else {
				return (this.shouldDragVertical(e) || this.shouldDragHorizontal(e));
			}
		}
	},
	shouldDragVertical: function(e) {
		var canV = this.canDragVertical(e);
		var oobV = this.oobVertical(e);
		// scroll if not at a boundary
		if (!e.boundaryDragger && canV) {
			e.boundaryDragger = this;
		}
		// include boundary exclusion
		if (!oobV && canV) {
			e.dragger = this;
			return true;
		}
	},
	shouldDragHorizontal: function(e) {
		var canH = this.canDragHorizontal(e);
		var oobH = this.oobHorizontal(e);
		// scroll if not at a boundary
		if (!e.boundaryDragger && canH) {
			e.boundaryDragger = this;
		}
		// include boundary exclusion
		if (!oobH && canH) {
			e.dragger = this;
			return true;
		}
	},
	canDragVertical: function(e) {
		return (this.vertical && e.vertical);
	},
	canDragHorizontal: function(e) {
		return (this.horizontal && !e.vertical);
	},
	oobVertical: function(e) {
		var down = e.dy < 0;
		return (!down && this.startEdges.top || down && this.startEdges.bottom);
	},
	oobHorizontal: function(e) {
		var right = e.dx < 0;
		return (!right && this.startEdges.left || right && this.startEdges.right);
	},
	// Move scroller based on user's dragging
	drag: function(inSender, e) {
		// if shouldDrag() set this.dragging to true
		if(this.dragging) {
			e.preventDefault();
			// calculate new scroll values
			this.x = this.horizontal ? this.dragHorizontal(e) : this.x;
			this.y = this.vertical ? this.dragVertical(e) : this.y;
			// apply new scroll values
			this.effectScroll(this.x,this.y);
			this.scroll();
			// save values for next drag
			this.prevY = e.pageY;
			this.prevX = e.pageX;
			return true;
		}
	},
	dragVertical: function(e) {
		var dy = e.pageY - this.prevY;
		var y = this.y + dy;
		return this.overscrollDragDamping(y, dy, this.topBoundary, this.bottomBoundary);
	},
	dragHorizontal: function(e) {
		var dx = e.pageX - this.prevX;
		var x = this.x + dx;
		return this.overscrollDragDamping(x, dx, this.leftBoundary, this.rightBoundary);
	},
	// Provides resistance against dragging into overscroll
	overscrollDragDamping: function(value, delta, aBoundary, bBoundary) {
		if(value > aBoundary || value < bBoundary) {
			delta /= 2;
			value = this.y + delta;
		}
		return value;
	},
	// When user releases the drag, set this.dragging to false, bounce overflow back, and hide scrim.
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			inEvent.preventTap();
			this.dragging = false;
			if(!this.isScrolling()) {
				this.correctOverflow();
			}
			if (this.scrim) {
				this.$.scrim.hide();
			}
		}
	},
	// When user flicks/throws scroller, figure the distance to be travelled and whether we will end up
	// in the overscroll region.
	flick: function(inSender, e) {
		n = enyo.now();
		var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.horizontal : this.vertical;
		if (this.dragging && onAxis) {
			this.y = this.vertical ? this.flickVertical(e) : this.y;
			this.x = this.horizontal ? this.flickHorizontal(e) : this.x;
			this.deltaX = null;
			this.deltaY = null;
			// if flick will put the x axis into overscroll, figure where we should bounce back (deltaX)
			if(this.isInOverScrollX()) {
				if(this.x < this.leftBoundary) {
					this.deltaX = this.figureDelta(this.leftBoundary - this.x);
				} else {
					this.deltaX = this.figureDelta(this.x);
				}
			}
			// if flick will put the y axis into overscroll, figure where we should bounce back (deltaY)
			if(this.isInOverScrollY()) {
				if(this.y < this.bottomBoundary) {
					this.deltaY = this.figureDelta(this.bottomBoundary - this.y);
				} else {
					this.deltaY = this.figureDelta(this.y);
				}
			}
			// kickoff scrolling animation
			this.startScrolling(this.x,this.y);
			return this.preventDragPropagation;
		}
	},
	flickVertical: function(e) {
		return (parseFloat(this.y) + e.yVelocity * this.kFlickScalar);
	},
	flickHorizontal: function(e) {
		return (parseFloat(this.x) + e.xVelocity * this.kFlickScalar);
	},
	// Apply the 'scroll' transition, apply new transform based on x and y, and begin
	// this.scrollInterval to update the scrollTop/Left values while scrolling
	startScrolling: function(x,y) {
		this.applyTransition("scroll");
		this.effectScroll(x,y);
		this.setCSSTransitionInterval();
		this.scrolling = true;
	},
	// Apply the 'bounce' transition, apply new transform based on x and y, and begin
	// this.scrollInterval to update the scrollTop/Left values while scrolling
	startOverflowScrolling: function(x,y) {
		this.applyTransition("bounce");
		this.effectScroll(x,y);
		this.setOverflowTransitionInterval();
		this.scrolling = true;
	},
	// Apply the given transition to this.$.client
	applyTransition: function(which) {
		this.$.client.applyStyle("-webkit-transition",this.transitions[which])
	},
	// Turn off CSS transition and clear this.scrollInterval
	stopScrolling: function() {
		this.resetCSSTranslationVals();
		this.clearCSSTransitionInterval();
		this.scrolling = false;
	},
	// Create an interval to: update the x/y values while scrolling is happening, check for
	// crossing into the overflow region, and bubble a scroll event
	setCSSTransitionInterval: function() {
		this.clearCSSTransitionInterval();
		this.scrollInterval = setInterval(enyo.bind(this, function() {
			this.updateScrollPosition();
			this.correctOverflow();
		}), this.scrollIntervalMS);
	},
	// Create an interval to: update the x/y values while scrolling is happening, and bubble
	// a scroll event (don't check for crossing into overflow since we're there already)
	setOverflowTransitionInterval: function() {
		this.clearCSSTransitionInterval();
		this.scrollInterval = setInterval(enyo.bind(this, function() {
			this.updateScrollPosition();
		}), this.scrollIntervalMS);
	},
	// Save current x/y position and bubble scroll event
	updateScrollPosition: function() {
		this.updateY();
		this.updateX();
		this.scroll();
	},
	// Clear this.scrollInterval
	clearCSSTransitionInterval: function() {
		if(this.scrollInterval) {
			clearInterval(this.scrollInterval);
		}
	},
	// Set scroller translation to current position and turn transition off. This effectively
	// stops scrolling
	resetCSSTranslationVals: function() {
		var transformStyle = getComputedStyle(this.$.client.node,null).getPropertyValue("-webkit-transform").split('(')[1].split(')')[0].split(',');
		this.applyTransition("none");
		this.effectScroll(transformStyle[4],transformStyle[5]);
	},
	// Bounce back from overscroll region
	correctOverflow: function(overflowY) {
		if(this.isInOverScroll()) {
			var x = (this.horizontal) ? this.correctOverflowX() : this.x;
			var y = (this.vertical) ? this.correctOverflowY() : this.y;
			if(x !== false && y !== false) {
				this.startOverflowScrolling(x,y);
			}
		}
	},
	// Determine if we're overscrolled on the x axis and if so return proper edge value
	correctOverflowX: function() {
		if(this.x > this.rightBoundary) {
			if(this.beyondBoundary(this.x, this.rightBoundary, this.deltaX)) {
				return this.rightBoundary;
			}
		} else if(this.x < this.leftBoundary) {
			if(this.beyondBoundary(this.x, this.leftBoundary, this.deltaX)) {
				return this.leftBoundary;
			}
		}	
		return false;
	},
	// Determine if we're overscrolled on the y axis and if so return proper edge value
	correctOverflowY: function() {
		if(this.y > this.topBoundary) {
			if(this.beyondBoundary(this.y, this.topBoundary, this.deltaY)) {
				return this.topBoundary;
			}
		} else if(this.y < this.bottomBoundary) {
			if(this.beyondBoundary(this.y, this.bottomBoundary, this.deltaY)) {
				return this.bottomBoundary;
			}
		}
		return false;
	},
	// Figure how far into the overscroll region we should go before bouncing back
	figureDelta: function(target) {
		var kLimit = 200, kMultiplier = 5;
		return kLimit - target*kLimit*kMultiplier/Math.pow(target,1.3);
	},
	// If we've crossed the determined delta, bounce back
	beyondBoundary: function(current,boundary,max) {
		return (Math.abs(Math.abs(boundary) - Math.abs(current)) > Math.abs(max));
	},
	// When transition animation is complete, check if we need to bounce back from overscroll
	// region. If not, stop.
	transitionComplete: function() {
		if(parseInt(this.scrollTop) < this.topBoundary) {
			this.startOverflowScrolling(this.leftBoundary,this.topBoundary);
		} else if (parseInt(this.scrollTop*-1) < this.bottomBoundary) {
			this.startOverflowScrolling(this.leftBoundary,this.bottomBoundary);
		} else {
			this.stop();
		}
	}
});

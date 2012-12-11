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
		ondragfinish: "dragfinish",
		onwebkitTransitionEnd: "transitionComplete"
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
	boundaryY:0,
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
	
	//* Sets the top scroll position within the scroller.
	setScrollTop: function(inTop) {
		this.stop();
		this.scrollTop = inTop;
		this.effectScroll();
	},
	setScrollY: function(inTop) {
		this.scrollTop = -1*inTop;
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
		//this.listener = this.$.client.node.addEventListener('webkitTransitionEnd', enyo.bind(this,"transitionComplete"), false);
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
	isInOverScrollY: function() {
		return (this.isInTopOverScrollY() || this.isInBottomOverScrollY());
	},
	isInTopOverScrollY: function() {
		return (this.scrollTop < this.topBoundary);
	},
	isInBottomOverScrollY: function() {
		return (this.scrollTop*-1 < this.bottomBoundary);
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
			var y = parseFloat(this.scrollTop) + parseFloat(dy);
			y = (y < this.bottomBoundary) ? this.bottomBoundary : (y > this.topBoundary) ? this.topBoundary : y;
			this.stop();
			this.effectScroll(this.x,y);
			this.setScrollX(this.x);
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
		this.startScrolling();
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
		this.scrollTop = -1*parseFloat(y);
	},
	// Set scroll x and scroll left values
	setScrollX: function(inX) {
		this.scrollLeft = inX;
		this.x = -1*inX;
	},
	// Apply transform to scroll the scroller
	effectScroll: function() {
		var o = this.x + "px, " + (-1*this.scrollTop) + "px" + (this.accel ? ",0" : "");
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
		// if the list is doing a reorder, don't scroll
		if(this.listReordering) {
			return false;
		}
		// if shouldDrag() set this.dragging to true
		if(this.dragging) {
			e.preventDefault();
			// calculate new scroll values
			this.x = this.horizontal ? this.calculateDragDistance(this.scrollLeft, (-1*(e.pageX-this.prevX)), this.leftBoundary, this.rightBoundary) : this.x;
			this.scrollTop = this.vertical ? this.calculateDragDistance(this.scrollTop, (-1*(e.pageY-this.prevY)), this.topBoundary, this.bottomBoundary) : this.scrollTop;
			// update scrolltop and scrollleft values
			this.setScrollLeft(-1*this.x);
			// apply new scroll values
			this.effectScroll();
			this.scroll();
			// save values for next drag
			this.prevY = e.pageY;
			this.prevX = e.pageX;
		}
	},
	//* Figure how far the drag should go based on pointer movement (delta)
	calculateDragDistance: function(currentPosition, delta, aBoundary, bBoundary) {
		var newPosition = currentPosition + delta;
		return this.overscrollDragDamping(newPosition,delta,aBoundary,bBoundary);
	},
	//* Provides resistance against dragging into overscroll
	overscrollDragDamping: function(value, delta, aBoundary, bBoundary) {
		if(value < aBoundary || value*-1 < bBoundary) {
			delta /= 2;
			value = this.scrollTop + delta;
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
	// Bounce back from overscroll region
	correctOverflow: function(overflowY) {
		if(this.isInOverScroll()) {
			var x = (this.horizontal) ? this.correctOverflowX() : this.x;
			var y = (this.vertical) ? this.correctOverflowY() : this.scrollTop;
			if(x !== false && y !== false) {
				this.scrollLeft = (x !== false) ? x : this.scrollLeft;
				this.scrollTop = (y !== false) ? y : this.scrollTop;
				this.startOverflowScrolling();
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
		if(this.isInTopOverScrollY()) {
			if(this.beyondBoundary(this.scrollTop, this.topBoundary, this.boundaryY)) {
				return this.topBoundary;
			}
		} else if(this.isInBottomOverScrollY()) {
			if(this.beyondBoundary(this.scrollTop, this.bottomBoundary, this.boundaryY)) {
				return -1*this.bottomBoundary;
			}
		}
		return false;
	},
	// If we've crossed the determined delta, bounce back
	beyondBoundary: function(current,boundary,max) {
		return (Math.abs(Math.abs(boundary) - Math.abs(current)) > Math.abs(max));
	},
	// When user flicks/throws scroller, figure the distance to be travelled and whether we will end up
	// in the overscroll region.
	flick: function(inSender, e) {
		if(this.dragging && this.flickOnEnabledAxis(e)) {
			this.scrollTop = this.vertical ? this.calculateFlickDistance(this.scrollTop, -1*e.yVelocity) : this.scrollTop;
			this.scrollleft = this.horizontal ? this.calculateFlickDistance(this.scrollLeft, -1*e.xVelocity) : this.scrollLeft;
			this.deltaX = null;
			this.boundaryY = null;
			// if flick will put the x axis into overscroll, figure where we should bounce back (deltaX)
			if(this.isInOverScrollX()) {
				if(this.x < this.leftBoundary) {
					this.deltaX = this.figureBoundary(this.leftBoundary - this.x);
				} else {
					this.deltaX = this.figureBoundary(this.x);
				}
			}
			// if flick will put the y axis into overscroll, figure where we should bounce back (boundary)
			if(this.isInTopOverScrollY()) {
				this.boundaryY = this.figureBoundary(this.scrollTop);
			} else if(this.isInBottomOverScrollY()) {
				this.boundaryY = this.figureBoundary(-1*this.bottomBoundary - this.scrollTop);
			}
			// kickoff scrolling animation
			this.startScrolling();
			return this.preventDragPropagation;
		}
	},
	flickOnEnabledAxis: function(e) {
		return Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.horizontal : this.vertical;
	},
	calculateFlickDistance: function(currentPosition, flickVelocity) {
		return (currentPosition + (flickVelocity * this.kFlickScalar));
	},
	// Apply the 'scroll' transition, apply new transform based on x and y, and begin
	// this.scrollInterval to update the scrollTop/Left values while scrolling
	startScrolling: function() {
		this.applyTransition("scroll");
		this.effectScroll();
		this.setCSSTransitionInterval();
		this.scrolling = true;
	},
	// Apply the 'bounce' transition, apply new transform based on x and y, and begin
	// this.scrollInterval to update the scrollTop/Left values while scrolling
	startOverflowScrolling: function() {
		this.applyTransition("bounce");
		this.effectScroll();
		this.setOverflowTransitionInterval();
		this.scrolling = true;
	},
	// Apply the given transition to this.$.client
	applyTransition: function(which) {
		this.$.client.applyStyle("-webkit-transition",this.transitions[which]);
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
			this.scrollInterval = null;
		}
	},
	// Set scroller translation to current position and turn transition off. This effectively
	// stops scrolling
	resetCSSTranslationVals: function() {
		var transformStyle = getComputedStyle(this.$.client.node,null).getPropertyValue("-webkit-transform").split('(')[1].split(')')[0].split(',');
		this.applyTransition("none");
		this.scrollLeft = transformStyle[4];
		this.scrollTop = -1*transformStyle[5];
		this.effectScroll();
	},
	// Figure how far into the overscroll region we should go before bouncing back
	figureBoundary: function(target) {
		var absTarget = Math.abs(target);
		var retVal = absTarget - absTarget/Math.pow(absTarget,0.02);
		retVal = target < 0 ? -1*retVal : retVal;
		return retVal;
	},
	// When transition animation is complete, check if we need to bounce back from overscroll
	// region. If not, stop.
	transitionComplete: function() {
		if(parseInt(this.scrollTop) < this.topBoundary) {
			if(Math.abs(this.scrollTop - this.topBoundary) < 10) { // TODO - why is the overflow correction coming up short?
				this.stop();
				this.scrollTop = this.topBoundary;
				this.effectScroll();
			} else {
				this.scrollTop = this.topBoundary;
				this.startOverflowScrolling();
			}
		} else if (-1*this.scrollTop < this.bottomBoundary) {
			if(Math.abs(-1*this.scrollTop - this.bottomBoundary) < 10) { // TODO - why is the overflow correction coming up short?
				this.stop();
				this.scrollTop = -1*this.bottomBoundary;
				this.effectScroll();
			} else {
				this.scrollTop = -1*this.bottomBoundary;
				this.startOverflowScrolling();
			}
		} else {
			this.stop();
		}
	},
	//* Scroll to the specified x and y coordinates
	scrollTo: function(inX, inY) {
		this.setScrollTop(-1*inY);
		this.setScrollLeft(-1*inX);
		this.start();
	}
});

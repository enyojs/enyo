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
	//* Flag to specify whether scrolling is in progress
	scrolling: false,
	//* Event listener for webkit transition completion
	listener: null,
	//* X Distance to scroll into overscroll space before bouncing back
	boundaryX:0,
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
	
	//* Sets the left scroll position within the scroller.
	setScrollLeft: function(inLeft) {
		this.stop();
		this.scrollLeft = inLeft;
		this.effectScroll();
	},
	//* Sets the top scroll position within the scroller.
	setScrollTop: function(inTop) {
		this.stop();
		this.scrollTop = inTop;
		this.effectScroll();
	},
	setScrollX: function(inLeft) {
		this.scrollLeft = -1*inLeft;
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
	getScrollSize: function() {
		var n = this.$.client.hasNode();
		return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
	},
	horizontalChanged: function() {
		if(this.horizontal == "hidden") {
			this.horizontal = false;
		}
	},
	verticalChanged: function() {
		if(this.vertical == "hidden") {
			this.vertical = false;
		}
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
		if((this.vertical || this.horizontal) && this.scrollNode) {
			var b = this.getScrollBounds();
			if(this.vertical) {
				this.vertical = b.height > b.clientHeight;
			}
			if(this.horizontal) {
				this.horizontal = b.width > b.clientWidth;
			}
		}
	},
	isInOverScroll: function() {
		return (this.isInTopOverScroll() || this.isInBottomOverScroll() || this.isInLeftOverScroll() || this.isInRightOverScroll());
	},
	isInLeftOverScroll: function() {
		return (this.getScrollLeft() < this.leftBoundary);
	},
	isInRightOverScroll: function() {
		if(this.getScrollLeft <= 0) {
			return false;
		} else {
			return (this.getScrollLeft()*-1 < this.rightBoundary);
		}
	},
	isInTopOverScroll: function() {
		return (this.getScrollTop() < this.topBoundary);
	},
	isInBottomOverScroll: function() {
		if(this.getScrollTop() <= 0) {
			return false;
		} else {
			return (this.getScrollTop()*-1 < this.bottomBoundary);
		}
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
			var y = parseFloat(this.getScrollTop()) + -1*parseFloat(dy);
			y = (y*-1 < this.bottomBoundary) ? -1*this.bottomBoundary : (y < this.topBoundary) ? this.topBoundary : y;
			this.setScrollTop(y);
			this.doScroll();
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
		this.scrollLeft = -1*parseFloat(x);
	},
	// Set scroll y value to the current computed style
	updateY: function() {
		var y = window.getComputedStyle(this.$.client.node,null).getPropertyValue("-webkit-transform").split('(')[1];
		y = (y == undefined) ? 0 : y.split(')')[0].split(',')[5];
		this.scrollTop = -1*parseFloat(y);
	},
	// Apply transform to scroll the scroller
	effectScroll: function() {
		var o = (-1*this.scrollLeft) + "px, " + (-1*this.scrollTop) + "px" + (this.accel ? ",0" : "");
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
			this.scrollLeft = this.horizontal ? this.calculateDragDistance(parseInt(this.getScrollLeft()), (-1*(e.pageX-this.prevX)), this.leftBoundary, this.rightBoundary) : this.getScrollLeft();
			this.scrollTop = this.vertical ? this.calculateDragDistance(this.getScrollTop(), (-1*(e.pageY-this.prevY)), this.topBoundary, this.bottomBoundary) : this.getScrollTop();
			// apply new scroll values
			this.effectScroll();
			this.scroll();
			// save values for next drag
			this.prevY = e.pageY;
			this.prevX = e.pageX;
			this.setBoundaryX();
			this.setBoundaryY();
		}
	},
	//* Figure how far the drag should go based on pointer movement (delta)
	calculateDragDistance: function(currentPosition, delta, aBoundary, bBoundary) {
		var newPosition = currentPosition + delta;
		return this.overscrollDragDamping(currentPosition, newPosition,delta,aBoundary,bBoundary);
	},
	//* Provides resistance against dragging into overscroll
	overscrollDragDamping: function(currentPosition, newPosition, delta, aBoundary, bBoundary) {
		if(newPosition < aBoundary || newPosition*-1 < bBoundary) {
			delta /= 2;
			newPosition = currentPosition + delta;
		}
		return newPosition;
	},
	setBoundaryX: function() {
		this.boundaryX = (this.isInLeftOverScroll()) ? this.leftBoundary : (this.isInRightOverScroll()) ? this.rightBoundary : null;
	},
	setBoundaryY: function() {
		this.boundaryY = (this.isInTopOverScroll()) ? this.topBoundary : (this.isInBottomOverScroll()) ? this.bottomBoundary : null;
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
	correctOverflow: function() {
		if(this.isInOverScroll()) {
			var x = (this.horizontal) ? this.correctOverflowX() : false;
			var y = (this.vertical) ? this.correctOverflowY() : false;
			if(x !== false && y !== false) {
				this.scrollLeft = (x !== false) ? x : this.getScrollLeft();
				this.scrollTop = (y !== false) ? y : this.getScrollTop();
				this.startOverflowScrolling();
			} else if(x !== false) {
				this.scrollLeft = x;
				this.scrollTop = this.targetScrollTop;
				this.targetScrollLeft = this.getScrollLeft();
				if(!this.vertical) {
					this.startOverflowScrolling();
				} else {
					this.startScrolling();
				}
			} else if(y !== false) {
				this.scrollTop = y;
				this.scrollLeft = this.targetScrollLeft;
				this.targetScrollTop = this.getScrollTop();
				if(!this.horizontal) {
					this.startOverflowScrolling();
				} else {
					this.startScrolling();
				}
			}
		}
	},
	// Determine if we're overscrolled on the x axis and if so return proper edge value
	correctOverflowX: function() {
		if(this.isInLeftOverScroll()) {
			if(this.beyondBoundary(this.getScrollLeft(), this.leftBoundary, this.boundaryX)) {
				return this.leftBoundary;
			}
		} else if(this.isInRightOverScroll()) {
			if(this.beyondBoundary(this.getScrollLeft(), this.rightBoundary, this.boundaryX)) {
				return -1*this.rightBoundary;
			}
		}	
		return false;
	},
	// Determine if we're overscrolled on the y axis and if so return proper edge value
	correctOverflowY: function() {
		if(this.isInTopOverScroll()) {
			if(this.beyondBoundary(this.getScrollTop(), this.topBoundary, this.boundaryY)) {
				return this.topBoundary;
			}
		} else if(this.isInBottomOverScroll()) {
			if(this.beyondBoundary(this.getScrollTop(), this.bottomBoundary, this.boundaryY)) {
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
			this.scrollLeft = this.horizontal ? this.calculateFlickDistance(this.scrollLeft, -1*e.xVelocity) : this.getScrollLeft();
			this.scrollTop = this.vertical ? this.calculateFlickDistance(this.scrollTop, -1*e.yVelocity) : this.getScrollTop();
			this.targetScrollLeft = this.scrollLeft;
			this.targetScrollTop = this.scrollTop;
			this.boundaryX = null;
			this.boundaryY = null;
			// if flick will put the x axis into overscroll, figure where we should bounce back (boundary)
			if(this.isInLeftOverScroll()) {
				this.boundaryX = this.figureBoundary(this.getScrollLeft());
			} else if(this.isInRightOverScroll()) {
				this.boundaryX = this.figureBoundary(-1*this.bottomBoundary - this.getScrollLeft());
			}
			// if flick will put the y axis into overscroll, figure where we should bounce back (boundary)
			if(this.isInTopOverScroll()) {
				this.boundaryY = this.figureBoundary(this.getScrollTop());
			} else if(this.isInBottomOverScroll()) {
				this.boundaryY = this.figureBoundary(-1*this.bottomBoundary - this.getScrollTop());
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
		this.scrollLeft = -1*transformStyle[4];
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
	transitionComplete: function(inSender, inEvent) {
		// Only process transition complete if sent from this container
		if(inSender !== this.$.clientContainer) {
			return;
		}
		var posChanged = false;
		if(this.isInTopOverScroll()) {
			posChanged = true;
			this.scrollTop = this.topBoundary;
		} else if (this.isInBottomOverScroll()) {
			posChanged = true;
			this.scrollTop = -1*this.bottomBoundary;
		}
		if(this.isInLeftOverScroll()) {
			posChanged = true;
			this.scrollLeft = this.leftBoundary;
		} else if (this.isInRightOverScroll()) {
			posChanged = true;
			this.scrollLeft = -1*this.rightBoundary;
		}
		
		if(posChanged) {
			this.startOverflowScrolling();
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

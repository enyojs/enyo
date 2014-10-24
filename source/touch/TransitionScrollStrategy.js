(function (enyo, scope) {
	/**
	* Fires when a scrolling action starts.
	*
	* @event enyo.TransitionScrollStrategy#onScrollStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing
	*	event information.
	* @private
	*/

	/**
	* Fires while a scrolling action is in progress.
	*
	* @event enyo.TransitionScrollStrategy#onScroll
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing
	*	event information.
	* @private
	*/

	/**
	* Fires when a scrolling action stops.
	*
	* @event enyo.TransitionScrollStrategy#onScrollStop
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing
	*	event information.
	* @private
	*/

	/**
	* {@link enyo.TransitionScrollStrategy} is a helper [kind]{@glossary kind} that extends
	* {@link enyo.TouchScrollStrategy}, optimizing it for scrolling environments in which
	* effecting scroll changes with transforms using CSS transitions is fastest.
	* 
	* `enyo.TransitionScrollStrategy` is not typically created in application code. Instead, it is
	* specified as the value of the [strategyKind]{@link enyo.Scroller#strategyKind} property of
	* an {@link enyo.Scroller} or {@link enyo.List}, or is used by the framework implicitly.
	*
	* @class enyo.TransitionScrollStrategy
	* @extends enyo.TouchScrollStrategy
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.TransitionScrollStrategy.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.TransitionScrollStrategy',

		/**
		* @private
		*/
		kind: 'enyo.TouchScrollStrategy',

		/**
		* @private
		*/
		components: [
			{name: 'clientContainer', classes: 'enyo-touch-scroller', components: [
				{name: 'client'}
			]}
		],

		/**
		* @private
		*/
		events: {
			onScrollStart: '',
			onScroll: '',
			onScrollStop: ''
		},

		/**
		* @private
		*/
		handlers: {
			ondown: 'down',
			ondragfinish: 'dragfinish',
			onwebkitTransitionEnd: 'transitionComplete'
		},

		/**
		* No scrollMath tool for this strategy.
		* 
		* @private
		*/
		tools: [
			{name: 'vthumb', kind: 'ScrollThumb', axis: 'v', showing: true},
			{name: 'hthumb', kind: 'ScrollThumb', axis: 'h', showing: false}
		],

		/** 
		* Scalar applied to `flick` event velocity.
		*
		* @private
		*/
		kFlickScalar: 600,
		
		/** 
		* Top snap boundary, generally `0`.
		*
		* @private
		*/
		topBoundary: 0,
		
		/** 
		* Right snap boundary, generally `(viewport width - content width)`.
		*
		* @private
		*/
		rightBoundary: 0,
		
		/** 
		* Bottom snap boundary, generally `(viewport height - content height)`.
		*
		* @private
		*/
		bottomBoundary: 0,
		
		/** 
		* Left snap boundary, generally `0`.
		*
		* @private
		*/
		leftBoundary: 0,
		
		/** 
		* Flag indicating whether scrolling is in progress.
		*
		* @private
		*/
		scrolling: false,
		
		/** 
		* Event listener for webkit transition completion.
		*
		* @private
		*/
		listener: null,
		
		/** 
		* Distance along the x-axis to scroll into overscroll space before bouncing back.
		*
		* @private
		*/
		boundaryX:0,
		
		/** 
		* Distance along the y-axis to scroll into overscroll space before bouncing back.
		*
		* @private
		*/
		boundaryY:0,
		
		/** 
		* Timeout used to stop scrolling on `mousedown`.
		*
		* @private
		*/
		stopTimeout: null,
		
		/** 
		* Delay in milliseconds used to stop scrolling on `mousedown`.
		*
		* @private
		*/
		stopTimeoutMS: 80,
		
		/** 
		* Interval used to update scroll values and bubble scroll events during scroll animation.
		*
		* @private
		*/
		scrollInterval: null,
		
		/** 
		* Delay in milliseconds used to update scroll values and bubble scroll events during scroll 
		* animation.
		*
		* @private
		*/
		scrollIntervalMS: 50,
		
		/** 
		* Transition animations.
		*
		* @private
		*/
		transitions: {
			//* None - used for dragging, etc.
			none   : '',
			//* Scroll - basic scrolling behavior
			scroll : '3.8s cubic-bezier(.19,1,.28,1.0) 0s',
			//* Bounce - overscroll bounceback behavior
			bounce : '0.5s cubic-bezier(0.06,.5,.5,.94) 0s'
		},

		/**
		* Sets the horizontal scroll position.
		*
		* @param {Number} left - The horizontal scroll position in pixels.
		* @method
		* @public
		*/
		setScrollLeft: function (left) {
			var prevLeft = this.scrollLeft;
			this.stop();
			this.scrollLeft = left;
			if(this.isInLeftOverScroll() || this.isInRightOverScroll()) {
				this.scrollLeft = prevLeft;
			}
			this.effectScroll();
		},
		
		/**
		* Sets the vertical scroll position.
		*
		* @param {Number} top - The vertical scroll position in pixels.
		* @method
		* @public
		*/
		setScrollTop: function (top) {
			var prevTop = this.scrollTop;
			this.stop();
			this.scrollTop = top;
			if(this.isInTopOverScroll() || this.isInBottomOverScroll()) {
				this.scrollTop = prevTop;
			}
			this.effectScroll();
		},

		/**
		* Sets the scroll position along the x-axis.
		*
		* @param {Number} x - The x-axis scroll position in pixels.
		* @method
		* @public
		*/
		setScrollX: function (x) {
			this.scrollLeft = -1*x;
		},

		/**
		* Sets the scroll position along the y-axis.
		*
		* @param {Number} y - The y-axis scroll position in pixels.
		* @method
		* @public
		*/
		setScrollY: function (y) {
			this.scrollTop = -1*y;
		},

		/**
		* Retrieves the horizontal scroll position.
		*
		* @returns {Number} The horizontal scroll position in pixels.
		* @method
		* @public
		*/
		getScrollLeft: function () {
			return this.scrollLeft;
		},
		
		/**
		* Retrieves the vertical scroll position.
		*
		* @returns {Number} The vertical scroll position in pixels.
		* @method
		* @private
		*/
		getScrollTop: function () {
			return this.scrollTop;
		},

		/**
		* Applies initial transform so we're always composited.
		*
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.dom.transformValue(this.$.client, this.translation, '0,0,0');
			};
		}),

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				this.clearCSSTransitionInterval();
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		getScrollSize: function () {
			var n = this.$.client.hasNode();
			return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
		},

		/**
		* @private
		*/
		horizontalChanged: function () {
			if(this.horizontal == 'hidden') {
				this.scrollHorizontal = false;
			}
		},

		/**
		* @private
		*/
		verticalChanged: function () {
			if(this.vertical == 'hidden') {
				this.scrollVertical = false;
			}
		},

		/**
		* @private
		*/
		intervalChanged: function () {
			// TODO: Implement variable speed implementation
			if (this.interval != enyo.TransitionScrollStrategy.prototype.interval) {
				this.warn('\'interval\' not implemented in TransitionScrollStrategy');
			}
		},

		/**
		* @private
		*/
		calcScrollNode: function () {
			return this.$.clientContainer.hasNode();
		},

		/**
		* @private
		*/
		calcBoundaries: function () {
			var b = this._getScrollBounds();
			this.bottomBoundary = b.clientHeight - b.height;
			this.rightBoundary = b.clientWidth - b.width;
		},

		/**
		* @private
		*/
		maxHeightChanged: function () {
			// content should cover scroller at a minimum if there's no max-height.
			this.$.client.applyStyle('min-height', this.maxHeight ? null : '100%');
			this.$.client.applyStyle('max-height', this.maxHeight);
			this.$.clientContainer.addRemoveClass('enyo-scrollee-fit', !this.maxHeight);
		},

		/**
		* @private
		*/
		calcAutoScrolling: function () {
			var b = this.getScrollBounds();
			if(this.vertical) {
				this.scrollVertical = b.height > b.clientHeight;
			}
			if(this.horizontal) {
				this.scrollHorizontal = b.width > b.clientWidth;
			}
		},

		/**
		* @private
		*/
		isInOverScroll: function () {
			return (this.isInTopOverScroll() || this.isInBottomOverScroll() || this.isInLeftOverScroll() || this.isInRightOverScroll());
		},

		/**
		* @private
		*/
		isInLeftOverScroll: function () {
			return (this.getScrollLeft() < this.leftBoundary);
		},

		/**
		* @private
		*/
		isInRightOverScroll: function () {
			if(this.getScrollLeft <= 0) {
				return false;
			} else {
				return (this.getScrollLeft()*-1 < this.rightBoundary);
			}
		},

		/**
		* @private
		*/
		isInTopOverScroll: function () {
			return (this.getScrollTop() < this.topBoundary);
		},

		/**
		* @private
		*/
		isInBottomOverScroll: function () {
			if(this.getScrollTop() <= 0) {
				return false;
			} else {
				return (this.getScrollTop()*-1 < this.bottomBoundary);
			}
		},

		/**
		* @private
		*/
		calcStartInfo: function () {
			var sb = this.getScrollBounds(), y = this.getScrollTop(), x = this.getScrollLeft();
			this.startEdges = {
				top: y === 0,
				bottom: y === sb.maxTop,
				left: x === 0,
				right: x === sb.maxLeft
			};
		},

		/**
		* @fires enyo.TransitionScrollStrategy#onScroll
		* @private
		*/
		mousewheel: function (sender, e) {
			if (!this.dragging && this.useMouseWheel) {
				this.calcBoundaries();
				this.syncScrollMath();
				this.stabilize();
				var dy = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0;
				var y = parseFloat(this.getScrollTop()) + -1*parseFloat(dy);
				y = (y*-1 < this.bottomBoundary) ? -1*this.bottomBoundary : (y < this.topBoundary) ? this.topBoundary : y;
				this.setScrollTop(y);
				this.doScroll();
				e.preventDefault();
				return true;
			}
		},
		
		/**
		* Updates thumbs, recalculates boundaries, and bubbles `scroll` {@glossary event}.
		*
		* @fires enyo.TransitionScrollStrategy#onScroll
		* @private
		*/
		scroll: function () {
			if(this.thumb) {
				this.updateThumbs();
			}
			this.calcBoundaries();
			this.doScroll();
		},
		
		/**
		* Scrolls to current `x` and `y` coordinates and bubbles `scrollstart`
		* {@glossary event}.
		*
		* @fires enyo.TransitionScrollStrategy#onScrollStart
		* @private
		*/
		start: function () {
			this.startScrolling();
			this.doScrollStart();
		},
		
		/**
		* If currently scrolling, stops scrolling. Hides thumbs and bubbles `scrollstop`
		* {@glossary event}.
		*
		* @fires enyo.TransitionScrollStrategy#onScrollStop
		* @private
		*/
		stop: function () {
			if(this.isScrolling()) {
				this.stopScrolling();
			}
			if (this.thumb) {
				this.delayHideThumbs(100);
			}
			this.doScrollStop();
		},

		/**
		* Sets scroll `x` value to the current computed style.
		*
		* @private
		*/
		updateX: function () {
			var x = window.getComputedStyle(this.$.client.node,null).getPropertyValue(enyo.dom.getCssTransformProp()).split('(')[1];
			x = (x === undefined) ? 0 : x.split(')')[0].split(',')[4];
			if(-1*parseFloat(x) === this.scrollLeft) {
				return false;
			}
			this.scrollLeft = -1*parseFloat(x);
			return true;
		},
		
		/**
		* Sets scroll `y` value to the current computed style.
		*
		* @private
		*/
		updateY: function () {
			var y = window.getComputedStyle(this.$.client.node,null).getPropertyValue(enyo.dom.getCssTransformProp()).split('(')[1];
			y = (y === undefined) ? 0 : y.split(')')[0].split(',')[5];
			if(-1*parseFloat(y) === this.scrollTop) {
				return false;
			}
			this.scrollTop = -1*parseFloat(y);
			return true;
		},
		
		/**
		* Applies transform to scroll the [scroller]{@link enyo.Scroller}.
		*
		* @private
		*/
		effectScroll: function () {
			var o = (-1*this.scrollLeft) + 'px, ' + (-1*this.scrollTop) + 'px' + (this.accel ? ', 0' : '');
			enyo.dom.transformValue(this.$.client, this.translation, o);
		},
		// On touch, stop transition by setting transform values to current computed style, and
		// changing transition time to 0s. TODO
		/**
		* @private
		*/
		down: function () {
			var _this = this;
			if (this.isScrolling() && !this.isOverscrolling()) {
				this.stopTimeout = setTimeout(function() {
					_this.stop();
				}, this.stopTimeoutMS);
				return true;
			}
		},

		/**
		* Special synthetic [DOM events]{@glossary DOMEvent} served up by the 
		* [Gesture]{@link enyo.gesture} system.
		* 
		* @private
		*/
		dragstart: function (sender, e) {
			if(this.stopTimeout) {
				clearTimeout(this.stopTimeout);
			}
			// Ignore drags sent from multi-touch events
			if(!this.dragDuringGesture && e.srcEvent.touches && e.srcEvent.touches.length > 1) {
				return true;
			}
			this.shouldDrag(e);
			this.dragging = (e.dragger == this || (!e.dragger && e.boundaryDragger == this));
			if (this.dragging) {
				if(this.isScrolling()) {
					this.stopScrolling();
				}
				if(this.thumb) {
					this.showThumbs();
				}
				e.preventDefault();
				this.prevY = e.pageY;
				this.prevX = e.pageX;
				if (this.preventDragPropagation) {
					return true;
				}
			}
		},
		
		/**
		* Determines whether we should allow dragging.
		*
		* @private
		*/
		shouldDrag: function (e) {
			this.calcStartInfo();
			this.calcBoundaries();
			this.calcAutoScrolling();
			if(!this.scrollHorizontal) {
				return this.shouldDragVertical(e);
			} else {
				if(!this.scrollVertical) {
					return this.shouldDragHorizontal(e);
				} else {
					return (this.shouldDragVertical(e) || this.shouldDragHorizontal(e));
				}
			}
		},

		/**
		* @private
		*/
		shouldDragVertical: function (e) {
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

		/**
		* @private
		*/
		shouldDragHorizontal: function (e) {
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

		/**
		* @private
		*/
		canDragVertical: function (e) {
			return (this.scrollVertical && e.vertical);
		},

		/**
		* @private
		*/
		canDragHorizontal: function (e) {
			return (this.scrollHorizontal && !e.vertical);
		},

		/**
		* @private
		*/
		oobVertical: function (e) {
			var down = e.dy < 0;
			return (!down && this.startEdges.top || down && this.startEdges.bottom);
		},

		/**
		* @private
		*/
		oobHorizontal: function (e) {
			var right = e.dx < 0;
			return (!right && this.startEdges.left || right && this.startEdges.right);
		},
		
		/**
		* Moves [scroller]{@link enyo.Scroller} based on user's dragging.
		*
		* @private
		*/
		drag: function (sender, e) {
			// if the list is doing a reorder, don't scroll
			if(this.listReordering) {
				return false;
			}
			// if shouldDrag() set this.dragging to true
			if(this.dragging) {
				e.preventDefault();
				// calculate new scroll values
				this.scrollLeft = this.scrollHorizontal ?
					this.calculateDragDistance(parseInt(this.getScrollLeft(), 10), (-1*(e.pageX-this.prevX)), this.leftBoundary, this.rightBoundary) :
					this.getScrollLeft();
				this.scrollTop = this.scrollVertical ?
					this.calculateDragDistance(this.getScrollTop(), (-1*(e.pageY-this.prevY)), this.topBoundary, this.bottomBoundary) :
					this.getScrollTop();
				// apply new scroll values
				this.effectScroll();
				this.scroll();
				// save values for next drag
				this.prevY = e.pageY;
				this.prevX = e.pageX;
				this.resetBoundaryX();
				this.resetBoundaryY();
			}
		},

		/** 
		* Calculates how far the drag should go, based on pointer movement (delta).
		*
		* @private
		*/
		calculateDragDistance: function (currentPosition, delta, aBoundary, bBoundary) {
			var newPosition = currentPosition + delta;
			return this.overscrollDragDamping(currentPosition, newPosition,delta,aBoundary,bBoundary);
		},
		
		/** 
		* Provides resistance against dragging into overscroll region.
		*
		* @private
		*/
		overscrollDragDamping: function (currentPosition, newPosition, delta, aBoundary, bBoundary) {
			if(newPosition < aBoundary || newPosition*-1 < bBoundary) {
				delta /= 2;
				newPosition = currentPosition + delta;
			}
			return newPosition;
		},

		/**
		* @private
		*/
		resetBoundaryX: function () {
			this.boundaryX = 0;
		},

		/**
		* @private
		*/
		resetBoundaryY: function () {
			this.boundaryY = 0;
		},
		
		/**
		* When user releases the drag, sets `this.dragging` to `false`, bounces overflow back, and 
		* hides scrim.
		*
		* @private
		*/
		dragfinish: function (sender, e) {
			if (this.dragging) {
				e.preventTap();
				this.dragging = false;
				if(!this.isScrolling()) {
					this.correctOverflow();
				}
				if (this.scrim) {
					this.$.scrim.hide();
				}
			}
		},
		
		/**
		* Bounces back from overscroll region.
		*
		* @private
		*/
		correctOverflow: function () {
			if(this.isInOverScroll()) {
				var x = (this.scrollHorizontal) ? this.correctOverflowX() : false;
				var y = (this.scrollVertical) ? this.correctOverflowY() : false;
				if(x !== false && y !== false) {
					this.scrollLeft = (x !== false) ? x : this.getScrollLeft();
					this.scrollTop = (y !== false) ? y : this.getScrollTop();
					this.startOverflowScrolling();
				} else if(x !== false) {
					this.scrollLeft = x;
					this.scrollTop = this.targetScrollTop || this.scrollTop;
					this.targetScrollLeft = this.getScrollLeft();
					if(!this.vertical) {
						this.startOverflowScrolling();
					} else {
						this.startScrolling();
					}
				} else if(y !== false) {
					this.scrollTop = y;
					this.scrollLeft = this.targetScrollLeft || this.scrollLeft;
					this.targetScrollTop = this.getScrollTop();
					if(!this.scrollHorizontal) {
						this.startOverflowScrolling();
					} else {
						this.startScrolling();
					}
				}
			}
		},
		
		/**
		* Determines whether we're overscrolled on the x-axis; if so, returns proper edge value.
		*
		* @private
		*/
		correctOverflowX: function () {
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
		
		/**
		* Determines whether we're overscrolled on the y-axis; if so, returns proper edge value.
		*
		* @private
		*/
		correctOverflowY: function () {
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
		
		/**
		* If we've crossed the determined delta, bounce back.
		*
		* @private
		*/
		beyondBoundary: function (current, boundary, max) {
			return (Math.abs(Math.abs(boundary) - Math.abs(current)) > Math.abs(max));
		},
		
		/**
		* When user flicks/throws [scroller]{@link enyo.Scroller}, calculates the distance to be 
		* travelled and where we will end up in the overscroll region.
		*
		* @private
		*/
		flick: function (sender, e) {
			if(this.dragging && this.flickOnEnabledAxis(e)) {
				this.scrollLeft = this.scrollHorizontal ? this.calculateFlickDistance(this.scrollLeft, -1*e.xVelocity) : this.getScrollLeft();
				this.scrollTop = this.scrollVertical ? this.calculateFlickDistance(this.scrollTop, -1*e.yVelocity) : this.getScrollTop();
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

		/**
		* @private
		*/
		flickOnEnabledAxis: function (e) {
			return Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.scrollHorizontal : this.scrollVertical;
		},

		/**
		* @private
		*/
		calculateFlickDistance: function (currentPosition, flickVelocity) {
			return (currentPosition + (flickVelocity * this.kFlickScalar));
		},
		
		/**
		* Applies the "scroll" transition, applies new transform based on `x` and `y`, and begins
		* interval to update the `scrollTop/scrollLeft` values while scrolling.
		*
		* @private
		*/
		startScrolling: function () {
			this.applyTransition("scroll");
			this.effectScroll();
			this.setCSSTransitionInterval();
			this.scrolling = true;
		},
		
		/**
		* Applies the "bounce" transition, applies new transform based on `x` and `y`, and begins
		* interval to update the `scrollTop/scrollLeft` values while scrolling.
		*
		* @private
		*/
		startOverflowScrolling: function () {
			this.applyTransition("bounce");
			this.effectScroll();
			this.setOverflowTransitionInterval();
			this.scrolling = true;
		},
		
		/**
		* Applies the given transition to `this.$.client`.
		*
		* @private
		*/
		applyTransition: function (which) {
			this.$.client.applyStyle("-webkit-transition", this.transitions[which]);
		},
		
		/**
		* Turns off CSS transition and clears `this.scrollInterval`.
		*
		* @private
		*/
		stopScrolling: function () {
			this.resetCSSTranslationVals();
			this.clearCSSTransitionInterval();
			this.scrolling = false;
		},
		
		/**
		* Creates an interval to update the `x` and `y` values while scrolling is happening,
		* check for crossing into the overflow region, and bubble a scroll {@glossary event}.
		*
		* @private
		*/
		setCSSTransitionInterval: function () {
			this.clearCSSTransitionInterval();
			this.scrollInterval = setInterval(this.bindSafely(function() {
				this.updateScrollPosition();
				this.correctOverflow();
			}), this.scrollIntervalMS);
		},

		/**
		* Creates an interval to update the `x` and `y` values while scrolling is happening,
		* and bubble a scroll {@glossary event}. (We don't need to check for crossing into
		* the overflow area since we're there already.)
		*
		* @private
		*/
		setOverflowTransitionInterval: function () {
			this.clearCSSTransitionInterval();
			this.scrollInterval = setInterval(this.bindSafely(function() {
				this.updateScrollPosition();
			}), this.scrollIntervalMS);
		},
		
		/**
		* Saves current `x` and `y` position and bubbles scroll {@glossary event}.
		*
		* @private
		*/
		updateScrollPosition: function () {
			var yChanged = this.updateY();
			var xChanged = this.updateX();
			this.scroll();
			if(!yChanged && !xChanged) {
				this.stop();
			}
		},
		
		/** 
		* Clears `this.scrollInterval`.
		*
		* @private
		*/
		clearCSSTransitionInterval: function () {
			if(this.scrollInterval) {
				clearInterval(this.scrollInterval);
				this.scrollInterval = null;
			}
		},
		
		/**
		* Sets scroller translation to current position and turns transition off.
		* This effectively stops scrolling.
		*
		* @private
		*/
		resetCSSTranslationVals: function () {
			var prop = enyo.dom.getCssTransformProp();
			var transformStyle = window.getComputedStyle(this.$.client.node,null).getPropertyValue(prop).split('(')[1].split(')')[0].split(',');
			this.applyTransition("none");
			this.scrollLeft = -1*transformStyle[4];
			this.scrollTop = -1*transformStyle[5];
			this.effectScroll();
		},

		/**
		* Calculates how far into the overscroll region we should go before bouncing back.
		*
		* @private
		*/
		figureBoundary: function (target) {
			var absTarget = Math.abs(target);
			var retVal = absTarget - absTarget/Math.pow(absTarget,0.02);
			retVal = target < 0 ? -1*retVal : retVal;
			return retVal;
		},

		/**
		* When transition animation is complete, checks whether we need to bounce back from
		* overscroll region. If not, stops.
		* 
		* @private
		*/
		transitionComplete: function (sender, e) {
			// Only process transition complete if sent from this container
			if(e.originator !== this.$.client) {
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
		
		/** 
		* Scrolls to a specific position within the scroll area.
		*
		* @param {Number} x - The `x` position in pixels.
		* @param {Number} y - The `y` position in pixels.
		* @public
		*/
		scrollTo: function (x, y) {
			this.setScrollTop(y);
			this.setScrollLeft(x);
			this.start();
		},
		
		/**
		* Retrieves the overscroll boundaries of the [scroller]{@link enyo.Scroller}.
		*
		* @returns {enyo.Scroller~OverscrollBoundaryObject} An [object]{@glossary Object}
		*	describing the overscroll boundaries.
		* @public
		*/
		getOverScrollBounds: function () {
			return {
				overleft: Math.min(this.leftBoundary + this.scrollLeft, 0) || Math.max(this.rightBoundary + this.scrollLeft, 0),
				overtop: Math.min(this.topBoundary + this.scrollTop, 0) || Math.max(this.bottomBoundary + this.scrollTop, 0)
			};
		}
	});

})(enyo, this);

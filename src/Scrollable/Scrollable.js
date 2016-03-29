/**
* Exports the {@link module:enyo/Scrollable~Scrollable} mixin.
*
* @wip
* @public
* @module enyo/Scrollable
*/

var
	kind = require('../kind'),
	utils = require('../utils'),
	dom = require('../dom'),
	dispatcher = require('../dispatcher');

var
	Control = require('../Control'),
	EventEmitter = require('../EventEmitter'),
	ScrollMath = require('../ScrollMath');

var blockOptions = {
	start: true,
	end: true,
	nearest: true,
	farthest: true
};

function calcNodeVisibility (nodePos, nodeSize, scrollPos, scrollSize) {
	return (nodePos >= scrollPos && nodePos + nodeSize <= scrollPos + scrollSize)
		? 0
		: nodePos - scrollPos > 0
			? 1
			: nodePos - scrollPos < 0
				? -1
				: 0;
}

/**
* Mix scrolling support into any Control that contains content suitable for scrolling.
*
* @mixin
* @wip
* @public
*/
var Scrollable = {
	
	/**
	* @private
	*/
	name: 'Scrollable',

	/**
	* An array of control definitions that will be instatiated with the scroller. Each object
	* will be passed a `scroller` property that contains a reference to the scroller. The controls
	* can register to receive scroll events from the scroller.
	*
	* @name scrollControls
	* @type {Object[]}
	* @default undefined
	* @see module:enyo/NewThumb~NewThumb
	* @public
	* @memberof module:enyo/Scrollable~Scrollable
	*/

	/**
	* Specifies how to horizontally scroll.  Acceptable values are `'scroll'`, `'auto'`,
	* `'hidden'`, and `'default'`. The precise effect of the setting is determined by the
	* scroll strategy.
	* 
	* @type {String}
	* @default 'default'
	* @public
	*/
	horizontal: 'default',

	/**
	* Specifies how to vertically scroll.  Acceptable values are `'scroll'`, `'auto'`,
	* `'hidden'`, and `'default'`. The precise effect of the setting is determined by the
	* scroll strategy.
	* 
	* @type {String}
	* @default 'default'
	* @public
	*/
	vertical: 'default',

	/**
	* The vertical scroll position.
	* 
	* @type {Number}
	* @default 0
	* @public
	*/
	scrollTop: 0,

	/**
	* The horizontal scroll position.
	* 
	* @type {Number}
	* @default 0
	* @public
	*/
	scrollLeft: 0,

	/**
	* Vestige of previous implementation -- should be eliminated and
	* does not appear to be referenced, but leaving here for the moment
	* to avoid accidental breakage.
	*
	* @private
	*/
	maxHeight: null,

	/**
	* Vestige of previous implementation -- should be eliminated, but
	* currently still referenced.
	*
	* @private
	*/
	touch: true,

	/**
	* TODO: Document. Based on CSSOM View spec ().
	* Options: 'smooth', 'instant', maybe 'auto'
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @type {String}
	* @default 'smooth'
	* @public
	*/
	behavior: 'smooth',

	/**
	* TODO: Document. Based on CSSOM View spec (), but modified to add 'nearest' and
	* 'farthest' to the possible values.
	* Options: 'start', 'end', 'nearest', 'farthest'
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @type {String}
	* @default 'nearest'
	* @public
	*/
	block: 'farthest',

	/**
	* Vestige of previous implementation -- should be eliminated and
	* does not appear to be referenced, but leaving here for the moment
	* to avoid accidental breakage.
	*
	* @private
	*/
	thumb: true,

	/**
	* If `true`, mouse wheel may be used to move the [scrollable]{@link module:enyo/Scrollable~Scrollable} control.
	* 
	* @type {Boolean}
	* @default true
	* @public
	*/
	useMouseWheel: true,

	/**
	* This should ultimately be made public, but not sure it's fully baked so
	* holding off for now.
	*
	* @private
	*/
	horizontalSnapIncrement: null,

	/**
	* This should ultimately be made public, but not sure it's fully baked so
	* holding off for now.
	*
	* @private
	*/
	verticalSnapIncrement: null,

	/**
	* This should ultimately be made public, but not sure it's fully baked so
	* holding off for now.
	*
	* @private
	*/
	suppressMouseEvents: false,

	/**
	* By default, {@link module:enyo/Scrollable~Scrollable} creates and
	* uses a default instance of {@link module:enyo/ScrollMath~ScrollMath}, which
	* is responsible for scroll physics.
	*
	* If you want to customize scroll physics, you can provide an object literal
	* to the `scrollMath` property that will be used to create a 
	* {@link module:enyo/ScrollMath~ScrollMath} instance to your specifications.
	* Make sure to include `kind: ScrollMath` in your object literal, along with
	* whatever `ScrollMath` properties you want to set.
	*
	* @type {Object}
	* @public
	*/
	scrollMath: {kind: ScrollMath},

	/**
	* This should ultimately be made public, but not sure it's fully baked so
	* holding off for now.
	*
	* @private
	*/
	pageMultiplier: 1,

	/**
	* @private
	*/
	canScrollX: false,
	/**
	* @private
	*/
	canScrollY: false,
	/**
	* @private
	*/
	couldScrollX: false,
	/**
	* @private
	*/
	couldScrollY: false,
	/**
	* @private
	*/
	canScrollUp: false,
	/**
	* @private
	*/
	canScrollDown: false,
	/**
	* @private
	*/
	canScrollLeft: false,
	/**
	* @private
	*/
	canScrollRight: false,

	/**
	* @private
	*/
	velocity: 0,

	/**
	* @private
	*/
	topOffset: 0,
	/**
	* @private
	*/
	rightOffset: 0,
	/**
	* @private
	*/
	bottomOffset: 0,
	/**
	* @private
	*/
	leftOffset: 0,

	/**
	* @private
	*/
	mixins: [EventEmitter],

	/**
	* @private
	*/
	handlers: {
		ondragstart: 'dragstart',
		ondragfinish: 'dragfinish',
		ondrag: 'drag',
		onflick: 'flick',
		ondown: 'down',
		onmove: 'move',
		onmousewheel: 'mousewheel',
		onscroll: 'domScroll',
		onScroll: 'scroll',
		onScrollStart: 'scrollStart',
		onScrollStop: 'scrollStop',
		onShouldDrag: 'shouldDrag',
		onStabilize: 'scroll'
	},

	events: {
		onScrollStart: '',
		onScroll: '',
		onScrollStop: '',
		onShouldDrag: ''
	},

	/**
	* @private
	*/
	classes: 'enyo-scrollable enyo-fill',

	/**
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);

			var smc = [ utils.mixin(utils.clone(this.scrollMath), {name: 'scrollMath'}) ],
				defProps = this.defaultProps;

			this.defaultProps = {};
			this.accessibilityPreventScroll = true;
			
			this.createComponents(smc, {isChrome: true, owner: this});
			if (this.scrollControls) {
				this.createComponents(this.scrollControls, {isChrome: true, scroller: this});
			}

			this.defaultProps = defProps;
		};
	}),

	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this._suppressing) {
				this._resumeMouseEvents();
			}
		};
	}),

	/**
	* @private
	*/
	showingChangedHandler: kind.inherit(function (sup) {
		return function (sender, event) {
			// Calculate boundaries when shown, just in case
			// anything has happened (like scroller contents changing)
			// while we were hidden. We do this unconditionally since
			// it's cheap to do it now and we avoid a lot of extra
			// complexity by not trying to track whether we need it.
			// May need to revisit this decision if related issues
			// arise.
			if (event.showing) {
				this.calcBoundaries();
			}
			sup.apply(this, arguments);
			if (!event.showing && this._suppressing) {
				this._resumeMouseEvents();
			}
		};
	}),

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.calcScrollNode();
			this.calcBoundaries();
		};
	}),

	/**
	* @private
	*/
	horizontalSnapIncrementChanged: function() {
		this.$.scrollMath.xSnapIncrement = this.horizontalSnapIncrement;
	},
	
	/**
	* @private
	*/
	verticalSnapIncrementChanged: function() {
		this.$.scrollMath.ySnapIncrement = this.verticalSnapIncrement;
	},
	
	/**
	* @private
	*/
	horizontalChanged: function () {
		var hEnabled = (this.hEnabled = (this.horizontal !== 'hidden'));
		this.$.scrollMath.horizontal = hEnabled;
		this.addRemoveClass('h-enabled', hEnabled);
		this.emit('scrollabilityChanged');
	},

	/**
	* @private
	*/
	verticalChanged: function () {
		var vEnabled = (this.vEnabled = (this.vertical !== 'hidden'));
		this.$.scrollMath.vertical = vEnabled;
		this.addRemoveClass('v-enabled', vEnabled);
		this.emit('scrollabilityChanged');
	},

	/**
	* @private
	*/
	scrollTopChanged: function() {
		this.$.scrollMath.setScrollY(-this.scrollTop);
	},

	/**
	* @private
	*/
	scrollLeftChanged: function() {
		this.$.scrollMath.setScrollX(-this.scrollLeft);
	},

	/**
	* TODO: Document. Based on CSSOM View spec ()
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @public
	*/
	scrollTo: function(x, y, opts) {
		opts = opts || {};
		opts.behavior = opts.behavior || this.behavior;
		this.$.scrollMath.scrollTo(x, y, opts);
	},

	/** 
	* Leaving for legacy support; should use scrollToChild() instead
	*
	* @deprecated
	* @public
	*/
	scrollToControl: function (control, opts) {
		this.scrollToChild(control, opts);
	},

	/**
	* Helper function for `scrollToChild()`
	* 
	* May be overridden as needed by more specific implementations. This
	* API is to be considered experimental and subject to change -- use at
	* your own risk.
	*
	* @protected
	*/
	getChildOffsets: kind.inherit(function (sup) {
		if (sup === utils.nop) {
			return function (child, scrollBounds) {
				var node = (child instanceof Control) ? child.hasNode() : child,
					offsets  = dom.getAbsoluteBounds(node),
					viewportBounds = dom.getAbsoluteBounds(this.scrollNode);

				offsets.right = document.body.offsetWidth - offsets.right;
				viewportBounds.right = document.body.offsetWidth - viewportBounds.right;

				// Make absolute controlBounds relative to scroll position
				offsets.top += scrollBounds.top;
				if (this.rtl) {
					offsets.right += scrollBounds.left;
				} else {
					offsets.left += scrollBounds.left;
				}

				offsets.top = offsets.top - viewportBounds.top;
				offsets.left = (this.rtl ? offsets.right : offsets.left) - (this.rtl ? viewportBounds.right : viewportBounds.left);

				offsets.getMargin = function (side) {
					return dom.getComputedBoxValue(node, 'margin', side);
				};

				return offsets;
			};
		}
		else {
			return sup;
		}
	}),

	/**
	* Helper function for `scrollToChild()`
	*
	* @private
	*/
	getTargetCoordinates: function (scrollBounds, offsets, opts) {
		var block,
			xDir,
			yDir,
			x,
			y;

		if (typeof opts === 'boolean') {
			block = opts ? 'start' : 'end';
		}
		else if (typeof opts === 'object' && blockOptions[opts.block]) {
			block = opts.block;
		}
		else {
			block = this.block;
		}

		// 0: currently visible, 1: right of viewport, -1: left of viewport
		xDir = calcNodeVisibility(offsets.left, offsets.width, scrollBounds.left, scrollBounds.clientWidth);
			// 0: currently visible, 1: below viewport, -1: above viewport
		yDir = calcNodeVisibility(offsets.top, offsets.height, scrollBounds.top, scrollBounds.clientHeight);
		// If we're already scrolling and the direction the node is in is not the same as the direction we're scrolling,
		// we need to recalculate based on where the scroller will end up, not where it is now. This is to handle the
		// case where the node is currently visible but won't be once the scroller settles.
		//
		// NOTE: Currently setting block = 'nearest' whenever we make this correction to avoid some nasty jumpiness
		// when 5-way moving horizontally in a vertically scrolling grid layout in Moonstone. Not sure this is the
		// right fix.
		if (this.isScrolling) {
			if (this.xDir !== xDir) {
				scrollBounds.left = this.destX;
				xDir = calcNodeVisibility(offsets.left, offsets.width, scrollBounds.left, scrollBounds.clientWidth);
				block = 'nearest';
			}
			if (this.yDir !== yDir) {
				scrollBounds.top = this.destY;
				yDir = calcNodeVisibility(offsets.top, offsets.height, scrollBounds.top, scrollBounds.clientHeight);
				block = 'nearest';
			}
		}

		switch (xDir) {
			case 0:
				x = this.scrollLeft;
				break;
			case 1:
				// If control requested to be scrolled all the way to the viewport's left, or if the control
				// is larger than the viewport, scroll to the control's left edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'start' || offsets.width > scrollBounds.clientWidth) {
					x = offsets.left;
				} else {
					x = offsets.left - scrollBounds.clientWidth + offsets.width;
					// If nodeStyle exists, add the _marginRight_ to the scroll value.
					x += offsets.getMargin('right');
				}
				break;
			case -1:
				// If control requested to be scrolled all the way to the viewport's right, or if the control
				// is larger than the viewport, scroll to the control's right edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'end' || offsets.width > scrollBounds.clientWidth) {
					x = offsets.left - scrollBounds.clientWidth + offsets.width;
				} else {
					x = offsets.left;
					// If nodeStyle exists, subtract the _marginLeft_ from the scroll value.
					x -= offsets.getMargin('left');
				}
				break;
		}

		switch (yDir) {
			case 0:
				y = this.scrollTop;
				break;
			case 1:
				// If control requested to be scrolled all the way to the viewport's top, or if the control
				// is larger than the viewport, scroll to the control's top edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'start' || offsets.height > scrollBounds.clientHeight) {
					y = offsets.top;
					// If nodeStyle exists, subtract the _marginTop_ from the scroll value.
					y -= offsets.getMargin('top');
				} else {
					y = offsets.top - scrollBounds.clientHeight + offsets.height;
					// If nodeStyle exists, add the _marginBottom_ to the scroll value.
					y += offsets.getMargin('bottom');
				}
				break;
			case -1:
				// If control requested to be scrolled all the way to the viewport's bottom, or if the control
				// is larger than the viewport, scroll to the control's bottom edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'end' || offsets.height > scrollBounds.clientHeight) {
					y = offsets.top - scrollBounds.clientHeight + offsets.height;
				} else {
					y = offsets.top;
					// If nodeStyle exists, subtract the _marginBottom_ from the scroll value.
					y -= offsets.getMargin('bottom');
				}
				break;
		}

		return {x: x, y: y, xDir: xDir, yDir: yDir};
	},

	/**
	* Helper function for `scrollToChild()`
	* 
	* May be overridden as needed by more specific implementations. This
	* API is to be considered experimental and subject to change -- use at
	* your own risk.
	*
	* @protected
	*/
	scrollToTarget: kind.inherit(function (sup) {
		if (sup === utils.nop) {
			return function (child, targetCoordinates, opts) {
				this.scrollTo(targetCoordinates.x, targetCoordinates.y, opts);
			};
		}
		else {
			return sup;
		}
	}),

	/**
	* TODO: Document. Based on CSSOM View spec ()
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @public
	*/
	scrollToChild: function(child, opts) {
		var scrollBounds = this.getScrollBounds(),
			offsets = this.getChildOffsets(child, scrollBounds),
			coordinates = this.getTargetCoordinates(scrollBounds, offsets, opts);

		this.scrollToTarget(child, coordinates, opts);
	},

	/**
	* @public
	*/
	pageUp: function() {
		this.paginate('up');
	},

	/**
	* @public
	*/
	pageDown: function() {
		this.paginate('down');
	},

	/**
	* @public
	*/
	pageLeft: function() {
		this.paginate('left');
	},

	/**
	* @public
	*/
	pageRight: function() {
		this.paginate('right');
	},

	/**
	* Stops any active scroll movement.
	*
	* @param {Boolean} emit - Whether or not to fire the `onScrollStop` event.
	* @public
	*/
	stop: function () {
		var m = this.$.scrollMath;

		if (m.isScrolling()) {
			m.stop(true);
		}
	},

	/**
	* @private
	*/
	paginate: function(direction) {
		var b = this.calcBoundaries(),
			scrollYDelta = b.clientHeight * this.pageMultiplier,
			scrollXDelta = b.clientWidth * this.pageMultiplier,
			x = this.scrollLeft,
			y = this.scrollTop;

		switch (direction) {
		case 'left':
			x -= scrollXDelta;
			break;
		case 'up':
			y -= scrollYDelta;
			break;
		case 'right':
			x += scrollXDelta;
			break;
		case 'down':
			y += scrollYDelta;
			break;
		}

		x = Math.max(0, Math.min(x, b.maxLeft));
		y = Math.max(0, Math.min(y, b.maxTop));

		this.scrollTo(x, y);
	},

	/**
	/* @private
	*/
	mousewheel: function (sender, e) {
		if (this.useMouseWheel) {
			 if (!this.$.scrollMath.isScrolling()) {
			 	this.calcBoundaries();
			 }

			// TODO: Change this after newMousewheel becomes mousewheel
			if (this.$.scrollMath.newMousewheel(e, {rtl: this.rtl})) {
				e.preventDefault();
				return true;
			}
		}
	},

	/**
	* @private
	*/
	down: function (sender, e) {
		var m = this.$.scrollMath;

		if (m.isScrolling() && !m.isInOverScroll() && !this.isScrollControl(e.originator)) {
			this.stop(true);
			e.preventTap();
		}
		this.calcStartInfo();
	},

	/**
	* @private
	*/
	dragstart: function (sender, e) {
		if (this.touch) {
			this.calcBoundaries();
			// Ignore drags sent from multi-touch events
			if(!this.dragDuringGesture && e.srcEvent.touches && e.srcEvent.touches.length > 1) {
				return true;
			}
			// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
			this.doShouldDrag(e);
			this.dragging = (e.dragger == this || (!e.dragger && e.boundaryDragger == this));
			if (this.dragging) {
				if(this.preventDefault){
					e.preventDefault();
				}
				// note: needed because show/hide changes
				// the position so sync'ing is required when
				// dragging begins (needed because show/hide does not trigger onscroll)
				//this.syncScrollMath();
				this.$.scrollMath.startDrag(e);
				if (this.preventDragPropagation) {
					return true;
				}
			}
		}
	},

	/**
	* @private
	*/
	drag: function (sender, e) {
		if (this.touch) {
			if (this.dragging) {
				if(this.preventDefault){
					e.preventDefault();
				}
				this.$.scrollMath.drag(e);
			}
		}
	},
	
	/**
	* @private
	*/
	dragfinish: function (sender, e) {
		if (this.touch) {
			if (this.dragging) {
				e.preventTap();
				this.$.scrollMath.dragFinish();
				this.dragging = false;
			}
		}
	},

	/**
	* @private
	*/
	flick: function (sender, e) {
		if (this.touch) {
			var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
			if (onAxis && this.dragging) {
				this.$.scrollMath.flick(e);
				return this.preventDragPropagation;
			}
		}
	},

	/**
	* @private
	*/
	shouldDrag: function (sender, e) {
		//this.calcAutoScrolling();
		var requestV = e.vertical,
			// canH = this.$.scrollMath.horizontal && !requestV,
			// canV = this.$.scrollMath.vertical && requestV,
			canH = this.$.scrollMath.canScrollX() && !requestV,
			canV = this.$.scrollMath.canScrollY() && requestV,
			down = e.dy < 0,
			right = e.dx < 0,
			oobV = (!down && this.startEdges.top || down && this.startEdges.bottom),
			oobH = (!right && this.startEdges.left || right && this.startEdges.right);
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

	stabilize: function() {
		this.$.scrollMath.stabilize();
	},

	/**
	* @private
	*/
	scroll: kind.inherit(function (sup) {
		return function(sender, event) {
			var px = this.scrollLeft,
				py = this.scrollTop,
				pv = this.velocity,
				x = this.scrollLeft = -sender.x,
				y = this.scrollTop = -sender.y,
				dx = px - x,
				dy = py - y,
				v = (dx * dx) + (dy * dy);
			this.xDir = (dx < 0? 1: dx > 0? -1: 0);
			this.yDir = (dy < 0? 1: dy > 0? -1: 0);
			this.velocity = v;
			this.acc = v > pv;
			this.dec = v < pv;
			this.destX = -sender.endX;
			this.destY = -sender.endY;
			this.updateScrollability(x, y);
			// Experimental: suppress and resume mouse events
			// based on veclocity and acceleration
			this._manageMouseEvents();
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	updateScrollability: function(x, y) {
		var m = this.$.scrollMath,
			b = -m.bottomBoundary,
			r = -m.rightBoundary,
			c = (this.canScrollX !== this.couldScrollX) ||
				(this.canScrollY !== this.couldScrollY);

		if (this.canScrollY || this.couldScrollY) {
			this.set('yPosRatio', y / b);

			if (this.canScrollUp) {
				if (y <= 0) {
					this.canScrollUp = false;
					c = true;
				}
			}
			else {
				if (y > 0) {
					this.canScrollUp = true;
					c = true;
				}
			}
			if (this.canScrollDown) {
				if (y >= b) {
					this.canScrollDown = false;
					c = true;
				}
			}
			else {
				if (y < b) {
					this.canScrollDown = true;
					c = true;
				}
			}
		}

		if (this.canScrollX || this.couldScrollX) {
			this.set('xPosRatio', x / r);

			if (this.canScrollLeft) {
				if (x <= 0) {
					this.canScrollLeft = false;
					c = true;
				}
			}
			else {
				if (x > 0) {
					this.canScrollLeft = true;
					c = true;
				}
			}
			if (this.canScrollRight) {
				if (x >= r) {
					this.canScrollRight = false;
					c = true;
				}
			}
			else {
				if (x < r) {
					this.canScrollRight = true;
					c = true;
				}
			}
		}

		this.couldScrollX = this.canScrollX;
		this.couldScrollY = this.canScrollY;

		if (c) {
			this.emit('scrollabilityChanged');
		}
	},

	/**
	* @private
	*/
	scrollStart: function () {
		this.calcBoundaries();
		this.isScrolling = true;
		this.emit('stateChanged');
	},
	/**
	* @private
	*/
	scrollStop: function () {
		// TODO: Leaving this in to be safe...
		// But we should already have resumed, due to
		// velocity-sensitive logic in scroll().
		// This whole scheme probably needs bullet-proofing.
		if (!this.touch) {
			this._resumeMouseEvents();
		}
		this.isScrolling = false;
		this.emit('stateChanged');
	},
	/**
	* @private
	*/
	_manageMouseEvents: function () {
		// TODO: Experiment, make configurable
		var t = 5,
			v = this.velocity;

		if (this._suppressing) {
			if (this.dec && v < t) {
				this._resumeMouseEvents();
			}
		}
		// TODO: Can probably allow suppressing events when this.touch === true
		// if we resume events on down so we can capture flicks and drags. Need
		// to experiment.
		else if (this.suppressMouseEvents && !this.touch) {
			if (this.isScrolling && this.acc && v > t) {
				this._suppressMouseEvents();
			}
		}
	},

	/**
	* @private
	*/
	_suppressMouseEvents: function () {
		// TODO: Create a dispatcher API for this
		dispatcher.stopListening(document, 'mouseover');
		dispatcher.stopListening(document, 'mouseout');
		dispatcher.stopListening(document, 'mousemove');
		this._suppressing = true;
	},

	/**
	* @private
	*/
	_resumeMouseEvents: function () {
		// TODO: Create a dispatcher API for this
		dispatcher.listen(document, 'mouseover');
		dispatcher.listen(document, 'mouseout');
		dispatcher.listen(document, 'mousemove');
		this._suppressing = false;
	},

	/**
	* @private
	*/
	getScrollBounds: function () {
		var s = this.getScrollSize(), cn = this.calcScrollNode();
		var b = {
			left: this.get('scrollLeft'),
			top: this.get('scrollTop'),
			clientHeight: cn ? cn.clientHeight : 0,
			clientWidth: cn ? cn.clientWidth : 0,
			height: s.height,
			width: s.width
		};
		b.maxLeft = Math.max(0, b.width - b.clientWidth);
		b.maxTop = Math.max(0, b.height - b.clientHeight);
		this.cachedBounds = b;
		return b;
	},

	/**
	* @private
	*/
	getScrollSize: function () {
		var n = this.calcScrollNode(),
			w = this.getScrollWidth && this.getScrollWidth() || (n ? n.scrollWidth : 0),
			h = this.getScrollHeight && this.getScrollHeight() || (n ? n.scrollHeight : 0);
		return {width: w, height: h};
	},

	/**
	* @private
	*/
	calcScrollNode: kind.inherit(function (sup) {
		return function() {
			return (this.scrollNode = sup.apply(this, arguments) || this.hasNode());
		};
	}),

	/**
	* @private
	*/
	calcStartInfo: function (bounds) {
		var sb = bounds || this.getScrollBounds(),
			y = this.scrollTop,
			x = this.scrollLeft;

		// this.canVertical = sb.maxTop > 0 && this.vertical !== 'hidden';
		// this.canHorizontal = sb.maxLeft > 0 && this.horizontal !== 'hidden';
		this.startEdges = {
			top: y === 0,
			bottom: y === sb.maxTop,
			left: x === 0,
			right: x === sb.maxLeft
		};
	},

	/**
	* @private
	*/
	calcBoundaries: function (bounds) {
		var m = this.$.scrollMath,
			b = bounds || this.getScrollBounds(),
			width = b.width,
			height = b.height,
			clWidth = b.clientWidth,
			clHeight = b.clientHeight,
			rBound = clWidth - width,
			bBound = clHeight - height,
			xRatio = Math.min(1, clWidth / width),
			yRatio = Math.min(1, clHeight / height),
			cTop = Math.min(b.top, Math.max(0, -bBound)),
			cLeft = Math.min(b.left, Math.max(0, -rBound));

		m.rightBoundary = rBound;
		m.bottomBoundary = bBound;

		this.set('canScrollX', m.canScrollX());
		this.set('canScrollY', m.canScrollY());

		if (b.top !== cTop || b.left !== cLeft) {
			b.left = cLeft;
			b.top = cTop;
			m.setScrollX(-cLeft);
			m.setScrollY(-cTop);
			this.scroll(m);
			this.stop();
		}

		this.set('xSizeRatio', xRatio);
		this.set('ySizeRatio', yRatio);

		this.updateScrollability(cLeft, cTop);

		return b;
	},

	// xSizeRatioChanged: function() {
	// 	this.emit('metricsChanged', this.xSizeRatio);
	// },

	// ySizeRatioChanged: function() {
	// 	this.emit('metricsChanged', this.ySizeRatio);
	// },

	xPosRatioChanged: function() {
		this.emit('metricsChanged', this.xPosRatio);
	},

	yPosRatioChanged: function() {
		this.emit('metricsChanged', this.yPosRatio);
	},

	// canScrollXChanged: function() {
	// 	this.emit('scrollabilityChanged');
	// },

	// canScrollYChanged: function() {
	// 	this.emit('scrollabilityChanged');
	// }

	/**
	* Returns `true` if `control` is a scrolling child of this
	* scrollable (an element within the Scrollable's scrolling
	* region).
	*
	* (Currently, we assume that any child of the Scrollable that
	* is not a scroll control is a scrolling child, but this
	* is an implementation detail and could change if we
	* determine that there's a more appropriate way to test.)
	* 
	* Returns `false` if `control` is one of the Scrollable's
	* scroll controls, or if `control` is not a child of the
	* Scrollable at all.
	*
	* @param {module:enyo/Control~Control} control - The control to be tested
	* @protected
	*/
	isScrollingChild: function (control) {
		var c = control;

		while (c && c !== this) {
			if (c.scroller === this) {
				return false;
			}
			c = c.parent;
		}

		return c === this;
	},

	/**
	* Returns `true` if `control` is one of the Scrollable's
	* scroll controls.
	*
	* @param {module:enyo/Control~Control} control - The control to be tested
	* @protected
	*/
	isScrollControl: function (control) {
		var c = control;

		while (c && c !== this) {
			if (c.scroller === this) {
				return true;
			}
			c = c.parent;
		}

		return false;
	}
};

module.exports = Scrollable;

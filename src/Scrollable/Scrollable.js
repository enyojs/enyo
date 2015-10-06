var
	kind = require('../kind'),
	utils = require('../utils'),
	dom = require('../dom'),
	dispatcher = require('../dispatcher');

var
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
* Doc
*
* @module enyo/Scrollable
* @public
*/
module.exports = {
	
	/**
	* @private
	*/
	name: 'Scrollable',
	
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
	* Maximum height of the scroll content.
	* 
	* @type {Number}
	* @default null
	* @memberof module:enyo/Scroller~Scroller.prototype
	* @public
	*/
	maxHeight: null,

	/**
	* Set to `true` to make this [scroller]{@link module:enyo/Scroller~Scroller} select a 
	* platform-appropriate touch-based scrolling strategy. Note that if you specify a value 
	* for [strategyKind]{@link module:enyo/Scroller~Scroller#strategyKind}, that will take precedence over
	* this setting.
	* 
	* @type {Boolean}
	* @default false
	* @public
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
	* Set to `true` to display a scroll thumb in touch [scrollers]{@link module:enyo/Scroller~Scroller}.
	* 
	* @type {Boolean}
	* @default true
	* @public
	*/
	thumb: true,

	/**
	* If `true`, mouse wheel may be used to move the [scroller]{@link module:enyo/Scroller~Scroller}.
	* 
	* @type {Boolean}
	* @default true
	* @public
	*/
	useMouseWheel: true,

	/**
	* TODO: Document
	* Experimental
	*
	* @public
	*/
	horizontalSnapIncrement: null,

	/**
	* TODO: Document
	* Experimental
	*
	* @public
	*/
	verticalSnapIncrement: null,

	/**
	* TODO: Document
	* Experimental
	*
	* @public
	*/
	suppressMouseEvents: false,

	scrollMath: {kind: ScrollMath},

	pageMultiplier: 1,

	canScrollX: false,
	canScrollY: false,
	couldScrollX: false,
	couldScrollY: false,
	canScrollUp: false,
	canScrollDown: false,
	canScrollLeft: false,
	canScrollRight: false,

	velocity: 0,

	topOffset: 0,
	rightOffset: 0,
	bottomOffset: 0,
	leftOffset: 0,

	mixins: [EventEmitter],

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

	classes: 'enyo-scrollable enyo-fill',

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

	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this._suppressing) {
				this._resumeMouseEvents();
			}
		};
	}),

	showingChangedHandler: kind.inherit(function (sup) {
		return function (sender, event) {
			sup.apply(this, arguments);
			if (!event.showing && this._suppressing) {
				this._resumeMouseEvents();
			}
		};
	}),

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
	* TODO: Document. Based on CSSOM View spec ()
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @public
	*/
	scrollToControl: function (control, opts) {
		var n = control.hasNode();

		if (n) {
			this.scrollToNode(n, opts);
		}
	},

	/**
	* TODO: Document. Based on CSSOM View spec ()
	* @see {@linkplain http://dev.w3.org/csswg/cssom-view/}
	* @see {@linkplain https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
	*
	* @public
	*/
	scrollToNode: function(node, opts) {
		var nodeBounds  = dom.getAbsoluteBounds(node),
			absoluteBounds = dom.getAbsoluteBounds(this.scrollNode),
			scrollBounds   = this.getScrollBounds(),
			docWidth = document.body.offsetWidth,
			block,
			offsetTop,
			offsetLeft,
			offsetHeight,
			offsetWidth,
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


		// For the calculations below, we want the `right` bound
		// to be relative to the document's right edge, not its
		// left edge, so we adjust it now
		nodeBounds.right = docWidth - nodeBounds.right;
		absoluteBounds.right = docWidth - absoluteBounds.right;

		// Make absolute controlBounds relative to scroll position
		nodeBounds.top += scrollBounds.top;
		if (this.rtl) {
			nodeBounds.right += scrollBounds.left;
		} else {
			nodeBounds.left += scrollBounds.left;
		}

		offsetTop      = nodeBounds.top - absoluteBounds.top;
		offsetLeft     = (this.rtl ? nodeBounds.right : nodeBounds.left) - (this.rtl ? absoluteBounds.right : absoluteBounds.left);
		offsetHeight   = nodeBounds.height;
		offsetWidth    = nodeBounds.width;

		// 0: currently visible, 1: right of viewport, -1: left of viewport
		xDir = calcNodeVisibility(offsetLeft, offsetWidth, scrollBounds.left, scrollBounds.clientWidth);
			// 0: currently visible, 1: below viewport, -1: above viewport
		yDir = calcNodeVisibility(offsetTop, offsetHeight, scrollBounds.top, scrollBounds.clientHeight);
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
				xDir = calcNodeVisibility(offsetLeft, offsetWidth, scrollBounds.left, scrollBounds.clientWidth);
				block = 'nearest';
			}
			if (this.yDir !== yDir) {
				scrollBounds.top = this.destY;
				yDir = calcNodeVisibility(offsetTop, offsetHeight, scrollBounds.top, scrollBounds.clientHeight);
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
				if (block === 'farthest' || block === 'start' || offsetWidth > scrollBounds.clientWidth) {
					x = offsetLeft;
				} else {
					x = offsetLeft - scrollBounds.clientWidth + offsetWidth;
					// If nodeStyle exists, add the _marginRight_ to the scroll value.
					x += dom.getComputedBoxValue(node, 'margin', 'right');
				}
				break;
			case -1:
				// If control requested to be scrolled all the way to the viewport's right, or if the control
				// is larger than the viewport, scroll to the control's right edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'end' || offsetWidth > scrollBounds.clientWidth) {
					x = offsetLeft - scrollBounds.clientWidth + offsetWidth;
				} else {
					x = offsetLeft;
					// If nodeStyle exists, subtract the _marginLeft_ from the scroll value.
					x -= dom.getComputedBoxValue(node, 'margin', 'left');
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
				if (block === 'farthest' || block === 'start' || offsetHeight > scrollBounds.clientHeight) {
					y = offsetTop;
					// If nodeStyle exists, subtract the _marginTop_ from the scroll value.
					y -= dom.getComputedBoxValue(node, 'margin', 'top');
				} else {
					y = offsetTop - scrollBounds.clientHeight + offsetHeight;
					// If nodeStyle exists, add the _marginBottom_ to the scroll value.
					y += dom.getComputedBoxValue(node, 'margin', 'bottom');
				}
				break;
			case -1:
				// If control requested to be scrolled all the way to the viewport's bottom, or if the control
				// is larger than the viewport, scroll to the control's bottom edge. Otherwise, scroll just
				// far enough to get the control into view.
				if (block === 'farthest' || block === 'end' || offsetHeight > scrollBounds.clientHeight) {
					y = offsetTop - scrollBounds.clientHeight + offsetHeight;
				} else {
					y = offsetTop;
					// If nodeStyle exists, subtract the _marginBottom_ from the scroll value.
					y -= dom.getComputedBoxValue(node, 'margin', 'bottom');
				}
				break;
		}

		// If x or y changed, scroll to new position
		if (x !== this.scrollLeft || y !== this.scrollTop) {
			this.scrollTo(x, y, opts);
		}
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

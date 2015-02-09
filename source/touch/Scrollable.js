(function (enyo, scope) {

	/**
	* Doc
	*
	* @mixin enyo.Scrollable
	* @public
	*/
	enyo.Scrollable = {
		
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
		* @memberof enyo.Scroller.prototype
		* @public
		*/
		maxHeight: null,

		/**
		* Set to `true` to make this [scroller]{@link enyo.Scroller} select a 
		* platform-appropriate touch-based scrolling strategy. Note that if you specify a value 
		* for [strategyKind]{@link enyo.Scroller#strategyKind}, that will take precedence over
		* this setting.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		touch: true,

		/**
		* Set to `true` to display a scroll thumb in touch [scrollers]{@link enyo.Scroller}.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		thumb: true,

		/**
		* If `true`, mouse wheel may be used to move the [scroller]{@link enyo.Scroller}.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		useMouseWheel: true,

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
			onShouldDrag: 'shouldDrag'
		},

		events: {
			onScrollStart: '',
			onScroll: '',
			onScrollStop: '',
			onShouldDrag: ''
		},

		classes: 'enyo-scroller enyo-touch-strategy-container enyo-fill',

		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.createChrome([{
					kind: 'enyo.ScrollMath',
					// Have to do this for DataRepeater (and possibly others).
					// Is there a better way?
					owner: this
				}]);
			};
		}),

		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.calcScrollNode();
			};
		}),

		/**
		* @private
		*/
		horizontalChanged: function () {
			this.$.scrollMath.horizontal = (this.horizontal != 'hidden');
		},

		/**
		* @private
		*/
		verticalChanged: function () {
			this.$.scrollMath.vertical = (this.vertical != 'hidden');
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
		* @public
		*/
		scrollTo: function(x, y) {
			this.$.scrollMath.scrollTo(x, y);
		},

		/**
		* Stops any active scroll movement.
		*
		* @param {Boolean} emit - Whether or not to fire the `onScrollStop` event.
		* @public
		*/
		stop: function (emit) {
			var m = this.$.scrollMath;

			if (m.isScrolling()) {
				m.stop(emit);
			}
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
				if (this.$.scrollMath.newMousewheel(e)) {
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

			if (m.isScrolling() && !m.isInOverScroll()) {
				this.stop(true);
				e.preventTap();
			}
			this.calcStartInfo();
		},

		/**
		* @private
		*/
		dragstart: function (sender, e) {
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
		},

		/**
		* @private
		*/
		drag: function (sender, e) {
			if (this.dragging) {
				if(this.preventDefault){
					e.preventDefault();
				}
				this.$.scrollMath.drag(e);
			}
		},
		
		/**
		* @private
		*/
		dragfinish: function (sender, e) {
			if (this.dragging) {
				e.preventTap();
				this.$.scrollMath.dragFinish();
				this.dragging = false;
			}
		},

		/**
		* @private
		*/
		flick: function (sender, e) {
			var onAxis = Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
			if (onAxis && this.dragging) {
				this.$.scrollMath.flick(e);
				return this.preventDragPropagation;
			}
		},

		/**
		* @private
		*/
		shouldDrag: function (sender, e) {
			//this.calcAutoScrolling();
			var requestV = e.vertical,
				canH = this.$.scrollMath.horizontal && !requestV,
				canV = this.$.scrollMath.vertical && requestV,
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

		/**
		* @private
		*/
		scroll: enyo.inherit(function (sup) {
			return function(sender, event) {
				var px = this.scrollLeft,
					py = this.scrollTop,
					x = this.scrollLeft = -sender.x,
					y = this.scrollTop = -sender.y,
					dx = px - x,
					dy = py - y,
					// TODO: Use d to enable / disable mouse events based on velocity
					d = (dx * dx) + (dy + dy);
				this.xDir = (dx < 0? 1: dx > 0? -1: 0);
				this.yDir = (dy < 0? 1: dy > 0? -1: 0);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		scrollStart: function () {
			if (!this.touch) {
				this.suppressMouseEvents();
			}

			// if (this.scrollNode && !this.isScrolling()) {
			// 	this.scrolling = true;
			// 	if (!this.isOverscrolling()) {
					this.calcBoundaries();
			// 	}
			// }
		},

		/**
		* @private
		*/
		scrollStop: function () {
			if (!this.touch) {
				this.resumeMouseEvents();
			}
		},

		/**
		* @private
		*/
		suppressMouseEvents: function() {
			// TODO: Create a dispatcher API for this
			enyo.dispatcher.stopListening(document, 'mouseover');
			enyo.dispatcher.stopListening(document, 'mouseout');
			enyo.dispatcher.stopListening(document, 'mousemove');
		},

		/**
		* @private
		*/
		resumeMouseEvents: function(event) {
			// TODO: Create a dispatcher API for this
			enyo.dispatcher.listen(document, 'mouseover');
			enyo.dispatcher.listen(document, 'mouseout');
			enyo.dispatcher.listen(document, 'mousemove');
		},

		/**
		* @private
		*/
		getScrollBounds: function () {
			var s = this.getScrollSize(), cn = this.scrollNode;
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
			var n = this.scrollNode,
				w = this.getScrollWidth && this.getScrollWidth() || (n ? n.scrollWidth : 0),
				h = this.getScrollHeight && this.getScrollHeight() || (n ? n.scrollHeight : 0);
			return {width: w, height: h};
		},

		/**
		* @private
		*/
		calcScrollNode: enyo.inherit(function (sup) {
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

			this.canVertical = sb.maxTop > 0 && this.vertical !== 'hidden';
			this.canHorizontal = sb.maxLeft > 0 && this.horizontal !== 'hidden';
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
				b = bounds || this.getScrollBounds();

			m.bottomBoundary = b.clientHeight - b.height;
			m.rightBoundary = b.clientWidth - b.width;

			return b;
		}

	};
	
})(enyo, this);

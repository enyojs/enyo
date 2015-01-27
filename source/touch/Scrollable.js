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
		touch: false,

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
			onScrollStop: 'scrollStop'
		},

		events: {
			onScrollStart: '',
			onScroll: '',
			onScrollStop: ''
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
				//this.addClass('enyo-scroller');
				//this.addClass('enyo-touch-strategy-container');
			};
		}),

		/**
		* @public
		*/
		scrollTo: function(x, y) {
			this.$.scrollMath.scrollTo(x, y);
		},

		/**
		* @private
		*/
		xmousewheel: function (sender, e) {
			this.$.scrollMath.mousewheel(e);
			e.preventDefault();
			return true;
/*			if (!this.dragging && this.useMouseWheel) {
				this.calcBoundaries();
				//this.syncScrollMath();
				//this.stabilize();
				if (this.$.scrollMath.mousewheel(e) || true) {
					e.preventDefault();
					return true;
				} else this.log('hey!');
			}
*/		},

		scrollWheelMultiplier: 2,
		scrollWheelPageMultiplier: 0.2,
		/**
		* On `mousewheel` event, scrolls a fixed amount.
		*
		* @private
		*/
		mousewheel: function(sender, event) {
			if (this.useMouseWheel) {
				var isScrolling = this.$.scrollMath.isScrolling(),//this.isScrolling();
					sb = this.cachedBounds ? this.cachedBounds : this._getScrollBounds();
				//this.scrollBounds = this._getScrollBounds();
				//this.setupBounds();

				var x = null,
					y = null,
					showVertical = true,//this.showVertical(),
					showHorizontal = false,//this.showHorizontal(),
					dir = null,
					val = null,
					max = null,
					delta = null
				;

				//* If we don't have to scroll, allow mousewheel event to bubble
				if (!showVertical && !showHorizontal) {
					//this.scrollBounds = null;
					return false;
				}

				if (showVertical) {
					dir = event.wheelDeltaY >= 0 ? 1 : -1;
					val = Math.abs(event.wheelDeltaY * this.scrollWheelMultiplier);
					max = sb.clientHeight * this.scrollWheelPageMultiplier;
					delta = Math.min(val, max);
					this.lastScrollToY = y = (isScrolling ? this.lastScrollToY : this.scrollTop) + -dir * delta;
				}

				if (showHorizontal) {
					var intDirection = 1;
					// Reverse the direction for RTL
					// if (this.$.pageLeftControl.rtl) {
					// 	intDirection = -1;
					// }
					if (event.wheelDeltaX) {
						dir = (event.wheelDeltaX >= 0 ? 1 : -1) * intDirection;
						val = Math.abs(event.wheelDeltaX * this.scrollWheelMultiplier);
						max = sb.clientWidth * this.scrollWheelPageMultiplier;
						delta = Math.min(val, max);
						this.lastScrollToX = x = (isScrolling ? this.lastScrollToX : this.scrollLeft) + -dir * delta;
					} else if (!showVertical) {
						// only use vertical wheel for horizontal scrolling when no vertical bars shown
						dir = (event.wheelDeltaY >= 0 ? 1 : -1) * intDirection;
						val = Math.abs(event.wheelDeltaY * this.scrollWheelMultiplier);
						max = sb.clientWidth * this.scrollWheelPageMultiplier;
						delta = Math.min(val, max);
						this.lastScrollToX = x = (isScrolling ? this.lastScrollToX : this.scrollLeft) + -dir * delta;
					}
				}

				this.scrollTo(x, y);
				event.preventDefault();
				//this.scrollBounds = null;
				return true;
			}
		},



		dragstart: function (sender, e) {
			this.log(e);
			this.calcBoundaries();
			// Ignore drags sent from multi-touch events
			if(!this.dragDuringGesture && e.srcEvent.touches && e.srcEvent.touches.length > 1) {
				return true;
			}
			// note: allow drags to propagate to parent scrollers via data returned in the shouldDrag event.
			//this.doShouldDrag(e);
			this.dragging = true; // (e.dragger == this || (!e.dragger && e.boundaryDragger == this));
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
			// if the list is doing a reorder, don't scroll
			/*if(this.listReordering) {
				return false;
			}*/
			this.log(this.dragging, e);
			if (this.dragging) {
				if(this.preventDefault){
					e.preventDefault();
				}
				this.$.scrollMath.drag(e);
				/*if (this.scrim) {
					this.$.scrim.show();
				}*/
			}
		},
		
		dragfinish: function (sender, e) {
			if (this.dragging) {
				e.preventTap();
				this.$.scrollMath.dragFinish();
				this.dragging = false;
				/*if (this.scrim) {
					this.$.scrim.hide();
				}*/
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

		scroll: enyo.inherit(function (sup) {
			return function(sender, event) {
				var px = this.scrollLeft,
					py = this.scrollTop,
					x = this.scrollLeft = -sender.x,
					y = this.scrollTop = -sender.y,
					dx = px - x,
					dy = py - y;
				this.xDir = (dx < 0? 1: dx > 0? -1: 0);
				this.yDir = (dy < 0? 1: dy > 0? -1: 0);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		scrollStart: function () {
			this.log();
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
		_getScrollBounds: function () {
			var s = this.getScrollSize(), cn = this.hasNode();
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
			var n = this.hasNode(),
				w = this.getScrollWidth ? this.getScrollWidth() : (n ? n.ScrollWidth : 0),
				h = this.getScrollHeight ? this.getScrollHeight() : (n ? n.ScrollHeight : 0);
			return {width: w, height: h};
		},

		/**
		* @private
		*/
		calcBoundaries: function () {
			var s = this.$.scrollMath || this, b = this._getScrollBounds();
			s.bottomBoundary = b.clientHeight - b.height;
			s.rightBoundary = b.clientWidth - b.width;
		}

	};
	
})(enyo, this);

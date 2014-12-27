(function (enyo, scope) {
	/**
	* Fires when dragging has started, allowing drags to propagate to parent
	* [scrollers]{@link enyo.Scroller}.
	*
	* @event enyo.TouchScrollStrategy#onShouldDrag
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing
	*	event information.
	* @private
	*/

	/**
	* {@link enyo.TouchScrollStrategy} is a helper [kind]{@glossary kind} for implementing a
	* touch-based [scroller]{@link enyo.Scroller}. It integrates the scrolling simulation provided
	* by {@link enyo.ScrollMath} into an `enyo.Scroller`.
	*
	* `enyo.TouchScrollStrategy` is not typically created in application code. Instead, it is
	* specified as the value of the [strategyKind]{@link enyo.Scroller#strategyKind} property
	* of an `enyo.Scroller` or {@link enyo.List}, or is used by the framework implicitly.
	*
	* @class enyo.TouchScrollStrategy
	* @extends enyo.ScrollStrategy
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.TouchScrollStrategy.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.TouchScrollStrategy',

		/**
		* @private
		*/
		kind: 'enyo.ScrollStrategy',

		/**
			If `true` (the default), the scroller will overscroll and bounce back at the edges.
		*/
		overscroll: true,

		/**
			If `true` (the default), the scroller will not propagate `dragstart`
			events that cause it to start scrolling.
		*/
		preventDragPropagation: true,

		/**
		* @private
		*/
		published:
			/** @lends enyo.TouchScrollStrategy.prototype */ {

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
			* Set to `true` to display a scroll thumb.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			thumb: true,

			/**
			* Set to `true` to display a transparent overlay while scrolling. This can help improve
			* performance of complex, large scroll regions on some platforms (e.g., Android).
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			scrim: false,

			/**
			* Indicates whether to allow drag [events]{@glossary event} to be sent while gesture
			* events are happening simultaneously.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			dragDuringGesture: true,

			/**
			* Facades animation time step from [ScrollMath]{@link enyo.ScrollMath}.
			*
			* @type {Number}
			* @default 20
			* @public
			*/
			interval: 20,

			/**
			* Facades animation interval type from [ScrollMath]{@link enyo.ScrollMath}.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			fixedTime: true,

			/**
			* Facades one unit of time for simulation from [ScrollMath]{@link enyo.ScrollMath}.
			*
			* @type {Number}
			* @default 10
			* @public
			*/
			frame: 10,

			/**
			* Indicates whether default [events]{@glossary event} (e.g., native scrolling
			* events) should be suppressed.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			preventDefault: true
		},

		/**
		* @private
		*/
		events: {
			onShouldDrag: ''
		},

		/**
		* @private
		*/
		handlers: {
			onflick: 'flick',
			onShouldDrag: 'shouldDrag',
			ondrag: 'drag'
		},

		/**
		* @private
		*/
		tools: [
			{kind: 'ScrollMath', onScrollStart: 'scrollMathStart', onScroll: 'scrollMathScroll', onScrollStop: 'scrollMathStop', onStabilize: 'scrollMathStabilize'},
			{name: 'vthumb', kind: 'ScrollThumb', axis: 'v', showing: false},
			{name: 'hthumb', kind: 'ScrollThumb', axis: 'h', showing: false}
		],

		/**
		* @private
		*/
		scrimTools: [{name: 'scrim', classes: 'enyo-fit', style: 'z-index: 1;', showing: false}],

		/**
		* @private
		*/
		components: [
			{name: 'client', classes: 'enyo-touch-scroller'}
		],

		/**
		* Flag indicating whether the list is currently reordering.
		*
		* @readonly
		* @public
		*/
		listReordering: false,

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.transform = enyo.dom.canTransform();
				if(!this.transform) {
					if(this.overscroll) {
						//so we can adjust top/left if browser can't handle translations
						this.$.client.applyStyle('position', 'relative');
					}
				}
				this.accel = enyo.dom.canAccelerate();
				var containerClasses = 'enyo-touch-strategy-container';
				// note: needed for ios to avoid incorrect clipping of thumb
				// and need to avoid on Android as it causes problems hiding the thumb
				if (enyo.platform.ios && this.accel) {
					containerClasses += ' enyo-composite';
				}
				this.scrimChanged();
				this.intervalChanged();
				this.fixedTimeChanged();
				this.frameChanged();
				this.container.addClass(containerClasses);
				this.translation = this.accel ? 'translate3d' : 'translate';
			};
		}),

		/**
		* @method
		* @private
		*/
		initComponents: enyo.inherit(function (sup) {
			return function() {
				this.createChrome(this.tools);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				this.container.removeClass('enyo-touch-strategy-container');
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.makeBubble(this.$.client, 'scroll');
				this.calcBoundaries();
				this.syncScrollMath();
				if (this.thumb) {
					this.alertThumbs();
				}
			};
		}),

		/**
		* @private
		*/
		scrimChanged: function () {
			if (this.scrim && !this.$.scrim) {
				this.makeScrim();
			}
			if (!this.scrim && this.$.scrim) {
				this.$.scrim.destroy();
			}
		},

		/**
		* @private
		*/
		makeScrim: function () {
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

		/**
		* Determines whether or not the scroller is actively moving.
		*
		* @return {Boolean} `true` if actively moving; otherwise, `false`.
		* @public
		*/
		isScrolling: function () {
			var m = this.$.scrollMath;
			return m ? m.isScrolling() : this.scrolling;
		},

		/**
		* Determines whether or not the scroller is in overscroll.
		*
		* @return {Boolean} `true` if in overscroll; otherwise, `false`.
		* @public
		*/
		isOverscrolling: function () {
			var m = this.$.scrollMath || this;
			return (this.overscroll) ? Boolean(m.isInOverScroll()) : false;
		},

		/**
		* @private
		*/
		domScroll: function () {
			if (!this.isScrolling()) {
				this.calcBoundaries();
				this.syncScrollMath();
				if (this.thumb) {
					this.alertThumbs();
				}
			}
		},

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
		maxHeightChanged: function () {
			this.$.client.applyStyle('max-height', this.maxHeight);
			// note: previously used enyo-fit here but IE would reset scroll position when the scroll thumb
			// was hidden; in general IE resets scrollTop when there are 2 abs position siblings, one has
			// scrollTop and the other is hidden.
			this.$.client.addRemoveClass('enyo-scrollee-fit', !this.maxHeight);
		},

		/**
		* @private
		*/
		thumbChanged: function () {
			this.hideThumbs();
		},

		/**
		* @private
		*/
		intervalChanged: function () {
			if (this.$.scrollMath) {
				this.$.scrollMath.interval = this.interval;
			}
		},

		/**
		* @private
		*/
		fixedTimeChanged: function () {
			if (this.$.scrollMath) {
				this.$.scrollMath.fixedTime = this.fixedTime;
			}
		},

		/**
		* @private
		*/
		frameChanged: function () {
			if (this.$.scrollMath) {
				this.$.scrollMath.frame = this.frame;
			}
		},

		/**
		* Stops any active scroll movement.
		*
		* @todo Doc update made while merging, need official documentation update!
		*
		* @param {Boolean} emit - Whether or not to fire the `onScrollStop` event.
		* @public
		*/
		stop: function (emit) {
			if (this.isScrolling()) {
				this.$.scrollMath.stop(emit);
			}
		},

		/**
		* Adjusts the scroll position to be valid, if necessary (e.g., after the scroll contents
		* have changed).
		*
		* @public
		*/
		stabilize: function () {
			if(this.$.scrollMath) {
				this.$.scrollMath.stabilize();
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
			this.stop(true);
			this.$.scrollMath.scrollTo(x, y || y === 0 ? y : null);
		},

		/**
		* Scrolls the given [control]{@link enyo.Control} into view.
		*
		* @param {enyo.Control} ctl - The [control]{@link enyo.Control} to make visible in the
		*	[scroller's]{@link enyo.Scroller} viewport.
		* @param {Boolean} alignWithTop - If `true`, the node is aligned with the top of the
		*	scroller.
		* @method
		* @public
		*/
		scrollIntoView: enyo.inherit(function (sup) {
			return function() {
				this.stop(true);
				sup.apply(this, arguments);
			};
		}),

		/**
		* Sets the horizontal scroll position.
		*
		* @param {Number} left - The horizontal scroll position in pixels.
		* @method
		* @public
		*/
		setScrollLeft: enyo.inherit(function (sup) {
			return function() {
				this.stop(true);
				sup.apply(this, arguments);
			};
		}),

		/**
		* Sets the vertical scroll position.
		*
		* @param {Number} top - The vertical scroll position in pixels.
		* @method
		* @public
		*/
		setScrollTop: enyo.inherit(function (sup) {
			return function(top) {
				this.stop(true);
				sup.apply(this, arguments);
			};
		}),

		/**
		* Retrieves the horizontal scroll position.
		*
		* @returns {Number} The horizontal scroll position in pixels.
		* @method
		* @public
		*/
		getScrollLeft: enyo.inherit(function (sup) {
			return function() {
				return this.isScrolling() ? this.scrollLeft : sup.apply(this, arguments);
			};
		}),

		/**
		* Retrieves the vertical scroll position.
		*
		* @returns {Number} The vertical scroll position in pixels.
		* @method
		* @private
		*/
		getScrollTop: enyo.inherit(function (sup) {
			return function() {
				return this.isScrolling() ? this.scrollTop : sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		calcScrollNode: function () {
			return this.$.client.hasNode();
		},

		/**
		* @private
		*/
		calcAutoScrolling: function () {
			var v = (this.vertical == 'auto');
			var h = (this.horizontal == 'auto') || (this.horizontal == 'default');
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

		/**
		* @private
		*/
		shouldDrag: function (sender, e) {
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
		down: enyo.inherit(function (sup) {
			return function (sender, e) {
				if (!this.isOverscrolling()) {
					sup.apply(this, arguments);
				}
			};
		}),

		/**
		* @private
		*/
		move: function (sender, e) {
		},

		// Special synthetic DOM events served up by the Gesture system

		/**
		* @fires enyo.TouchScrollStrategy#onShouldDrag
		* @private
		*/
		dragstart: function (sender, e) {
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
				this.syncScrollMath();
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
			if(this.listReordering) {
				return false;
			}
			if (this.dragging) {
				if(this.preventDefault){
					e.preventDefault();
				}
				this.$.scrollMath.drag(e);
				if (this.scrim) {
					this.$.scrim.show();
				}
			}
		},
		dragfinish: function (sender, e) {
			if (this.dragging) {
				e.preventTap();
				this.$.scrollMath.dragFinish();
				this.dragging = false;
				if (this.scrim) {
					this.$.scrim.hide();
				}
			}
		},

		/**
		* @private
		*/
		mousewheel: function (sender, e) {
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

		/**
		* @private
		*/
		scrollMathStart: function () {
			if (this.scrollNode && !this.isScrolling()) {
				this.scrolling = true;
				if (!this.isOverscrolling()) {
					this.calcBoundaries();
				}
			}
		},

		/**
		* @private
		*/
		scrollMathScroll: function (sender) {
			if(!this.overscroll) {
				//don't overscroll past edges
				this.effectScroll(-Math.min(sender.leftBoundary, Math.max(sender.rightBoundary, sender.x)),
						-Math.min(sender.topBoundary, Math.max(sender.bottomBoundary, sender.y)));
			} else {
				this.effectScroll(-sender.x, -sender.y);
			}
			if (this.thumb) {
				this.showThumbs();
				this.delayHideThumbs(100);
			}
		},

		/**
		* @private
		*/
		scrollMathStop: function () {
			this.scrolling = false;
			this.effectScrollStop();
			if (this.thumb) {
				this.delayHideThumbs(100);
			}
		},

		/**
		* @private
		*/
		scrollMathStabilize: function (sender) {
			this.effectScroll(-sender.x, -sender.y);
			if (this.thumb) {
				this.showThumbs();
				this.delayHideThumbs(100);
			}
			return true;
		},

		/**
		* @private
		*/
		calcBoundaries: function () {
			var s = this.$.scrollMath || this, b = this._getScrollBounds();
			s.bottomBoundary = b.clientHeight - b.height;
			s.rightBoundary = b.clientWidth - b.width;
		},

		/**
		* @private
		*/
		syncScrollMath: function () {
			var m = this.$.scrollMath;
			if(m) {
				m.setScrollX(-this.getScrollLeft());
				m.setScrollY(-this.getScrollTop());
			}
		},

		/**
		* @private
		*/
		effectScroll: function (x, y) {
			if (this.scrollNode) {
				this.scrollLeft = this.scrollNode.scrollLeft = x;
				this.scrollTop = this.scrollNode.scrollTop = y;
				this.effectOverscroll(x !== null? Math.round(x): x, y !== null? Math.round(y): y);
			}
		},

		/**
		* @private
		*/
		effectScrollStop: function () {
			this.effectOverscroll(null, null);
		},

		/**
		* @private
		*/
		effectOverscroll: function (x, y) {
			var n = this.scrollNode;
			var xt = '0', yt = '0', zt = this.accel ? ',0' : '';
			if (y !== null && Math.abs(y - n.scrollTop) > 1) {
				yt = (n.scrollTop - y);
			}
			if (x !== null && Math.abs(x - n.scrollLeft) > 1) {
				xt = (n.scrollLeft - x);
			}
			if(!this.transform) {
				//adjust top/left if browser can't handle translations
				this.$.client.setBounds({left:xt + 'px', top:yt + 'px'});
			} else {
				enyo.dom.transformValue(this.$.client, this.translation, xt + 'px, ' + yt + 'px' + zt);
			}
		},

		/**
		* Retrieves the overscroll boundaries of the [scroller]{@link enyo.Scroller}.
		*
		* @returns {enyo.Scroller~OverscrollBoundaryObject} An [object]{@glossary Object}
		*	describing the overscroll boundaries.
		* @public
		*/
		getOverScrollBounds: function () {
			var m = this.$.scrollMath || this;
			return {
				overleft: Math.min(m.leftBoundary - m.x, 0) || Math.max(m.rightBoundary - m.x, 0),
				overtop: Math.min(m.topBoundary - m.y, 0) || Math.max(m.bottomBoundary - m.y, 0)
			};
		},

		/**
		* @method
		* @private
		*/
		_getScrollBounds: enyo.inherit(function (sup) {
			return function() {
				var r = sup.apply(this, arguments);
				enyo.mixin(r, this.getOverScrollBounds());
				return r;
			};
		}),

		/**
		* Retrieves the scroll boundaries of the [scroller]{@link enyo.Scroller}.
		*
		* @returns {enyo.Scroller~BoundaryObject} An [object]{@glossary Object} describing the
		*	scroll boundaries.
		* @method
		* @public
		*/
		getScrollBounds: enyo.inherit(function (sup) {
			return function() {
				this.stop(true);
				return sup.apply(this, arguments);
			};
		}),

		/**
		* This method exists primarily to support an internal use case for
		* [enyo.DataList]{@link enyo.DataList}. It is intended to be called by the
		* [scroller]{@link enyo.Scroller} that owns this strategy.
		*
		* Triggers a remeasurement of the scroller's metrics (specifically, the
		* size of its viewport, the size of its contents and the difference between
		* the two, which determines the extent to which the scroller may scroll).
		*
		* @public
		*/
		remeasure: function () {
			this.calcBoundaries();
			if (this.thumb) {
				this.syncThumbs();
			}
			this.stabilize();
		},

		/**
		* Displays the scroll indicators and sets the auto-hide timeout.
		*
		* @public
		*/
		alertThumbs: function () {
			this.showThumbs();
			this.delayHideThumbs(500);
		},

		/**
		* Syncs the vertical and horizontal scroll indicators.
		*
		* @public
		*/
		syncThumbs: function () {
			this.$.vthumb.sync(this);
			this.$.hthumb.sync(this);
		},
		updateThumbs: function () {
			this.$.vthumb.update(this);
			this.$.hthumb.update(this);
		},

		/**
		* Syncs and shows both the vertical and horizontal scroll indicators. We only sync after we
		* have checked if the vertical and/or horizontal scroll indicators are to be shown, so that
		* {@link enyo.ScrollThumb#update} accurately makes calculations when the indicators are
		* visible.
		*
		* @public
		*/
		showThumbs: function () {
			if (this.horizontal != 'hidden') {
				this.$.hthumb.show();
			}
			if (this.vertical != 'hidden') {
				this.$.vthumb.show();
			}
			this.syncThumbs();
		},

		/**
		* Hides the vertical and horizontal scroll indicators.
		*
		* @public
		*/
		hideThumbs: function () {
			this.$.vthumb.hide();
			this.$.hthumb.hide();
		},

		/**
		* Hides the vertical and horizontal scroll indicators asynchronously.
		*
		* @public
		*/
		delayHideThumbs: function (delay) {
			this.$.vthumb.delayHide(delay);
			this.$.hthumb.delayHide(delay);
		}
	});

})(enyo, this);

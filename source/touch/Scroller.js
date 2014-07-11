(function (enyo, scope) {
	/**
	* An [object]{@link enyo.Object} representing the scroll boundaries.
	*
	* @typedef {Object} enyo.Scroller~BoundaryObject
	* @property {Number} left The left scroll position.
	* @property {Number} top The top scroll position.
	* @property {Number} maxLeft Maximum value for the left scroll position (minimum is always 0).
	* @property {Number} maxTop Maximum value for the top scroll position (minimum is always 0).
	* @property {Number} clientHeight The vertical size of the [scroller]{@link enyo.Scroller} on
	*	screen.
	* @property {Number} clientWidth The horizontal size of the [scroller]{@link enyo.Scroller} on
	*	screen.
	* @property {Number} width The horizontal size of the full area of the scrolled region.
	* @property {Number} height The vertical size of the full area of the scrolled region.
	* @property {Number} xDir Either 1, -1, or 0, indicating positive/negative movement along the 
	*	x-axis or none at all, respectively.
	* @property {Number} yDir Either 1, -1, or 0, indicating positive/negative movement along the
	*	y-axis or none at all, respectively.
	*/


	/**
	* An [object]{@link enyo.Object} representing the overscroll boundaries.
	*
	* @typedef {Object} enyo.Scroller~OverscrollBoundaryObject
	* @property {Number} overleft The left overscroll position.
	* @property {Number} overtop The top overscroll position.
	*/

	/**
	* The extended [event]{@link external:event} [object]{@link external:Object} that is provided 
	* when a scroll [event]{@link external:event} is fired.
	*
	* @typedef {Object} enyo.Scroller~ScrollEvent
	* @property {enyo.Scroller~BoundaryObject} bounds Current values of scroller bounds.
	*/

	/**
	* Fires when a scrolling action starts.
	*
	* @event enyo.Scroller#onScrollStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires while a scrolling action is in progress.
	*
	* @event enyo.Scroller#onScroll
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when a scrolling action stops.
	*
	* @event enyo.Scroller#onScrollStop
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Scroller_ is a scroller suitable for use in both desktop and mobile applications.
	* 
	* In some mobile environments, a default scrolling solution is not implemented for DOM elements.
	* In such cases, _enyo.Scroller_ implements a touch-based scrolling solution, which may be opted
	* into either globally (by setting 
	* [_enyo.Scroller.touchScrolling_]{@link enyo.Scroller#touchScrolling} to `true`) or on a 
	* per-instance basis (by specifying a [_strategyKind_]{@link enyo.Scroller#strategyKind} of 
	* `"TouchScrollStrategy"`).
	* 
	* For more information, see the documentation on
	* [Scrollers](building-apps/layout/scrollers.html) in the Enyo Developer Guide.
	*
	* @class enyo.Scroller
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Scroller.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Scroller',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Scroller.prototype */ {

			/**
			* Specifies how to horizontally scroll.  Acceptable values are 'scroll', 'auto', 
			* 'hidden' and 'default'. The precise effect of the setting is determined by the scroll 
			* strategy.
			* 
			* @type {String}
			* @default 'default'
			* @public
			*/
			horizontal: 'default',

			/**
			* Specifies how to vertically scroll.  Acceptable values are 'scroll', 'auto', 'hidden',
			* and 'default'. The precise effect of the setting is determined by the scroll strategy.
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
			* Maximum height of the scroll content
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
			* for [_strategyKind_]{@link enyo.Scroller#strategyKind}, that will take precedence over
			* this setting.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			touch: false,
			/**
			* Specifies a type of scrolling. The [scroller]{@link enyo.Scroller} will attempt to 
			* automatically select a strategy compatible with the runtime environment. Alternatively,
			* you may choose to use a specific strategy:
			* 
			* - [ScrollStrategy]{@link enyo.ScrollStrategy} is the default and implements no 
			*	scrolling, relying instead on the environment to scroll properly.
			* - [TouchScrollStrategy]{@link enyo.TouchScrollStrategy} implements a touch scrolling 
			*	mechanism.
			* - [TranslateScrollStrategy]{@link enyo.TranslateScrollStrategy} implements a touch 
			*	scrolling mechanism using translations; it is currently recommended only for Android
			*	3 and 4 & Windows Phone 8.
			* - [TransitionScrollStrategy]{@link enyo.TransitionScrollStrategy} implements a touch 
			*	scrolling mechanism using CSS transitions; it is currently recommended only for iOS 
			*	5 and later.
			*
			* @type {String}
			* @default 'ScrollStrategy'
			* @public
			*/
			strategyKind: 'ScrollStrategy',

			/**
			* Set to `true` to display a scroll thumb in touch [scrollers]{@link enyo.Scroller}.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			thumb: true,

			/**
			* Use mouse wheel to move [scroller]{@link enyo.Scroller}.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			useMouseWheel: true
		},

		/**
		* @private
		*/
		events: {
			onScrollStart: '',
			onScroll: '',
			onScrollStop: ''
		},

		/**
		* If `true`, globally enables touch scrolling.
		*
		* @name touchScrolling
		* @type {Boolean}
		* @default undefined
		* @memberof enyo.Scroller.prototype
		* @public
		*/

		/**
		* If `true` and a touch [scroller]{@link enyo.Scroller}, the [scroller]{@link enyo.Scroller}
		* will overscroll and bounce back at the edges.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		touchOverscroll: true,

		/**
		* If `true`, the [scroller]{@link enyo.Scroller} will not propagate _dragstart_ 
		* [events]{@link external:event} that cause it to start scrolling.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		preventDragPropagation: true,

		/**
		* If `true`, the [scroller]{@link enyo.Scroller} will not propagate scroll 
		* [events]{@link external:event}.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		preventScrollPropagation: true,

		/**
		* Needed to allow global mods to enyo.Scroller.touchScrolling
		* 
		* @private
		*/
		noDefer: true,

		/**
		* @private
		*/
		handlers: {
			onscroll: 'domScroll',
			onScrollStart: 'scrollStart',
			onScroll: 'scroll',
			onScrollStop: 'scrollStop'
		},

		/**
		* @private
		*/
		classes: 'enyo-scroller',

		/**
		* @private
		*/
		statics: {
			osInfo: [
				{os: 'android', version: 3},
				{os: 'androidChrome', version: 18},
				{os: 'androidFirefox', version: 16},
				{os: 'firefoxOS', version: 16},
				{os: 'ios', version: 5},
				{os: 'webos', version: 1e9},
				{os: 'blackberry', version:1e9},
				{os: 'tizen', version: 2}
			],
			//* Returns true if platform should have touch events.
			hasTouchScrolling: function() {
				for (var i=0, t; (t=this.osInfo[i]); i++) {
					if (enyo.platform[t.os]) {
						return true;
					}
				}
				// special detection for IE10+ on touch devices
				if ((enyo.platform.ie >= 10 || enyo.platform.windowsPhone >= 8) && enyo.platform.touch) {
					return true;
				}
			},
			/**
				Returns true if the platform has native div scrollers (desktop
				browsers always have them).
			*/
			hasNativeScrolling: function() {
				for (var i=0, t; (t=this.osInfo[i]); i++) {
					if (enyo.platform[t.os] < t.version) {
						return false;
					}
				}
				return true;
			},
			getTouchStrategy: function() {
				return (enyo.platform.android >= 3) || (enyo.platform.windowsPhone === 8) || (enyo.platform.webos >= 4)
					? 'TranslateScrollStrategy'
					: 'TouchScrollStrategy';
			}
		},

		/**
		* @private
		*/
		controlParentName: 'strategy',

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.horizontalChanged();
				this.verticalChanged();
				this.useMouseWheelChanged();
			};
		}),

		/**
		* @method
		* @private
		*/
		importProps: enyo.inherit(function (sup) {
			return function(inProps) {
				sup.apply(this, arguments);
				// allow global overriding of strategy kind
				if (inProps && inProps.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch)) {
					this.strategyKind = enyo.Scroller.getTouchStrategy();
				}
			};
		}),

		/**
		* @method
		* @private
		*/
		initComponents: enyo.inherit(function (sup) {
			return function() {
				this.strategyKindChanged();
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		teardownChildren: enyo.inherit(function (sup) {
			return function() {
				this.cacheScrollPosition();
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
				this.restoreScrollPosition();
			};
		}),

		/**
		* @private
		*/
		strategyKindChanged: function () {
			if (this.$.strategy) {
				this.$.strategy.destroy();
				this.controlParent = null;
			}
			// note: createComponents automatically updates controlParent.
			this.createStrategy();
			if (this.hasNode()) {
				this.render();
			}
		},

		/**
		* @private
		*/
		createStrategy: function () {
			this.createComponents([{name: 'strategy', maxHeight: this.maxHeight,
				kind: this.strategyKind, thumb: this.thumb,
				preventDragPropagation: this.preventDragPropagation,
				overscroll:this.touchOverscroll, isChrome: true}]);
		},

		/**
		* @private
		*/
		getStrategy: function () {
			return this.$.strategy;
		},

		/**
		* @private
		*/
		maxHeightChanged: function () {
			this.$.strategy.setMaxHeight(this.maxHeight);
		},

		/**
		* @method
		* @private
		*/
		showingChanged: enyo.inherit(function (sup) {
			return function() {
				if (!this.showing) {
					this.cacheScrollPosition(true);
				}
				sup.apply(this, arguments);
				if (this.showing) {
					this.restoreScrollPosition();
				}
			};
		}),

		/**
		* @private
		*/
		thumbChanged: function () {
			this.$.strategy.setThumb(this.thumb);
		},

		/**
		* Cache mechanism is necessary because scrollTop/scrollLeft aren't available when a DOM node
		* is hidden via `display:none`. They always return `0` and don't accept changes.
		* 
		* FIXME: need to know when parent is hidden, not just self
		* 
		* @private
		*/
		cacheScrollPosition: function (reset) {
			var cachedPosition = {left: this.getScrollLeft(), top: this.getScrollTop()};
			if (reset) {
				this.setScrollLeft(0);
				this.setScrollTop(0);
			}
			this.cachedPosition = cachedPosition;
		},

		/**
		* @private
		*/
		restoreScrollPosition: function () {
			if (this.cachedPosition) {
				var cp = this.cachedPosition;
				if (cp.top || cp.left) {
					this.cachedPosition = null;
					this.setScrollLeft(cp.left);
					this.setScrollTop(cp.top);
				}
			}
		},

		/**
		* @private
		*/
		horizontalChanged: function () {
			this.$.strategy.setHorizontal(this.horizontal);
		},

		/**
		* @private
		*/
		verticalChanged: function () {
			this.$.strategy.setVertical(this.vertical);
		},

		// FIXME: these properties are virtual; property changed methods are fired only if
		// property value changes, not if getter changes.
		
		/**
		* Set the horizontal scroll position.
		*
		* @param {Number} left The horizontal scroll position in pixels.
		* @public
		*/
		setScrollLeft: function (left) {
			this.scrollLeft = left;
			if (this.cachedPosition) {
				this.cachedPosition.left = left;
			}
			this.$.strategy.setScrollLeft(this.scrollLeft);
		},

		/**
		* Set the vertical scroll position.
		*
		* @param {Number} top The vertical scroll position in pixels.
		* @public
		*/
		setScrollTop: function (top) {
			this.scrollTop = top;
			if (this.cachedPosition) {
				this.cachedPosition.top = top;
			}
			this.$.strategy.setScrollTop(top);
		},

		/**
		* Retrieve the horizontal scroll position.
		*
		* @returns {Number} The horizontal scroll position in pixels.
		* @public
		*/
		getScrollLeft: function () {
			// sync our internal property
			this.scrollLeft = this.$.strategy.getScrollLeft();
			return this.scrollLeft;
		},

		/**
		* Retrieve the vertical scroll position.
		*
		* @returns {Number} The vertical scroll position in pixels.
		* @private
		*/
		getScrollTop: function () {
			// sync our internal property
			this.scrollTop = this.$.strategy.getScrollTop();
			return this.scrollTop;
		},

		/**
		* Retrieve the scroll boundaries of the [scroller]{@link enyo.Scroller}.
		* 
		* @returns {enyo.Scroller~BoundaryObject} An [object]{@link external:Object} describing the 
		*	scroll boundaries.
		* @public
		*/
		getScrollBounds: function () {
			var bounds  = this.$.strategy.getScrollBounds();
			if (
				(bounds.xDir !== -1 && bounds.xDir !== 0 && bounds.xDir !== 1) ||
				(bounds.yDir !== -1 && bounds.yDir !== 0 && bounds.yDir !== 1)
			) {
				this.decorateBounds(bounds);
			}
			// keep our properties synchronized always and without extra calls
			this.scrollTop  = bounds.top;
			this.scrollLeft = bounds.left;
			return bounds;
		},

		/**
		* Scrolls the given [control]{@link enyo.Control} into view.
		*
		* @param {enyo.Control} ctl The [control]{@link enyo.Control} to make visible in the 
		*	[scroller's]{@link enyo.Scroller} viewport.
		* @param {Boolean} alignWithTop If `true`, the node is aligned with the top of the
		*	[scroller]{@link enyo.Scroller}.
		* @public
		*/
		scrollIntoView: function (ctl, alignWithTop) {
			this.$.strategy.scrollIntoView(ctl, alignWithTop);
		},

		/** 
		* Scrolls to the position specified.
		*
		* @param {Number} x The _x_ position in pixels.
		* @param {Number} y The _y_ position in pixels.
		* @public
		*/
		scrollTo: function (x, y) {
			this.$.strategy.scrollTo(x, y);
		},

		/**
		* Ensures that the given [control]{@link enyo.Control} is visible in the 
		* [scroller's]{@link enyo.Scroller} viewport. Unlike 
		* [_scrollIntoView_]{@link enyo.Scroller#scrollIntoView}, which uses DOM's 
		* [_scrollIntoView_]{@link external:scrollIntoView}, this only affects the current 
		* [scroller]{@link enyo.Scroller}.
		*
		* @param {enyo.Control} ctl The [control]{@link enyo.Control} to make visible in the 
		*	[scroller's]{@link enyo.Scroller} viewport.
		* @param {Boolean} alignWithTop If `true`, the node is aligned with the top of the
		*	[scroller]{@link enyo.Scroller}.
		* @public
		*/
		scrollToControl: function (ctl, alignWithTop) {
			this.scrollToNode(ctl.hasNode(), alignWithTop);
		},

		/** 
		* Ensures that the given node is visible in the [scroller's]{@link enyo.Scroller} viewport.
		*
		* @param {Node} node The node to make visible in the [scroller's]{@link enyo.Scroller}
		*	viewport.
		* @param {Boolean} alignWithTop If `true`, the node is aligned with the top of the
		*	[scroller]{@link enyo.Scroller}.
		* @public
		*/
		scrollToNode: function (node, alignWithTop) {
			this.$.strategy.scrollToNode(node, alignWithTop);
		},

		/** 
		* Adds current values of getScrollBounds to [event]{@link external:event}.
		* 
		* @private
		*/
		decorateScrollEvent: function (e) {
			var bounds = e.scrollBounds = e.scrollBounds || this.$.strategy._getScrollBounds();
			// in the off chance that the event already had scrollBounds then we need
			// to make sure they are decorated
			if (
				(bounds.xDir !== -1 && bounds.xDir !== 0 && bounds.xDir !== 1) ||
				(bounds.yDir !== -1 && bounds.yDir !== 0 && bounds.yDir !== 1)
			) {
				this.decorateBounds(bounds);
			}
			// keep our properties synchronized always and without extra calls
			this.scrollTop  = bounds.top;
			this.scrollLeft = bounds.left;
		},

		/**
		* @private
		*/
		decorateBounds: function (bounds) {
			var x       = this.scrollLeft - bounds.left,
				y       = this.scrollTop  - bounds.top;
			bounds.xDir = (x < 0? 1: x > 0? -1: 0);
			bounds.yDir = (y < 0? 1: y > 0? -1: 0);
			// we update our current bounds properties so we don't have to unnecessarily
			// call getScrollTop/getScrollLeft because we already have the current data
			this.scrollLeft = bounds.left;
			this.scrollTop  = bounds.top;
		},

		/** 
		* Normalizes scroll [event]{@link external:event} to _onScroll_.
		*
		* @fires enyo.Scroller#event:onScroll
		* @private
		*/
		domScroll: function (sender, e) {
			// if a scroll event originated here, pass it to our strategy to handle
			if (this.$.strategy.domScroll && e.originator == this) {
				this.$.strategy.domScroll(sender, e);
			}
			this.decorateScrollEvent(e);
			this.doScroll(e);
			return true;
		},

		/**
		* @returns {Boolean} Returns `true` if the current scroll [event]{@link external:event} 
		*	should be stopped; `false` if it should be allowed to propagate.
		* @private
		*/
		shouldStopScrollEvent: function (e) {
			return (this.preventScrollPropagation &&
				e.originator.owner != this.$.strategy);
		},

		/**
		* Calls [_shouldStopScrollEvent_]{@link enyo.Scroller#shouldStopScrollEvent} to determine 
		* whether current scroll [event]{@link external:event} should be stopped.
		*
		* @private
		*/
		scrollStart: function (sender, e) {
			if (!this.shouldStopScrollEvent(e)) {
				this.decorateScrollEvent(e);
				return false;
			}
			return true;
		},

		/** 
		* Either propagates or stops the current scroll [event]{@link external:event}.
		*
		* @private
		*/
		scroll: function (sender, e) {
			// note: scroll event can be native dom or generated.
			var stop;
			if (e.dispatchTarget) {
				// allow a dom event if it orignated with this scroller or its strategy
				stop = this.preventScrollPropagation && !(e.originator == this ||
					e.originator.owner == this.$.strategy);
			} else {
				stop = this.shouldStopScrollEvent(e);
			}
			if (!stop) {
				this.decorateScrollEvent(e);
				return false;
			}
			return true;
		},

		/**
		* Calls [_shouldStopScrollEvent_]{@link enyo.Scroller#shouldStopScrollEvent} to determine 
		* whether current scroll [event]{@link external:event} should be stopped.
		*
		* @private
		*/
		scrollStop: function (sender, e) {
			if (!this.shouldStopScrollEvent(e)) {
				this.decorateScrollEvent(e);
				return false;
			}
			return true;
		},

		/**
		* Scroll to the top of the scrolling region.
		*
		* @public
		*/
		scrollToTop: function () {
			this.setScrollTop(0);
		},

		/**
		* Scroll to the bottom of the scrolling region.
		*
		* @public
		*/
		scrollToBottom: function () {
			this.setScrollTop(this.getScrollBounds().maxTop);
		},

		/**
		* Scroll to the right edge of the scrolling region.
		*
		* @public
		*/
		scrollToRight: function () {
			this.setScrollLeft(this.getScrollBounds().maxLeft);
		},

		/**
		* Scroll to the left edge of the scrolling region.
		*
		* @public
		*/
		scrollToLeft: function () {
			this.setScrollLeft(0);
		},

		/**
		* Ensures scroll position is in bounds.
		*
		* @public
		*/
		stabilize: function () {
			var s = this.getStrategy();
			if (s.stabilize) {
				s.stabilize();
			}
		},

		/**
		* Send the [useMouseWheel]{@link enyo.Scroller#useMouseWheel} property to the scroll 
		* strategy.
		*
		* @private
		*/
		useMouseWheelChanged: function () {
			this.$.strategy.setUseMouseWheel(this.useMouseWheel);
		},

		/**
		* @private
		*/
		resize: enyo.inherit(function (sup) {
			return function () {
				if (this.getAbsoluteShowing(true)) {
					sup.apply(this, arguments);
				}
			};
		})
	});

	// provide a touch scrolling solution by default when the environment is mobile
	if (enyo.Scroller.hasTouchScrolling()) {
		enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy();
	}

})(enyo, this);

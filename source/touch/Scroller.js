/**
_enyo.Scroller_ is a scroller suitable for use in both desktop and mobile
applications.

In some mobile environments, a default scrolling solution is not implemented for
DOM elements.  In such cases, _enyo.Scroller_ implements a touch-based scrolling
solution, which may be opted into either globally (by setting
_enyo.Scroller.touchScrolling_ to _true_) or on a per-instance basis (by
specifying a _strategyKind_ of _"TouchScrollStrategy"_).

For more information, see the documentation on
[Scrollers](building-apps/layout/scrollers.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Scroller",
	published: {
		/**
			Specifies how to horizontally scroll.  Acceptable values are
			"scroll", "auto," "hidden," and "default".  The precise
			effect of the setting is determined by the scroll strategy.
		*/
		horizontal: "default",
		/**
			Specifies how to vertically scroll.  Acceptable values are "scroll",
			"auto," "hidden," and "default".  The precise effect of the setting
			is determined by the scroll strategy.
		*/
		vertical: "default",
		/**
			The vertical scroll position
		*/
		scrollTop: 0,
		/**
			The horizontal scroll position
		*/
		scrollLeft: 0,
		/**
			Maximum height of the scroll content
		*/
		maxHeight: null,
		/**
			Set to true to make this scroller select a platform-appropriate
			touch-based scrolling strategy. Note that if you specify a value for
			_strategyKind_, that will take precedence over this setting.
		*/
		touch: false,
		/**
			Specifies a type of scrolling. The scroller will attempt to
			automatically select a strategy compatible with the runtime
			environment. Alternatively, you may choose to use a specific
			strategy:

			* <a href="#enyo.ScrollStrategy">ScrollStrategy</a> is the default
				and implements no scrolling, relying instead on the environment
				to scroll properly.

			* <a href="#enyo.TouchScrollStrategy">TouchScrollStrategy</a>
				implements a touch scrolling mechanism.

			* <a href="#enyo.TranslateScrollStrategy">TranslateScrollStrategy</a>
				implements a touch scrolling mechanism using translations; it is
				currently recommended only for Android 3 and 4 & Windows Phone 8.

			* <a href="#enyo.TransitionScrollStrategy">TransitionScrollStrategy</a>
				implements a touch scrolling mechanism using CSS transitions; it is
				currently recommended only for iOS 5 and later.
		*/
		strategyKind: "ScrollStrategy",
		//* Set to true to display a scroll thumb in touch scrollers
		thumb: true,
		//* Use mouse wheel to move scroller
		useMouseWheel: true
	},
	events: {
		//* Fires when a scrolling action starts.
		//* Includes scrollBounds field with current values of getScrollBounds
		onScrollStart: "",
		//* Fires while a scrolling action is in progress.
		//* Includes scrollBounds field with current values of getScrollBounds
		onScroll: "",
		//* Fires when a scrolling action stops.
		//* Includes scrollBounds field with current values of getScrollBounds
		onScrollStop: ""
	},
	/**
		If true (the default) and a touch scroller, the scroller will overscroll
		and bounce back at the edges
	*/
	touchOverscroll: true,
	/**
		If true (the default), the scroller will not propagate _dragstart_
		events that cause it to start scrolling
	*/
	preventDragPropagation: true,
	/**
		If true, the scroller will not propagate scroll events
	*/
	preventScrollPropagation: true,
	//* @protected
	// needed to allow global mods to enyo.Scroller.touchScrolling
	noDefer: true,
	handlers: {
		onscroll: "domScroll",
		onScrollStart: "scrollStart",
		onScroll: "scroll",
		onScrollStop: "scrollStop"
	},
	classes: "enyo-scroller",
	statics: {
		osInfo: [
			{os: "android", version: 3},
			{os: "androidChrome", version: 18},
			{os: "androidFirefox", version: 16},
			{os: "firefoxOS", version: 16},
			{os: "ios", version: 5},
			{os: "webos", version: 1e9},
			{os: "blackberry", version:1e9},
			{os: "tizen", version: 2}
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
				? "TranslateScrollStrategy"
				: "TouchScrollStrategy";
		}
	},
	controlParentName: "strategy",
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.horizontalChanged();
			this.verticalChanged();
			this.useMouseWheelChanged();
		};
	}),
	importProps: enyo.inherit(function (sup) {
		return function(inProps) {
			sup.apply(this, arguments);
			// allow global overriding of strategy kind
			if (inProps && inProps.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch)) {
				this.strategyKind = enyo.Scroller.getTouchStrategy();
			}
		};
	}),
	initComponents: enyo.inherit(function (sup) {
		return function() {
			this.strategyKindChanged();
			sup.apply(this, arguments);
		};
	}),
	teardownChildren: enyo.inherit(function (sup) {
		return function() {
			this.cacheScrollPosition();
			sup.apply(this, arguments);
		};
	}),
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.restoreScrollPosition();
		};
	}),
	strategyKindChanged: function() {
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
	createStrategy: function() {
		this.createComponents([{name: "strategy", maxHeight: this.maxHeight,
			kind: this.strategyKind, thumb: this.thumb,
			preventDragPropagation: this.preventDragPropagation,
			overscroll:this.touchOverscroll, isChrome: true}]);
	},
	getStrategy: function() {
		return this.$.strategy;
	},
	maxHeightChanged: function() {
		this.$.strategy.setMaxHeight(this.maxHeight);
	},
	showingChanged: enyo.inherit(function (sup) {
		return function() {
			if (!this.showing) {
				this.cacheScrollPosition();
				this.setScrollLeft(0);
				this.setScrollTop(0);
			}
			sup.apply(this, arguments);
			if (this.showing) {
				this.restoreScrollPosition();
			}
		};
	}),
	thumbChanged: function() {
		this.$.strategy.setThumb(this.thumb);
	},
	cacheScrollPosition: function() {
		this.cachedPosition = {left: this.getScrollLeft(), top: this.getScrollTop()};
	},
	restoreScrollPosition: function() {
		if (this.cachedPosition) {
			var cp = this.cachedPosition;
			if (cp.top || cp.left) {
				this.setScrollLeft(cp.left);
				this.setScrollTop(cp.top);
				this.cachedPosition = null;
			}
		}
	},
	horizontalChanged: function() {
		this.$.strategy.setHorizontal(this.horizontal);
	},
	verticalChanged: function() {
		this.$.strategy.setVertical(this.vertical);
	},
	// FIXME: these properties are virtual; property changed methods are fired only if
	// property value changes, not if getter changes.
	//* Sets scroll position along horizontal axis.
	setScrollLeft: function(inLeft) {
		this.scrollLeft = inLeft;
		this.$.strategy.setScrollLeft(this.scrollLeft);
	},
	//* Sets scroll position along vertical axis.
	setScrollTop: function(inTop) {
		this.scrollTop = inTop;
		this.$.strategy.setScrollTop(inTop);
	},
	//* Gets scroll position along horizontal axis.
	getScrollLeft: function() {
		// sync our internal property
		this.scrollLeft = this.$.strategy.getScrollLeft();
		return this.scrollLeft;
	},
	//* Gets scroll position along vertical axis.
	getScrollTop: function() {
		// sync our internal property
		this.scrollTop = this.$.strategy.getScrollTop();
		return this.scrollTop;
	},
	//* @public
	/**
		Returns an object describing the scroll boundaries with these properties:

		* _left_, _top_: current left/top scroll position
		* _maxLeft_, _maxTop_: maximum value for left/top (minimum is always 0)
		* _clientHeight_, _clientWidth_: size of the scroller on screen
		* _width_, _height_: size of the full area of the scrolled region
		* _xDir, yDir_: either 1, -1, or 0 indicated positive/negative movement along
		along the axis or none at all, respectively
	*/
	getScrollBounds: function() {
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
		Scrolls the given control (_inControl_) into view. If _inAlignWithTop_
		is true, _inControl_ is aligned with the top of the scroller.
	*/
	scrollIntoView: function(inControl, inAlignWithTop) {
		this.$.strategy.scrollIntoView(inControl, inAlignWithTop);
	},
	//* Scrolls to the position specified by _inX_ and _inY_ in pixel units.
	scrollTo: function(inX, inY) {
		this.$.strategy.scrollTo(inX, inY);
	},
	/**
		Ensures that the given control is visible in the scroller's viewport.
		Unlike _scrollIntoView_, which uses DOM's _scrollIntoView_, this only
		affects the current scroller.
	*/
	scrollToControl: function(inControl, inAlignWithTop) {
		this.scrollToNode(inControl.hasNode(), inAlignWithTop);
	},
	//* Ensures that the given node is visible in the scroller's viewport.
	scrollToNode: function(inNode, inAlignWithTop) {
		this.$.strategy.scrollToNode(inNode, inAlignWithTop);
	},
	//* @protected
	//* Adds current values of getScrollBounds to event
	decorateScrollEvent: function(inEvent) {
		var bounds = inEvent.scrollBounds = inEvent.scrollBounds || this.$.strategy._getScrollBounds();
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
	//* Normalizes scroll event to _onScroll_.
	domScroll: function(inSender, e) {
		// if a scroll event originated here, pass it to our strategy to handle
		if (this.$.strategy.domScroll && e.originator == this) {
			this.$.strategy.domScroll(inSender, e);
		}
		this.decorateScrollEvent(e);
		this.doScroll(e);
		return true;
	},
	/**
		Returns true if the current scroll event should be stopped; false if it
		should be allowed to propagate.
	*/
	shouldStopScrollEvent: function(inEvent) {
		return (this.preventScrollPropagation &&
			inEvent.originator.owner != this.$.strategy);
	},
	/**
		Calls _shouldStopScrollEvent_ to determine whether current scroll event
		should be stopped.
	*/
	scrollStart: function(inSender, inEvent) {
		if (!this.shouldStopScrollEvent(inEvent)) {
			this.decorateScrollEvent(inEvent);
			return false;
		}
		return true;
	},
	//* Either propagates or stops the current scroll event.
	scroll: function(inSender, inEvent) {
		// note: scroll event can be native dom or generated.
		var stop;
		if (inEvent.dispatchTarget) {
			// allow a dom event if it orignated with this scroller or its strategy
			stop = this.preventScrollPropagation && !(inEvent.originator == this ||
				inEvent.originator.owner == this.$.strategy);
		} else {
			stop = this.shouldStopScrollEvent(inEvent);
		}
		if (!stop) {
			this.decorateScrollEvent(inEvent);
			return false;
		}
		return true;
	},
	/**
		Calls _shouldStopScrollEvent_ to determine whether current scroll event
		should be stopped.
	*/
	scrollStop: function(inSender, inEvent) {
		if (!this.shouldStopScrollEvent(inEvent)) {
			this.decorateScrollEvent(inEvent);
			return false;
		}
		return true;
	},
	//* @public
	//* Scroll to the top of the scrolling region.
	scrollToTop: function() {
		this.setScrollTop(0);
	},
	//* Scroll to the bottom of the scrolling region.
	scrollToBottom: function() {
		this.setScrollTop(this.getScrollBounds().maxTop);
	},
	//* Scroll to the right edge of the scrolling region.
	scrollToRight: function() {
		this.setScrollLeft(this.getScrollBounds().maxLeft);
	},
	//* Scroll to the left edge of the scrolling region.
	scrollToLeft: function() {
		this.setScrollLeft(0);
	},
	//* Ensures scroll position is in bounds.
	stabilize: function() {
		var s = this.getStrategy();
		if (s.stabilize) {
			s.stabilize();
		}
	},
	//* Send the useMouseWheel propert to the scroll strategy
	useMouseWheelChanged: function() {
		this.$.strategy.setUseMouseWheel(this.useMouseWheel);
	}
});

// provide a touch scrolling solution by default when the environment is mobile
if (enyo.Scroller.hasTouchScrolling()) {
	enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy();
}

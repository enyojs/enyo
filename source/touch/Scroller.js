/**
_enyo.Scroller_ is a scroller suitable for use in both desktop and mobile
applications.

In some mobile environments, a default scrolling solution is not implemented for
DOM elements.  In such cases, _enyo.Scroller_ implements a touch-based scrolling
solution, which may be opted into either globally (by setting the flag
_enyo.Scroller.touchScrolling = true;_) or on a per-instance basis (by
specifying a _strategyKind_ of "TouchScrollStrategy").

For more information, see the documentation on
[Scrollers](https://github.com/enyojs/enyo/wiki/Scrollers) in the Enyo Developer
Guide.
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
				currently recommended only for Android 3 and 4.
		*/
		strategyKind: "ScrollStrategy",
		//* Set to true to display a scroll thumb in touch scrollers
		thumb: true
	},
	events: {
		//* Fires when a scrolling action starts.
		onScrollStart: "",
		//* Fires while a scrolling action is in progress.
		onScroll: "",
		//* Fires when a scrolling action stops.
		onScrollStop: ""
	},
	handlers: {
		onscroll: "domScroll",
		onScrollStart: "scrollStart",
		onScroll: "scroll", 
		onScrollStop: "scrollStop"
	},
	classes: "enyo-scroller",
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
	statics: {
		osInfo: [
			{os: "android", version: 3},
			{os: "androidChrome", version: 18},
			{os: "androidFirefox", version: 16},
			{os: "ios", version: 5},
			{os: "webos", version: 1e9}
		],
		//* Returns true if platform should have touch events.
		hasTouchScrolling: function() {
			for (var i=0, t, m; (t=this.osInfo[i]); i++) {
				if (enyo.platform[t.os]) {
					return true;
				}
			}
		},
		/**
			Returns true if the platform has native div scrollers (desktop
			browsers always have them).
		*/
		hasNativeScrolling: function() {
			for (var i=0, t, m; (t=this.osInfo[i]); i++) {
				if (enyo.platform[t.os] < t.version) {
					return false;
				}
			}
			return true;
		},
		getTouchStrategy: function() {
			return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
		}
	},
	//* @protected
	controlParentName: "strategy",
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		// allow global overriding of strategy kind
		if (inProps && inProps.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch)) {
			this.strategyKind = enyo.Scroller.getTouchStrategy();
		}
	},
	initComponents: function() {
		this.strategyKindChanged();
		this.inherited(arguments);
	},
	teardownChildren: function() {
		this.cacheScrollPosition();
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.restoreScrollPosition();
	},
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
		this.createComponents([{name: "strategy", maxHeight: this.maxHeight, kind: this.strategyKind, thumb: this.thumb, preventDragPropagation: this.preventDragPropagation, overscroll:this.touchOverscroll, isChrome: true}]);
	},
	getStrategy: function() {
		return this.$.strategy;
	},
	maxHeightChanged: function() {
		this.$.strategy.setMaxHeight(this.maxHeight);
	},
	showingChanged: function() {
		if (!this.showing) {
			this.cacheScrollPosition();
			this.setScrollLeft(0);
			this.setScrollTop(0);
		}
		this.inherited(arguments);
		if (this.showing) {
			this.restoreScrollPosition();
		}
	},
	thumbChanged: function() {
		this.$.strategy.setThumb(this.thumb);
	},
	cacheScrollPosition: function() {
		this.cachedPosition = {left: this.getScrollLeft(), top: this.getScrollTop()};
	},
	restoreScrollPosition: function() {
		if (this.cachedPosition) {
			this.setScrollLeft(this.cachedPosition.left);
			this.setScrollTop(this.cachedPosition.top);
			this.cachedPosition = null;
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
		return this.$.strategy.getScrollLeft();
	},
	//* Gets scroll position along vertical axis.
	getScrollTop: function() {
		return this.$.strategy.getScrollTop();
	},
	//* @public
	/**
		Returns an object describing the scroll boundaries with _height_ and
		_width_ properties.
	*/
	getScrollBounds: function() {
		return this.$.strategy.getScrollBounds();
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
	//* Normalizes scroll event to _onScroll_.
	domScroll: function(inSender, e) {
		// if a scroll event originated here, pass it to our strategy to handle
		if (this.$.strategy.domScroll && e.originator == this) {
			this.$.strategy.scroll(inSender, e);
		}
		this.doScroll(e);
		return true;
	},
	/**
		Returns true if the current scroll event should be stopped; false if it
		should be allowed to propagate.
	*/
	shouldStopScrollEvent: function(inEvent) {
		return (this.preventScrollPropagation && inEvent.originator.owner != this.$.strategy);
	},
	/**
		Calls _shouldStopScrollEvent_ to determine whether current scroll event
		should be stopped.
	*/
	scrollStart: function(inSender, inEvent) {
		return this.shouldStopScrollEvent(inEvent);
	},
	//* Either propagates or stops the current scroll event.
	scroll: function(inSender, inEvent) {
		// note: scroll event can be native dom or generated.
		if (inEvent.dispatchTarget) {
			// allow a dom event if it orignated with this scroller or its strategy
			return this.preventScrollPropagation && !(inEvent.originator == this || inEvent.originator.owner == this.$.strategy);
		} else {
			return this.shouldStopScrollEvent(inEvent);
		}
	},
	/**
		Calls _shouldStopScrollEvent_ to determine whether current scroll event
		should be stopped.
	*/
	scrollStop: function(inSender, inEvent) {
		return this.shouldStopScrollEvent(inEvent);
	},
	scrollToTop: function() {
		this.setScrollTop(0);
	},
	scrollToBottom: function() {
		this.setScrollTop(this.getScrollBounds().maxTop);
	},
	scrollToRight: function() {
		this.setScrollTop(this.getScrollBounds().maxLeft);
	},
	scrollToLeft: function() {
		this.setScrollLeft(0);
	},
	//* Ensures scroll position is in bounds.
	stabilize: function() {
		var s = this.getStrategy();
		if (s.stabilize) {
			s.stabilize();
		}
	}
});

// provide a touch scrolling solution by default when the environment is mobile
if (enyo.Scroller.hasTouchScrolling()) {
	enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy();
}

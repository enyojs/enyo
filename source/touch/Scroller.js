/**
enyo.Scroller is scroller suitable for use in both desktop and mobile applications.

In some mobile environments, a default scrolling solution is not implemented for dom elements. In these cases, enyo.Scroller implements
a touch based scrolling solution. This can be opted into either globally by setting the flag enyo.Scroller.touchScrolling = true;
or on a per instance basis by specifying a strategyKind of "TouchScrollStrategy."

Note: If a scroller is nofit: false, then it should have a position style set to a value other than the default of static.

*/
enyo.kind({
	name: "enyo.Scroller",
	published: {
		/**
			Specifies how to horizontally scroll. Acceptable values are "scroll", "auto," "hidden," and "default" The precise
			effect of the setting is determined by the scroll strategy.
		*/
		horizontal: "default",
		/**
			Specifies how to vertically scroll. Acceptable values are "scroll", "auto," "hidden," and "default" The precise
			effect of the setting is determined by the scroll strategy.
		*/
		vertical: "default",
		/**
			Sets the vertical scroll position.
		*/
		scrollTop: 0,
		/**
			Sets the horizontal scroll position.
		*/
		scrollLeft: 0,
		/**
			Set to true when container size depends on size of the content.
		*/
		nofit: false,
		/**
			Specify a type of scrolling. The enyo Scroller will attempt to automatically select 
			a strategy compatbile with the runtime environment. A specific strategy can also be chosen:

			* <a href="#enyo.ScrollStrategy">ScrollStrategy</a> is the default and implements no scrolling, relying instead on the environment to scroll properly.
			* <a href="#enyo.TouchScrollStrategy">TouchScrollStrategy</a> implements a touch scrolling mechanism.
		*/
		strategyKind: "ScrollStrategy"
	},
	events: {
		onScrollStart: "",
		onScroll: "",
		onScrollStop: ""
	},
	classes: "enyo-scroller",
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	//* @protected
	statics: {
		osInfo: [
			{os: "android", version: 3},
			{os: "ios", version: 5},
			{os: "webos", version: 1e9}
		],
		hasTouchScrolling: function() {
			for (var i=0, t, m; t=this.osInfo[i]; i++) {
				if (enyo.platform[t.os] >= t.version) {
					return true;
				}
			}
		},
		hasNativeScrolling: function() {
			for (var i=0, t, m; t=this.osInfo[i]; i++) {
				if (enyo.platform[t.os] < t.version) {
					return false;
				}
			}
			return true;
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
		if (inProps && inProps.strategyKind === undefined && enyo.Scroller.touchScrolling) {
			this.strategyKind = "TouchScrollStrategy";
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
		this.createComponents([{name: "strategy", nofit: this.nofit, kind: this.strategyKind, preventDragPropagation: this.preventDragPropagation, isChrome: true}]);
		if (this.hasNode()) {
			this.render();
		}
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
	setScrollLeft: function(inLeft) {
		this.scrollLeft = inLeft;
		this.$.strategy.setScrollLeft(this.scrollLeft);
	},
	setScrollTop: function(inTop) {
		this.scrollTop = inTop;
		this.$.strategy.setScrollTop(inTop);
	},
	getScrollLeft: function() {
		return this.$.strategy.getScrollLeft();
	},
	getScrollTop: function() {
		return this.$.strategy.getScrollTop();
	},
	//* @public
	//* returns an object describing the scroll boundaries with height and width properties.
	getScrollBounds: function() {
		return this.$.strategy.getScrollBounds();
	},
	//* scrolls the given control (inControl) into view. If inAlignWithTop is true, inControl is aligned with the top of the scroller.
	scrollIntoView: function(inControl, inAlignWithTop) {
		this.$.strategy.scrollIntoView(inControl, inAlignWithTop);
	},
	//* Scroll to the position given by inX and inY in pixel units.
	scrollTo: function(inX, inY) {
		this.$.strategy.scrollTo(inX, inY);
	}
});

// provide a touch scrolling solution by default when the environment has no native scrolling.
if (!enyo.Scroller.hasNativeScrolling()) {
	enyo.Scroller.prototype.strategyKind =  "TouchScrollStrategy";
}

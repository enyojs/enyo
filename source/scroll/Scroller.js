/**
enyo.Scroller is scroller suitable for use in both desktop and mobile applications.

In some mobile environments, a default scrolling solution is not implemented for dom elements. In these cases, enyo.Scroller implements
a touch based scrolling solution. This can be opted into either globally by setting the flag enyo.Scroller.touchScrolling = true;
or on a per instance basis by specifying a strategyKind of "TouchScrollStrategy."

*/
enyo.kind({
	name: "enyo.Scroller",
	kind: enyo.Control,
	statics: {
		osInfo: [
			{os: "Android", version: 3},
			{os: "iPhone", version: 5},
			{os: "iPad", version: 5},
			{os: "webos", version: 1e9}
		],
		calcOsVersion: function(inTest, inOs) {
			var m = inTest.match(new RegExp(inOs + ".*?([0-9])", "i"));
			if (m) {
				return Number(m[1]);
			}
		},
		hasTouchScrolling: function() {
			var ua = navigator.userAgent;
			for (var i=0, t, m; t=this.osInfo[i]; i++) {
				if (this.calcOsVersion(ua, t.os) >= t.version) {
					return true;
				}
			}
		},
		hasNativeScrolling: function() {
			var ua = navigator.userAgent;
			for (var i=0, t, m; t=this.osInfo[i]; i++) {
				if (this.calcOsVersion(ua, t.os) < t.version) {
					return true;
				}
			}
			return true;
		}
	},
	/**
		If true, the scroller will not propagate dragstart events that cause it to start scrolling (defaults to true)
	*/
	preventDragPropagation: true,
	published: {
		/**
		Set to false to prevent horizontal scrolling.
		*/
		horizontal: true,
		/**
		Set to false to prevent vertical scrolling.
		*/
		vertical: true,
		/**
		Sets the vertical scroll position.
		*/
		scrollTop: 0,
		/**
		Sets the horizontal scroll position.
		*/
		scrollLeft: 0,
		/**
		Specify a type of scrolling. The enyo Scroller will attempt to automatically select 
		a strategy compatbile with the runtime environment. A specific strategy can also be chosen:
		"ScrollStrategy" is the default and implements no scrolling, relying instead on the environment to scroll properly.
		"TouchScrollStragey" implements a touch scrolling mechanism.
		*/
		strategyKind: "ScrollStrategy"
	},
	events: {
		onScrollStart: "",
		onScroll: "",
		onScrollStop: ""
	},
	//* @protected
	controlParentName: "strategy",
	create: function() {
		this.inherited(arguments);
		this.addClass("enyo-scroller");
		this.horizontalChanged();
		this.verticalChanged();
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		// allow global overriding of strategy kind
		if (inProps.strategyKind === undefined && enyo.Scroller.forceTouchScrolling) {
			this.strategyKind = "TouchScrollStrategy";
		}
	},
	initComponents: function() {
		this.strategyKindChanged();
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.cachedPosition = null;
	},
	strategyKindChanged: function() {
		if (this.$.strategy) {
			this.$.strategy.destroy();
			this.controlParent = null;
		}
		this.createComponent({name: "strategy", classes: "enyo-fit", kind: this.strategyKind, preventDragPropagation: this.preventDragPropagation, isChrome: true});
		if (this.hasNode()) {
			this.discoverControlParent();
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
		}
	},
	horizontalChanged: function() {
		this.$.strategy.setHorizontal(this.horizontal);
	},
	verticalChanged: function() {
		this.$.strategy.setVertical(this.vertical);
	},
	scrollLeftChanged: function() {
		this.$.strategy.setScrollLeft(this.scrollLeft);
	},
	scrollTopChanged: function() {
		this.$.strategy.setScrollTop(this.scrollTop);
	},
	getScrollLeft: function() {
		return this.$.strategy.getScrollLeft();
	},
	getScrollTop: function() {
		return this.$.strategy.getScrollTop();
	},
	scrollIntoView: function(inControl, inAlignWithTop) {
		this.$.strategy.scrollIntoView(inX, inY, inToTop);
	},
	scrollTo: function(inX, inY) {
		this.$.strategy.scrollTo(inX, inY);
	}
});

// provide a touch scrolling solution by default when the environment has no native scrolling.
if (!enyo.Scroller.hasNativeScrolling()) {
	enyo.Scroller.prototype.strategyKind =  "TouchScrollStrategy";
}
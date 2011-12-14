//* @protected
enyo.kind({
	name: "enyo.VirtualScroller",
	kind: enyo.DragScroller,
	events: {
		onScroll: ""
	},
	published: {
		/**
		Use accelerated scrolling.
		*/
		accelerated: true
	},
	className: "enyo-virtual-scroller",
	//* @protected
	tools: [
		{name: "scroll", kind: "ScrollStrategy", topBoundary: 1e9, bottomBoundary: -1e9}
	],
	components: [
		// fitting div to prevent layout leakage
		{className: "enyo-fit", components: [
			// important for compositing that this height be fixed, as to avoid reallocating textures
			{name: "content", height: "2048px"}
		]}
	],
	//
	// custom sliding-buffer
	//
	top: 0,
	bottom: -1,
	pageTop: 0,
	pageOffset: 0,
	contentHeight: 0,
	constructor: function() {
		this.heights = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.acceleratedChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.measure();
		this.$.scroll.animate();
		// animate will not do anything if the object is in steady-state
		// so we ensure we have filled our display buffer here
		this.updatePages();
	},
	acceleratedChanged: function() {
		var p = this.pageTop;
		this.pageTop = 0;
		if (this.effectScroll) {
			this.effectScroll();
		}
		this.pageTop = p;
		this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated;
		this.$.content.applyStyle("margin", this.accelerated ? null : "900px 0");
		this.$.content.addRemoveClass("enyo-accel-children", this.accelerated);
		this.effectScroll();
	},
	measure: function() {
		//this.unlockClipRegion();
		this.viewNode = this.hasNode();
		if (this.viewNode) {
			this.viewHeight = this.viewNode.clientHeight;
		}
	},
	//
	// prompt the scroller to start.
	start: function() {
		this.$.scroll.start();
	},
	//
	// FIXME: Scroller's shiftPage/unshiftPage/pushPage/popPage are implemented via adjustTop/adjustBottom
	// Conversely, Buffer's adjustTop/adjustBottom are implemented via shift/unshift/push/pop
	// Presumably there is a less confusing way of factoring or naming the methods.
	//
	// abstract: subclass must supply
	adjustTop: function(inTop) {
	},
	// abstract: subclass must supply
	adjustBottom: function(inBottom) {
	},
	// add a page to the top of the window
	unshiftPage: function() {
		var t = this.top - 1;
		if (this.adjustTop(t) === false) {
			return false;
		}
		this.top = t;
	},
	// remove a page from the top of the window
	shiftPage: function() {
		this.adjustTop(++this.top);
	},
	// add a page to the top of the window
	pushPage: function() {
		//this.log(this.top, this.bottom);
		var b = this.bottom + 1;
		if (this.adjustBottom(b) === false) {
			return false;
		}
		this.bottom = b;
	},
	// remove a page from the top of the window
	popPage: function() {
		this.adjustBottom(--this.bottom);
	},
	//
	// NOTES:
	//
	// pageOffset represents the scroll-distance in the logical display (from ScrollManager's perspective)
	// that is hidden from the real display (via: display: none). It's measured as pixels above the origin, so
	// the value is <= 0.
	//
	// pageTop is the scroll position on the real display, also <= 0.
	//
	// show pages that have scrolled in from the bottom
	pushPages: function() {
		// contentHeight is the height of displayed DOM pages
		// pageTop is the actual scrollTop for displayed DOM pages (negative)
		while (this.contentHeight + this.pageTop < this.viewHeight) {
			if (this.pushPage() === false) {
				this.$.scroll.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
				break;
			}
			// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
			this.contentHeight += this.heights[this.bottom] || 0;
		}
	},
	// hide pages that have scrolled off of the bottom
	popPages: function() {
		// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
		var h = this.heights[this.bottom];
		while (h !== undefined && this.bottom && this.contentHeight + this.pageTop - h > this.viewHeight) {
			this.popPage();
			this.contentHeight -= h;
			h = this.heights[this.bottom];
		}
	},
	// hide pages that have scrolled off the top
	shiftPages: function() {
		// the height of the first (displayed) page
		var h = this.heights[this.top];
		while (h !== undefined && h < -this.pageTop) {
			// increase the distance from the logical display that is hidden from the real display
			this.pageOffset -= h;
			// decrease the distance representing the scroll position on the real display
			this.pageTop += h;
			// decrease the height of the real display
			this.contentHeight -= h;
			// process the buffer movement
			this.shiftPage();
			// the height of the new first page
			h = this.heights[this.top];
		}
	},
	// show pages that have scrolled in from the top
	unshiftPages: function() {
		while (this.pageTop > 0) {
			if (this.unshiftPage() === false) {
				this.$.scroll.topBoundary = this.pageOffset;
				this.$.scroll.bottomBoundary = -9e9;
				break;
			}
			// note: if h is zero we will loop again
			var h = this.heights[this.top];
			if (h === undefined) {
				this.top++;
				return;
			}
			this.contentHeight += h;
			this.pageOffset += h;
			this.pageTop -= h;
		}
	},
	updatePages: function() {
		if (!this.viewNode) {
			return;
		}
		// re-query viewHeight every iteration
		// querying DOM can cause a synchronous layout
		// but commonly there is no dirty layout at this time.
		this.viewHeight = this.viewNode.clientHeight;
		if (this.viewHeight <= 0) {
			return;
		}
		//
		// recalculate boundaries every iteration
		var ss = this.$.scroll;
		ss.topBoundary = 9e9;
		ss.bottomBoundary = -9e9;
		//
		// show pages that have scrolled in from the bottom
		this.pushPages();
		// hide pages that have scrolled off the bottom
		this.popPages();
		// show pages that have scrolled in from the top
		this.unshiftPages();
		// hide pages that have scrolled off the top
		this.shiftPages();
		//
		// pageTop can change as a result of updatePages, so we need to perform content translation
		// via effectScroll
		// scroll() method doesn't call effectScroll because we call it here
		this.effectScroll();
	},
	scroll: function() {
		// calculate relative pageTop
		var pt = Math.round(this.$.scroll.y) - this.pageOffset;
		if (pt == this.pageTop) {
			return;
		}
		// page top drives all page rendering / discarding
		this.pageTop = pt;
		// add or remove pages from either end to satisfy display requirements
		this.updatePages();
		// perform content translation
		this.doScroll();
	},
	// NOTE: there are a several ways to effect content motion.
	// The 'transform' method in combination with hardware acceleration promises
	// the smoothest animation, but hardware acceleration in combination with the
	// trick-scrolling gambit implemented here produces visual artifacts.
	// In the absence of hardware acceleration, scrollTop appears to be the fastest method.
	effectScrollNonAccelerated: function() {
		//webosEvent.event('', 'enyo:effectScrollNonAccelerated', '');
		if (this.hasNode()) {
			this.node.scrollTop = 900 - this.pageTop;
		}
	},
	effectScrollAccelerated: function() {
		//webosEvent.event('', 'enyo:effectScrollAccelerated', '');
		var n = this.$.content.hasNode();
		if (n) {
			n.style.webkitTransform = 'translate3d(0,' + this.pageTop + 'px,0)';
		}
	}
});

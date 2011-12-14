/**
	Strategy for managing a page stack such that a scrolling viewport 
	is covered by pages.
	
	* Direction and dom-independent.
	* Maintains coherent boundaries, but has no cursor.
	* Client-code must:
		* set viewSize (FIXME)
		* implement push/pop.unshift/shiftPage events
*/
enyo.kind({
	name: "enyo.list.PageStrategy",
	kind: enyo.Component,
	events: {
		onPushPage: "pushPage",
		onPopPage: "popPage",
		onUnshiftPage: "unshiftPage",
		onShiftPage: "shiftPage"
	},
	viewSize: 0,
	contentSize: 0,
	virtualOffset: 0,
	scrollPosition: 0,
	topBoundary: 9e9,
	bottomBoundary: -9e9,
	stabilize: function() {
		// PageStrategy essentially uses a bidirectional search to find 
		// content in either direction from some pivot point to fill
		// a content region.
		// The pivot itself may need to be moved to correctly fill the content 
		// region.
		// Generally a scroll strategy used in concert with this object will
		// cause the pivot to move into the correct position based on boundary 
		// calculations, but this is visible to the user.
		// This method is intended to bring the PageStrategy to a stable state
		// before invoking any scroll strategy to avoid the content
		// visibly scrolling while searching for content.
		this.updatePages();
		while (true) {
			// if both boundaries are infinitely far away, then we are filled with content and can stop
			if (this.topBoundary == 9e9 && this.bottomBoundary == -9e9) {
				break;
			// if both boundaries have been detected, we fix the scroll position to the top boundary
			} else if (this.topBoundary != 9e9 && this.bottomBoundary != -9e9) {
				var p = this.topBoundary;
				break;
			// if we've only found the bottom boundary, we need to search for additional content above the pivot
			} else if (this.topBoundary == 9e9) {
				this.tryUnshiftPage();
			}
			// resolve conflicting boundaries
			this.validateBoundaries();
		}
		// return a fixed scroll position (or undefined)
		return p;
	},
	updatePages: function() {
		// show pages that have scrolled in from the bottom
		this.pushPages();
		// hide pages that have scrolled off the bottom
		this.popPages();
		// show pages that have scrolled in from the top
		this.unshiftPages();
		// hide pages that have scrolled off the top
		this.shiftPages();
		// resolve conflicting boundaries
		this.validateBoundaries();
	},
	// show pages that have scrolled in from the bottom
	pushPages: function() {
		while (this.contentSize + this.scrollPosition < this.viewSize) {
			var s = this.pushPage();
			// if we've reached the end of the list...
			if (!s && s!==0) {
				// then we know where the bottomBoundary is
				this.bottomBoundary = -this.contentSize + this.virtualOffset + this.viewSize;
				//this.log("locating bottomBoundary at " + this.bottomBoundary, "(" + this.contentSize, this.virtualOffset, this.viewSize + ")");
				break;
			}
			this.contentSize += s;
		}
	},
	// hide pages that have scrolled off of the bottom
	popPages: function() {
		while (true) {
			var space = this.contentSize + this.scrollPosition - this.viewSize;
			var s = this.popPage(space);
			if (!s && s!==0) {
				break;
			}
			this.contentSize -= s;
		}
	},
	tryUnshiftPage: function() {
		var s = this.unshiftPage();
		// if we've reached the top of the list...
		if (!s && s!==0) {
			// then we know where the topBoundary is
			this.topBoundary = this.virtualOffset;
			return false;
		}
		this.contentSize += s;
		this.virtualOffset += s;
		this.scrollPosition -= s;
		return true;
	},
	// show pages that have scrolled in from the top
	unshiftPages: function() {
		while (this.scrollPosition > 0) {
			if (!this.tryUnshiftPage()) {
				break;
			};
		}
	},
	// hide pages that have scrolled off the top
	shiftPages: function() {
		while (true) {
			var s = this.shiftPage(-this.scrollPosition);
			if (!s && s!==0) {
				break;
			}
			this.contentSize -= s;
			this.virtualOffset -= s;
			this.scrollPosition += s;
		}
	},
	validateBoundaries: function() {
		// if the boundaries are crossed, we have to pick one
		// this should only occur if the content is smaller than the viewport
		if (this.bottomBoundary > this.topBoundary) {
			// boundaries are relative to the top of the viewport
			// the scroll strategy manages an infinitely small cursor (it doesn't care about viewport size)
			// so coincident boundaries is proper (disallows scrolling [except overscrolling])
			this.bottomBoundary = this.topBoundary;
		}
	},
	pushPage: function() {
		return this.doPushPage();
	},
	popPage: function(inSpace) {
		return this.doPopPage(inSpace);
	},
	unshiftPage: function() {
		return this.doUnshiftPage();
	},
	shiftPage: function(inSpace) {
		return this.doShiftPage(inSpace);
	},
	// scrolling
	scroll: function(inPosition, inInvert) {
		// invert coordinate system if requested
		var pos = !inInvert ? inPosition : -inPosition;
		// offset virtual scroll position to find the effective scroll position
		var st = Math.round(pos - this.virtualOffset);
		if (st !== this.scrollPosition) {
			// scrollPosition drives all page rendering / discarding
			this.scrollPosition = st;
			// add or remove pages from either end to satisfy display requirements
			this.updatePages();
		}
		// return (optionally inverted) scroll position
		return this.getScrollPosition(inInvert);
	},
	getScrollPosition: function(inInvert) {
		return !inInvert ? this.scrollPosition : this.viewSize - this.contentSize - this.scrollPosition;
	},
	// Discard state except for scroll position
	refresh: function() {
		this.contentSize = 0;
		// We are required to reset boundaries here, because there may be 
		// sufficient new content that additional pages can be rendered
		// before hitting EOL markers. In that scenario, the boundaries
		// will not be adjusted and the new content will not be accessible.
		// For example, if topBoundary = 0, and page -1 is newly created,
		// the topBoundary will not be reduced until at attempt is made to
		// unshift page -2, so page -1 will be above the boundary.
		this.topBoundary = 9e9;
		this.bottomBoundary = -9e9;
	},
	// Restore initial state
	punt: function() {
		this.refresh();
		this.virtualOffset = 0;
	}
});

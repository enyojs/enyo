/**
A view that slides back and forth and is designed to be a part of a
<a href="#enyo.SlidingPane">SlidingPane</a>.

SlidingView objects have a "dragAnywhere" property, whose default value is true. This allows
the user to drag the view from any point inside the panel that is not already a
draggable region (e.g., a Scroller). If dragAnywhere is set to false, then the view
can still be dragged via any control inside it whose "slidingHandler" property is set to true.

The "peekWidth" property specifies the amount the paneview should be offset from the left
when it is selected. This allows controls on the underlying view object to the left
of the selected one to be partially revealed.

SlidingView has some other published properties that are less frequently used. The "minWidth" 
property specifies a minimum width for view content, and "edgeDragging" lets the user 
drag the view from its left edge. (The default value of edgeDragging is false.)

The last view in a SlidingPane is special, it is resized to fit the available space. 
The onResize event is fired when this occurs.
*/
enyo.kind({
	name: "enyo.SlidingView",
	kind: enyo.Control,
	className: "enyo-sliding-view",
	layoutKind: "VFlexLayout",
	events: {
		onResize: ""
	},
	published: {
		/** Can drag panel from anywhere (note: does not work if there's another drag surface (e.g. scroller)). */
		dragAnywhere: true,
		/** Can drag/toggle by dragging on left edge of sliding panel. */
		edgeDragging: false,
		/** Whether content width should or should not be adjusted based on size changes. */
		fixedWidth: false,
		/** Minimum content width. */
		minWidth: 0,
		/** Amount we should be shifted right to reveal panel underneath us when selected. */
		peekWidth: 0,
		/** Whether or not the view may be dragged right to dismiss it */
		dismissible: false,
		accelerated: true
	},
	//* @protected
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{name: "client", className: "enyo-bg", kind: enyo.Control, flex: 1},
		// NOTE: used only as a hidden surface to move sliding from the left edge
		{name: "edgeDragger", slidingHandler: true, kind: enyo.Control, className: "enyo-sliding-view-nub"}
	],
	slidePosition: 0,
	create: function() {
		this.inherited(arguments);
		this.layout = new enyo.VFlexLayout();
		this.edgeDraggingChanged();
		this.minWidthChanged();
		this.acceleratedChanged();
	},
	acceleratedChanged: function() {
		this.applySlideToNode(this.slidePosition);
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	edgeDraggingChanged: function() {
		this.$.edgeDragger.setShowing(this.edgeDragging);
	},
	// siblings
	findSiblings: function() {
		return this.pane.views;
	},
	getPreviousSibling: function() {
		return this.findSiblings()[this.index-1];
	},
	getNextSibling: function() {
		return this.findSiblings()[this.index+1];
	},
	getFirstSibling: function() {
		var s = this.findSiblings();
		return s[0];
	},
	getLastSibling: function() {
		var s = this.findSiblings();
		return s[s.length-1];
	},
	getLastShowingSibling: function() {
		var sibs = this.findSiblings();
		for (var i=0, s; s=sibs[i]; i++) {
			if (!s.showing) {
				return sibs[Math.max(0, i-1)];
			}
		}
		return sibs[i-1];
	},
	// selection
	select: function() {
		this.pane.selectView(this);
	},
	selectPrevious: function() {
		enyo.call(this.getPreviousSibling(), "select");
	},
	selectNext: function() {
		enyo.call(this.getNextSibling(), "select");
	},
	toggleSelected: function() {
		if (this == this.pane.view) {
			this.selectPrevious();
		} else {
			this.select();
		}
	},
	showingChanged: function(inOldValue) {
		if (!this.hasNode()) {
			this.inherited(arguments);
		} else if (!this.pane.dragging && (inOldValue != this.showing)) {
			this.dispatch(this.owner, this.showing ? this.onShow : this.onHide);
			this.pane.stopAnimation();
			if (this.showing) {
				this.inherited(arguments);
				this.pane.validateViewSizes();
				this.setSlidePosition(this.calcSlideHidden());
			}
			this.overSliding = true;
			this.pane.playAnimation(this);
		}
	},
	// sliding calculations
	calcSlide: function() {
		var i = this.index;
		var si = this.pane.view.index;
		var state = this.shouldSlideHidden() ? "Hidden" : (i == si ? "Selected" : (i < si ? "Before" : "After"));
		return this["calcSlide" + state]();
	},
	// FIXME: re-consider offset caching, pita: required to reset on resize.
	getLeftOffset: function() {
		if (this.hasNode()) {
			this._offset = undefined;
			return this._offset !== undefined ? this._offset : (this._offset = this.node.offsetLeft);
		}
		return 0;
	},
	calcSlideMin: function() {
		var x = this.getLeftOffset();
		return this.peekWidth - x;
	},
	calcSlideMax: function() {
		var c = this.getPreviousSibling();
		var x = (c && c.slidePosition) || 0;
		//this.log(this.id, x);
		return x;
	},
	// before selected
	calcSlideBefore: function() {
		var m = this.calcSlideMin();
		if (this.pane.isAnimating() || this.pane.dragging) {
			var c = this.getNextSibling();
			if (this.hasNode() && c) {
				return Math.max(m, c.slidePosition);
			}
		}
		return m;
	},
	calcSlideSelected: function() {
		return this.calcSlideMin();
	},
	// after selected
	calcSlideAfter: function() {
		if (this.pane.isAnimating() || this.pane.dragging) {
			return this.calcSlideMax();
		} else {
			var s = this.pane.view;
			return s ? s.calcSlideMin() : 0;
		}
	},
	calcSlideHidden: function() {
		var x = this.hasNode() && this.parent.hasNode() ? this.parent.node.offsetWidth - this.getLeftOffset() : 0;
		//this.log(this.slidePosition, x);
		return x;
	},
	shouldSlideHidden: function() {
		var p = this;
		do {
			if (!p.showing) {
				return true;
			}
		} while (p = p.getPreviousSibling());
	},
	// movement
	// move this sliding and validate next.
	move: function(inSlide) {
		this.setSlidePosition(inSlide);
		// validate next sibling...
		var c = this.getNextSibling();
		if (c) {
			c.validateSlide();
		}
	},
	setSlidePosition: function(inSlide) {
		if (inSlide != this.slidePosition && this.index) {
			this.lastSlidePosition = this.slidePosition;
			this.slidePosition = inSlide;
			this.applySlideToNode(inSlide);
		}
	},
	applySlideToNode: function(inSlide) {
		var t = inSlide !== null ? "translateX(" + inSlide + "px)" : "";
		if (this.accelerated) {
			t += " translateZ(0)";
		}
		this.domStyles["-webkit-transform"] = t;
		if (this.hasNode()) {
			this.node.style.webkitTransform = t;
		}
	},
	// move to our calculated position
	validateSlide: function() {
		this.move(this.calcSlide());
	},
	// move all before this index to calculated position
	validateSlideBefore: function() {
		var s = this.getFirstSibling();
		while (s) {
			if (s.index != this.index) {
				s.setSlidePosition(s.calcSlide());
				s = s.getNextSibling();
			} else {
				break;
			}
		}
	},
	// animation
	canAnimate: function() {
		return (this.index != 0 && this.slidePosition != this.calcSlide());
	},
	// move this, then slide each previous and force before mode.
	animateMove: function(inSlide, inOverSliding) {
		this.move(inSlide);
		if (!inOverSliding) {
			var p = this.getPreviousSibling();
			while (p) {
				p.setSlidePosition(p.calcSlideBefore());
				p = p.getPreviousSibling();
			}
		}
	},
	// dragging
	dragstartHandler: function(inSender, e) {
		e.sliding = this;
	},
	isDraggableEvent: function(inEvent) {
		return this.findSlidingHandler(inEvent.dispatchTarget) || this.dragAnywhere;
	},
	findSlidingHandler: function(inControl) {
		var c = inControl;
		while (c && c.isDescendantOf(this)) {
			if (c.slidingHandler === false) {
				return;
			}
			if (c.slidingHandler) {
				return c;
			}
			c = c.parent;
		}
	},
	canDrag: function(inDelta) {
		this.dragMin = this.calcSlideMin();
		this.dragMax = this.calcSlideMax();
		//
		var i = this.index;
		var si = this.pane.view.index;
		// first index not draggable
		if (i && this.showing && i >= si) {
			var x = this.slidePosition + inDelta;
			var c = this.dragMax != this.dragMin && (x >= this.dragMin && x <= this.dragMax);
			return c;
		}
	},
	isAtDragMax: function() {
		return this.slidePosition == this.dragMax;
	},
	isAtDragMin: function() {
		return this.slidePosition == this.dragMin;
	},
	isAtDragBoundary: function() {
		return this.isAtDragMax() || this.isAtDragMin();
	},
	beginDrag: function(e, inDx) {
		this.validateSlideBefore();
		this.lastDragDx = e.dx;
		this.dragStart = this.slidePosition - inDx;
	},
	isMovingToSelect: function() {
		return this.slidePosition < this.lastSlidePosition;
	},
	drag: function(e) {
		// bail if we are waiting for an animation or not moving
		var x0 = e.dx + this.dragStart;
		if (this.pendingDragMove || (x0 == this.slidePosition)) {
			return;
		}
		this.shouldDragSelect = x0 < this.slidePosition;
		// if out of bounds, return boundary info
		if ((x0 < this.dragMin) || (x0 > this.dragMax && !this.overSliding) || (x0 < this.dragMax && this.overSliding)) {
			return {select: this.getDragSelect()};
		} else {
			// based on HI request, add extra "friction" to drag when overSliding.
			if (this.overSliding && !this.dismissible) {
				// diminimish the user's drag to 1/4 strength
				var ldx = this.lastDragDx || 0;
				x0 = (e.dx - ldx) / 4 + this.slidePosition;
			}
			this.lastDragDx =  e.dx;
			var x = Math.max(this.dragMin, Math.min(x0, this.overSliding ? 1e9 : this.dragMax));
			this.pendingDragMove = this._drag(x);
		}
	},
	_drag: function(inX) {
		this.move(inX);
		this.pendingDragMove = null;
	},
	dragFinish: function() {
		return {select: this.getDragSelect()};
	},
	getDragSelect: function() {
		if (this.shouldDragSelect && !this.overSliding) {
			return this;
		} else {
			// select previous sibling if it is out of position or first
			var p = this.getPreviousSibling();
			return p && ((p.slidePosition < p.calcSlideMax()) || (p.index == 0)) ? p : null;
		}
	},
	// sizing
	// don't auto-adjust width if fixedWidth is true
	fixedWidthChanged: function() {
		if (this.fixedWidth) {
			this.applySize();
		}
	},
	minWidthChanged: function() {
		this.$.client.applyStyle("min-width", this.minWidth || null);
	},
	applySize: function(inSuggestFit, inStopResizePropagation) {
		var w;
		if (inSuggestFit && !this.fixedWidth) {
			w = this.calcFitWidth();
		} else if (this.$.client.domStyles.width) {
			w = null;
		}
		if (w !== undefined) {
			w = (w ? w + "px" : null);
			// apply fast-like
			if (this.$.client.hasNode()) {
				this.$.client.domStyles.width = this.$.client.node.style.width = w;
				if (!inStopResizePropagation) {
					this.doResize(w);
					this.broadcastToControls("resize");
				}
			}
		}
	},
	calcFitWidth: function() {
		var w = null;
		if (this.hasNode() && this.$.client.hasNode()) {
			var pw = this.parent.getBounds().width;
			var l = this.getLeftOffset();
			var s = Math.min(this.slidePosition || 0, 0);
			w = Math.max(0, Math.min(pw, pw - l - s));
		}
		return w;
	},
	clickHandler: function(inSender, inEvent) {
		var r;
		if (this.findSlidingHandler(inEvent.dispatchTarget)) {
			this.toggleSelected();
			r = true;
		}
		return this.doClick(inEvent) || r;
	},
	setShadowShowing: function(inShow) {
		this.$.shadow.setShowing(inShow);
	}
});
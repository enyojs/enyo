/**
	enyo.ScrollStrategy is a helper kind which implements a default scrolling strategy for an <a href="#enyo.Scroller">enyo.Scroller</a>.
	
	enyo.ScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.ScrollStrategy",
	noDom: true,
	events: {
		onScroll: "doScroll"
	},
	published: {
		/**
			Specifies how to horizontally scroll. Acceptable values are:
				
			* "scroll": always shows a scrollbar; sets overflow: scroll
			* "auto":  scrolls only if needed; sets overflow: auto
			* "hidden": never scrolls;  sets overflow: hidden
			* "default": same as auto.
		*/
		vertical: "default",
		/**
			Specifies how to vertically scroll. Acceptable values are:

			* "scroll": always shows a scrollbar; sets overflow: scroll
			* "auto":  scrolls only if needed; sets overflow: auto
			* "hidden": never scrolls;  sets overflow: hidden
			* "default": same as auto.
		*/
		horizontal: "default",
		scrollLeft: 0,
		scrollTop: 0
	},
	//* @protected
	handlers: {
		onscroll: "scroll",
		ondown: "down",
		onmove: "move"
	},
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
		this.container.setAttribute("onscroll", enyo.bubbler);
	},
	rendered: function() {
		this.inherited(arguments);
		this.scrollNode = this.calcScrollNode();
	},
	teardownRender: function() {
		this.inherited(arguments);
		this.scrollNode = null;
	},
	calcScrollNode: function() {
		return this.container.hasNode();
	},
	horizontalChanged: function() {
		this.container.applyStyle("overflow-x", this.horizontal == "default" ? "auto" : this.horizontal);
	},
	verticalChanged: function() {
		this.container.applyStyle("overflow-y", this.vertical == "default" ? "auto" : this.vertical);
	},
	scroll: function(inSender, e) {
		return this.doScroll(e);
	},
	scrollTo: function(inX, inY) {
		if (this.scrollNode) {
			this.setScrollLeft(inX);
			this.setScrollTop(inY);
		}
	},
	scrollIntoView: function(inControl, inAlignWithTop) {
		if (inControl.hasNode()) {
			inControl.node.scrollIntoView(inAlignWithTop);
		}
	},
	setScrollTop: function(inTop) {
		this.scrollTop = inTop;
		if (this.scrollNode) {
			this.scrollNode.scrollTop = this.scrollTop;
		}
	},
	setScrollLeft: function(inLeft) {
		this.scrollLeft = inLeft;
		if (this.scrollNode) {
			this.scrollNode.scrollLeft = this.scrollLeft;
		}
	},
	getScrollLeft: function() {
		return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
	},
	getScrollTop: function() {
		return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
	},
	getScrollBounds: function() {
		var n = this.scrollNode;
		var b = {
			left: this.getScrollLeft(),
			top: this.getScrollTop(),
			height: n ? n.scrollHeight : 0,
			width: n ? n.scrollWidth : 0
		};
		b.maxLeft = Math.max(0, b.width - n.clientWidth);
		b.maxTop = Math.max(0, b.height - n.clientHeight);
		return b;
	},
	// NOTE: down, move handlers are needed only for native touch scrollers
	// avoid allowing scroll when starting at a vertical boundary to prevent ios from window scrolling.
	down: function(inSender, inEvent) {
		// if we start on a boundary, need to check direction of first move
		var y = this.getScrollTop();
		this.atTopEdge = (y == 0);
		var sb = this.getScrollBounds();
		this.atBottomEdge = y == sb.maxTop;
		this.downY = inEvent.pageY;
		this.downX = inEvent.pageX;
		this.canVertical = sb.maxTop > 0 && this.vertical != "hidden";
		this.canHorizontal = sb.maxLeft > 0 && this.horizontal != "hidden";
	},
	// NOTE: mobile native scrollers need touchmove. Indicate this by 
	// setting the requireTouchmove property to true (must do this in move event 
	// because must respond to first move or native action fails).
	move: function(inSender, inEvent) {
		var dy = inEvent.pageY - this.downY;
		var dx = inEvent.pageX - this.downX;
		var v = this.canVertical, h = this.canHorizontal;
		// check to see if it is dragging vertically which would trigger window scrolling
		var isV = (Math.abs(dy) > 10) && (Math.abs(dy) > Math.abs(dx));
		// abort scroll if dragging oob from vertical edge
		if (isV && (v || h) && (this.atTopEdge || this.atBottomEdge)) {
			var oob = (this.atTopEdge && (dy >= 0) || this.atBottomEdge && (dy <= 0));
			// we only need to abort 1 event to prevent window native scrolling, but we
			// perform oob check around a small radius because a small in bounds move may 
			// not trigger scrolling for this scroller meaning the window might still scroll.
			if (Math.abs(dy) > 25) {
				this.atTopEdge = this.atBottomEdge = false;
			}
			if (oob) {
				return;
			}
		}
		inEvent.requireTouchmove = (v || h);
	}
});
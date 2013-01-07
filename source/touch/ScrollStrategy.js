/**
	_enyo.ScrollStrategy_ is a helper kind that implements a default scrolling
	strategy for an <a href="#enyo.Scroller">enyo.Scroller</a>.

	_enyo.ScrollStrategy_ is not typically created in application code.
	Instead, it is specified as the value of the `strategyKind` property of an
	`enyo.Scroller` or <a href="#enyo.List">enyo.List</a>, or is used by the
	framework implicitly.
*/
enyo.kind({
	name: "enyo.ScrollStrategy",
	tag: null,
	published: {
		/**
			Specifies how to vertically scroll.  Acceptable values are:

			* "scroll": Always shows a scrollbar; sets _overflow: scroll_.
			* "auto": Scrolls only if needed; sets _overflow: auto_.
			* "hidden": Never scrolls; sets _overflow: hidden_.
			* "default": Same as "auto".
		*/
		vertical: "default",
		/**
			Specifies how to horizontally scroll.  Acceptable values are:

			* "scroll": Always shows a scrollbar; sets _overflow: scroll_.
			* "auto": Scrolls only if needed; sets _overflow: auto_.
			* "hidden": Never scrolls; sets _overflow: hidden_.
			* "default": Same as "auto".
		*/
		horizontal: "default",
		//* Scroll position along horizontal axis
		scrollLeft: 0,
		//* Scroll position along vertical axis
		scrollTop: 0,
		//* Maximum height of scroll content
		maxHeight: null
	},
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondragfinish: "dragfinish",
		ondown: "down",
		onmove: "move"
	},
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
		this.maxHeightChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		enyo.makeBubble(this.container, "scroll");
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
	maxHeightChanged: function() {
		this.container.applyStyle("max-height", this.maxHeight);
	},
	scrollTo: function(inX, inY) {
		if (this.scrollNode) {
			this.setScrollLeft(inX);
			this.setScrollTop(inY);
		}
	},
	scrollToNode: function(inNode, inAlignWithTop) {
		if (this.scrollNode) {
			var sb = this.getScrollBounds();
			var n = inNode;
			var b = {height: n.offsetHeight, width: n.offsetWidth, top: 0, left: 0};
			while (n && n.parentNode && n.id != this.scrollNode.id) {
				b.top += n.offsetTop;
				b.left += n.offsetLeft;
				n = n.parentNode;
			}
			// By default, the element is scrolled to align with the top of the scroll area.
			this.setScrollTop(Math.min(sb.maxTop, inAlignWithTop === false ? b.top - sb.clientHeight + b.height : b.top));
			this.setScrollLeft(Math.min(sb.maxLeft, inAlignWithTop === false ? b.left - sb.clientWidth + b.width : b.left));
		}
	},
	scrollIntoView: function(inControl, inAlignWithTop) {
		if (inControl.hasNode()) {
			inControl.node.scrollIntoView(inAlignWithTop);
		}
	},
	isInView: function(inNode) {
		var sb = this.getScrollBounds();
		var ot = inNode.offsetTop;
		var oh = inNode.offsetHeight;
		var ol = inNode.offsetLeft;
		var ow = inNode.offsetWidth;
		return (ot >= sb.top && ot + oh <= sb.top + sb.clientHeight) && (ol >= sb.left && ol + ow <= sb.left + sb.clientWidth);
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
	_getScrollBounds: function() {
		var s = this.getScrollSize(), cn = this.container.hasNode();
		var b = {
			left: this.getScrollLeft(),
			top: this.getScrollTop(),
			clientHeight: cn ? cn.clientHeight : 0,
			clientWidth: cn ? cn.clientWidth : 0,
			height: s.height,
			width: s.width
		};
		b.maxLeft = Math.max(0, b.width - b.clientWidth);
		b.maxTop = Math.max(0, b.height - b.clientHeight);
		return b;
	},
	getScrollSize: function() {
		var n = this.scrollNode;
		return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
	},
	getScrollBounds: function() {
		return this._getScrollBounds();
	},
	calcStartInfo: function() {
		var sb = this.getScrollBounds();
		var y = this.getScrollTop(), x = this.getScrollLeft();
		this.canVertical = sb.maxTop > 0 && this.vertical != "hidden";
		this.canHorizontal = sb.maxLeft > 0 && this.horizontal != "hidden";
		this.startEdges = {
			top: y === 0,
			bottom: y === sb.maxTop,
			left: x === 0,
			right: x === sb.maxLeft
		};
	},
	// NOTE: down, move, and drag handlers are needed only for native touch scrollers
	shouldDrag: function(inEvent) {
		var requestV = inEvent.vertical;
		return (requestV && this.canVertical  || !requestV && this.canHorizontal) /*&& !this.isOobVerticalScroll(inEvent)*/;
	},
	dragstart: function(inSender, inEvent) {
		this.dragging = this.shouldDrag(inEvent);
		if (this.dragging) {
			return this.preventDragPropagation;
		}
	},
	dragfinish: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			inEvent.preventTap();
		}
	},
	// avoid allowing scroll when starting at a vertical boundary to prevent ios from window scrolling.
	down: function(inSender, inEvent) {
		this.calcStartInfo();
	},
	// NOTE: mobile native scrollers need touchmove. Indicate this by
	// setting the requireTouchmove property to true.
	move: function(inSender, inEvent) {
		if (inEvent.which && (this.canVertical && inEvent.vertical || this.canHorizontal && inEvent.horizontal)) {
			inEvent.disablePrevention();
		}
	}
});
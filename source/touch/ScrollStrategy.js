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
		onscroll: "scrollHandler",
		onmove: "moveHandler"
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
	// NOTE: mobile native scrollers need touchmove. Indicate this by 
	// setting the requireTouchmove property to true.
	moveHandler: function(inSender, inEvent) {
		inEvent.requireTouchmove = (this.vertical != "hidden") || (this.horizontal != "hidden");
	},
	scrollHandler: function(inSender, e) {
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
		return {
			left: this.getScrollLeft(),
			top: this.getScrollTop(),
			height: n ? n.scrollHeight : 0,
			width: n ? n.scrollWidth : 0
		};
	}
});

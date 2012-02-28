/**
*/
enyo.kind({
	name: "enyo.ScrollStrategy",
	kind: enyo.Control,
	events: {
		onScroll: "doScroll"
	},
	published: {
		vertical: true,
		horizontal: true,
		scrollLeft: 0,
		scrollTop: 0,
		nofit: false
	},
	handlers: {
		onscroll: "scrollHandler",
		onmove: "moveHandler"
	},
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
		this.nofitChanged();
		this.setAttribute("onscroll", enyo.bubbler);
	},
	nofitChanged: function() {
		this.addRemoveClass("enyo-fit", !this.nofit);
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
		return this.hasNode();
	},
	horizontalChanged: function() {
		this.applyStyle("overflow-x", this.horizontal ? "auto" : "hidden");
	},
	verticalChanged: function() {
		this.applyStyle("overflow-y", this.vertical ? "auto" : "hidden");
	},
	// NOTE: mobile native scrollers need touchmove. Indicate this by 
	// setting the requireTouchmove property to true.
	moveHandler: function(inSender, inEvent) {
		inEvent.requireTouchmove = true;
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

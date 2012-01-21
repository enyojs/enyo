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
		scrollTop: 0
	},
	handlers: {
		scroll: "scrollHandler"
	},
	create: function() {
		this.inherited(arguments);
		this.addClass("enyo-default-scroller");
		this.setAttribute("onscroll", enyo.bubbler);
	},
	horizontalChanged: function() {
		this.applyStyle("overflow-x", this.horizontal ? "auto" : "hidden");
	},
	verticalChanged: function() {
		this.applyStyle("overflow-y", this.vertical ? "auto" : "hidden");
	},
	scrollHandler: function(inSender, e) {
		return this.doScroll(e);
	},
	scrollTo: function(inX, inY) {
		if (this.hasNode()) {
			this.setScrollLeft(inX);
			this.setScrollTop(inY);
		}
	},
	scrollIntoView: function(inControl, inAlignWithTop) {
		if (inControl.hasNode()) {
			inControl.node.scrollIntoView(inAlignWithTop);
		}
	},
	scrollTopChanged: function() {
		if (this.hasNode()) {
			this.node.scrollTop = this.scrollTop;
		}
	},
	scrollLeftChanged: function() {
		if (this.hasNode()) {
			this.node.scrollLeft = this.scrollLeft;
		}
	},
	getScrollLeft: function() {
		return this.hasNode() ? this.node.scrollLeft : this.scrollLeft;
	},
	getScrollTop: function() {
		return this.hasNode() ? this.node.scrollTop : this.scrollTop;
	}
});
